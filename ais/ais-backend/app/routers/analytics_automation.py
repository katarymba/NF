from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import pandas as pd
import numpy as np
from io import BytesIO
import matplotlib.pyplot as plt
import seaborn as sns
from fastapi.responses import StreamingResponse
from app.database import get_db
from app.models import Order, OrderItem, Product, Category, User, StockMovement, MovementType

router = APIRouter()
logger = logging.getLogger("analytics-automation")

@router.get("/automated-sales-report")
def generate_automated_sales_report(
    start_date: Optional[str] = Query(None, description="Начальная дата в формате YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Конечная дата в формате YYYY-MM-DD"),
    category_id: Optional[int] = Query(None, description="ID категории товаров"),
    export_format: str = Query("json", description="Формат экспорта: json, excel, pdf"),
    db: Session = Depends(get_db)
):
    """
    Автоматическая генерация отчета по продажам с возможностью экспорта
    """
    # Парсим даты
    if start_date:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        start_date = datetime.now() - timedelta(days=30)
    
    if end_date:
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    else:
        end_date = datetime.now()
    
    # Базовый запрос для заказов в указанном периоде
    query = db.query(
        Order, OrderItem, Product, Category
    ).join(
        OrderItem, Order.id == OrderItem.order_id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).join(
        Category, Product.category_id == Category.id
    ).filter(
        Order.created_at.between(start_date, end_date),
        Order.status.in_(["completed", "shipped", "delivered"])
    )
    
    # Фильтруем по категории, если указана
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Выполняем запрос
    results = query.all()
    
    # Преобразуем результаты в pandas DataFrame для анализа
    data = []
    for order, item, product, category in results:
        data.append({
            "order_id": order.id,
            "order_date": order.created_at,
            "product_id": product.id,
            "product_name": product.name,
            "category_id": category.id,
            "category_name": category.name,
            "quantity": item.quantity,
            "price": item.price,
            "total": item.quantity * item.price,
            "customer_id": order.user_id,
            "shipping_method": order.shipping_method
        })
    
    if not data:
        return {"message": "Нет данных для указанного периода"}
    
    df = pd.DataFrame(data)
    
    # Агрегируем данные для отчета
    report = {
        "period": {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        },
        "summary": {
            "total_sales": df["total"].sum(),
            "total_orders": df["order_id"].nunique(),
            "total_products_sold": df["quantity"].sum(),
            "average_order_value": df.groupby("order_id")["total"].sum().mean()
        },
        "sales_by_category": df.groupby("category_name").agg({
            "total": "sum",
            "quantity": "sum",
            "order_id": pd.Series.nunique
        }).rename(columns={
            "total": "revenue",
            "quantity": "units_sold",
            "order_id": "order_count"
        }).sort_values("revenue", ascending=False).to_dict("index"),
        "top_products": df.groupby(["product_id", "product_name"]).agg({
            "total": "sum",
            "quantity": "sum"
        }).sort_values("total", ascending=False).head(10).reset_index().rename(columns={
            "total": "revenue",
            "quantity": "units_sold"
        }).to_dict("records"),
        "sales_by_day": df.groupby(df["order_date"].dt.date).agg({
            "total": "sum",
            "order_id": pd.Series.nunique
        }).rename(columns={
            "total": "revenue",
            "order_id": "order_count"
        }).to_dict("index")
    }
    
    # Преобразуем даты обратно в строки для сериализации JSON
    report["sales_by_day"] = {
        date.strftime("%Y-%m-%d"): values 
        for date, values in report["sales_by_day"].items()
    }
    
    # Экспорт в нужном формате
    if export_format == "json":
        return report
    elif export_format == "excel":
        # Создаем Excel-файл с несколькими листами
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Лист с сводной информацией
            summary_df = pd.DataFrame([report["summary"]])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Лист с продажами по категориям
            categories_df = pd.DataFrame(report["sales_by_category"]).T.reset_index()
            categories_df.rename(columns={'index': 'category_name'}, inplace=True)
            categories_df.to_excel(writer, sheet_name='Sales by Category', index=False)
            
            # Лист с топовыми продуктами
            top_products_df = pd.DataFrame(report["top_products"])
            top_products_df.to_excel(writer, sheet_name='Top Products', index=False)
            
            # Лист с продажами по дням
            daily_sales_df = pd.DataFrame(report["sales_by_day"]).T.reset_index()
            daily_sales_df.rename(columns={'index': 'date'}, inplace=True)
            daily_sales_df.to_excel(writer, sheet_name='Daily Sales', index=False)
            
            # Лист с исходными данными
            df.to_excel(writer, sheet_name='Raw Data', index=False)
        
        output.seek(0)
        filename = f"sales_report_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.xlsx"
        
        return StreamingResponse(
            output, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    elif export_format == "pdf":
        # Для PDF создаем визуализацию с графиками
        plt.figure(figsize=(11.7, 8.3))  # A4 size
        
        # Настраиваем стиль
        sns.set(style="whitegrid")
        
        # График 1: Выручка по категориям
        plt.subplot(2, 2, 1)
        categories_df = pd.DataFrame(report["sales_by_category"]).T.reset_index()
        categories_df.rename(columns={'index': 'category_name'}, inplace=True)
        categories_df = categories_df.sort_values('revenue', ascending=False)
        sns.barplot(x='revenue', y='category_name', data=categories_df.head(5))
        plt.title('Выручка по категориям (Топ-5)')
        plt.tight_layout()
        
        # График 2: Топ-5 продуктов
        plt.subplot(2, 2, 2)
        top_products_df = pd.DataFrame(report["top_products"])
        sns.barplot(x='revenue', y='product_name', data=top_products_df.head(5))
        plt.title('Топ-5 продуктов по выручке')
        plt.tight_layout()
        
        # График 3: Динамика продаж по дням
        plt.subplot(2, 1, 2)
        daily_sales_df = pd.DataFrame(report["sales_by_day"]).T.reset_index()
        daily_sales_df.rename(columns={'index': 'date'}, inplace=True)
        daily_sales_df['date'] = pd.to_datetime(daily_sales_df['date'])
        daily_sales_df = daily_sales_df.sort_values('date')
        plt.plot(daily_sales_df['date'], daily_sales_df['revenue'])
        plt.title('Динамика продаж за период')
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Сохраняем в BytesIO
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='pdf')
        img_buffer.seek(0)
        
        filename = f"sales_report_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"
        
        return StreamingResponse(
            img_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        return {"message": f"Неподдерживаемый формат: {export_format}"}

@router.get("/customer-segmentation")
def generate_customer_segmentation(
    min_orders: int = Query(1, description="Минимальное количество заказов для анализа"),
    days: int = Query(180, description="Период анализа в днях"),
    db: Session = Depends(get_db)
):
    """
    Автоматическая сегментация клиентов на основе их покупательского поведения
    (RFM-анализ: Recency, Frequency, Monetary)
    """
    # Определяем период анализа
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Получаем данные по заказам
    orders = db.query(
        Order.id, Order.user_id, Order.created_at, Order.total_price
    ).filter(
        Order.created_at.between(start_date, end_date),
        Order.status.in_(["completed", "shipped", "delivered"]),
        Order.user_id.isnot(None)
    ).all()
    
    if not orders:
        return {"message": "Недостаточно данных для анализа"}
    
    # Создаем DataFrame
    df = pd.DataFrame([
        {"order_id": o.id, "user_id": o.user_id, "date": o.created_at, "total": o.total_price}
        for o in orders
    ])
    
    # Агрегируем данные по пользователям
    user_stats = df.groupby('user_id').agg({
        'date': lambda x: (end_date - x.max()).days,  # Recency - дни с последней покупки
        'order_id': 'count',                          # Frequency - количество заказов
        'total': 'sum'                                # Monetary - общая сумма расходов
    }).rename(columns={
        'date': 'recency',
        'order_id': 'frequency',
        'total': 'monetary'
    })
    
    # Фильтруем пользователей с минимальным количеством заказов
    user_stats = user_stats[user_stats['frequency'] >= min_orders]
    
    if len(user_stats) < 5:  # Слишком мало данных для анализа
        return {"message": "Недостаточно клиентов с требуемым количеством заказов"}
    
    # Квантильное распределение для RFM-сегментации
    quantiles = {
        'recency': [0.2, 0.4, 0.6, 0.8],
        'frequency': [0.2, 0.4, 0.6, 0.8],
        'monetary': [0.2, 0.4, 0.6, 0.8]
    }
    
    # Функция для оценки по квантилям (5 - лучшее, 1 - худшее)
    def rfm_score(x, col):
        if col == 'recency':
            # Для recency меньше значит лучше
            if x <= user_stats[col].quantile(quantiles[col][0]):
                return 5
            elif x <= user_stats[col].quantile(quantiles[col][1]):
                return 4
            elif x <= user_stats[col].quantile(quantiles[col][2]):
                return 3
            elif x <= user_stats[col].quantile(quantiles[col][3]):
                return 2
            else:
                return 1
        else:
            # Для frequency и monetary больше значит лучше
            if x >= user_stats[col].quantile(quantiles[col][3]):
                return 5
            elif x >= user_stats[col].quantile(quantiles[col][2]):
                return 4
            elif x >= user_stats[col].quantile(quantiles[col][1]):
                return 3
            elif x >= user_stats[col].quantile(quantiles[col][0]):
                return 2
            else:
                return 1
    
    # Рассчитываем оценки RFM
    rfm_scores = user_stats.copy()
    for col in ['recency', 'frequency', 'monetary']:
        col_score = col + '_score'
        rfm_scores[col_score] = rfm_scores[col].apply(lambda x: rfm_score(x, col))
    
    # Создаем RFM-сегменты
    rfm_scores['rfm_score'] = (
        rfm_scores['recency_score'].astype(str) + 
        rfm_scores['frequency_score'].astype(str) + 
        rfm_scores['monetary_score'].astype(str)
    )
    
    # Определяем сегменты клиентов
    segment_map = {
        '555': 'Champions',
        '554': 'Champions',
        '544': 'Champions',
        '545': 'Champions',
        
        '543': 'Loyal',
        '454': 'Loyal',
        '455': 'Loyal',
        '444': 'Loyal',
        
        '535': 'Potential Loyalists',
        '534': 'Potential Loyalists',
        '435': 'Potential Loyalists',
        '434': 'Potential Loyalists',
        
        '553': 'New Customers',
        '552': 'New Customers',
        '551': 'New Customers',
        
        '433': 'Promising',
        '432': 'Promising',
        '423': 'Promising',
        '422': 'Promising',
        
        '333': 'Customers Needing Attention',
        '332': 'Customers Needing Attention',
        '323': 'Customers Needing Attention',
        '322': 'Customers Needing Attention',
        
        '331': 'At Risk',
        '321': 'At Risk',
        '312': 'At Risk',
        
        '311': 'Cant Lose Them',
        '221': 'Cant Lose Them',
        
        '111': 'Lost',
        '112': 'Lost',
        '121': 'Lost',
        '122': 'Lost',
        '123': 'Lost',
        '132': 'Lost',
        '211': 'Lost',
    }
    
    # Применяем карту сегментов или назначаем 'Other'
    rfm_scores['segment'] = rfm_scores['rfm_score'].map(segment_map)
    rfm_scores['segment'].fillna('Other', inplace=True)
    
    # Добавляем информацию о клиентах
    users = db.query(
        User.id, User.name, User.email, User.phone
    ).filter(
        User.id.in_([int(uid) for uid in rfm_scores.index])
    ).all()
    
    user_info = {
        u.id: {"name": u.name, "email": u.email, "phone": u.phone}
        for u in users
    }
    
    # Итоговый результат
    result = {
        "segments_distribution": rfm_scores['segment'].value_counts().to_dict(),
        "segments_data": {
            segment: rfm_scores[rfm_scores['segment'] == segment].index.tolist()
            for segment in rfm_scores['segment'].unique()
        },
        "customer_data": {
            int(user_id): {
                "name": user_info.get(int(user_id), {}).get("name", "Unknown"),
                "email": user_info.get(int(user_id), {}).get("email", ""),
                "phone": user_info.get(int(user_id), {}).get("phone", ""),
                "segment": row['segment'],
                "rfm_score": row['rfm_score'],
                "metrics": {
                    "recency": row['recency'],
                    "frequency": row['frequency'],
                    "monetary": row['monetary']
                }
            }
            for user_id, row in rfm_scores.iterrows()
        }
    }
    
    return result