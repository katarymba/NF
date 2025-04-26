import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sqlalchemy.orm import Session
from app.models import OrderItem, Order, Product, StockMovement, MovementType
from app.database import get_db
import logging

logger = logging.getLogger("forecast-service")

class DemandForecastService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_historical_sales(self, product_id: int, days: int = 180):
        """Получение исторических данных о продажах товара"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Запрос данных о продажах из заказов
        sales_from_orders = self.db.query(
            OrderItem.order_id,
            Order.created_at.label("date"),
            OrderItem.quantity
        ).join(
            Order, OrderItem.order_id == Order.id
        ).filter(
            OrderItem.product_id == product_id,
            Order.created_at.between(start_date, end_date),
            Order.status.in_(["completed", "delivered", "shipped"])
        ).all()
        
        # Запрос данных о движении товара (продажи)
        sales_from_movements = self.db.query(
            StockMovement.id,
            StockMovement.created_at.label("date"),
            StockMovement.quantity
        ).filter(
            StockMovement.product_id == product_id,
            StockMovement.created_at.between(start_date, end_date),
            StockMovement.movement_type == MovementType.SALE
        ).all()
        
        # Формируем DataFrame
        sales_data = []
        
        # Добавляем данные из заказов
        for order_id, date, quantity in sales_from_orders:
            sales_data.append({
                "date": date.date(),
                "quantity": quantity
            })
        
        # Добавляем данные из движений товара
        for id, date, quantity in sales_from_movements:
            sales_data.append({
                "date": date.date(),
                "quantity": quantity
            })
        
        # Если данных нет, возвращаем пустой DataFrame
        if not sales_data:
            return pd.DataFrame()
        
        # Создаем DataFrame и группируем по дате
        df = pd.DataFrame(sales_data)
        daily_sales = df.groupby("date")["quantity"].sum().reset_index()
        
        # Преобразуем в временной ряд с ежедневными данными
        daily_sales["date"] = pd.to_datetime(daily_sales["date"])
        daily_sales = daily_sales.set_index("date")
        
        # Создаем полный диапазон дат и заполняем пропуски нулями
        date_range = pd.date_range(start=start_date.date(), end=end_date.date(), freq='D')
        full_range_sales = daily_sales.reindex(date_range, fill_value=0)
        
        return full_range_sales
    
    def generate_forecast(self, product_id: int, forecast_days: int = 30, history_days: int = 180):
        """Генерация прогноза спроса на основе исторических данных"""
        # Получаем информацию о товаре
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            logger.error(f"Product with ID {product_id} not found")
            return None
        
        # Получаем исторические данные
        historical_sales = self.get_historical_sales(product_id, history_days)
        
        if historical_sales.empty or historical_sales["quantity"].sum() == 0:
            logger.warning(f"No historical sales data for product {product_id}")
            return {
                "product_id": product_id,
                "product_name": product.name,
                "forecast_generated_at": datetime.now(),
                "forecast_period_days": forecast_days,
                "message": "Недостаточно исторических данных для прогноза",
                "forecast": []
            }
        
        try:
            # Сглаживаем данные для стабилизации временного ряда
            sales_ts = historical_sales["quantity"].astype(float)
            
            # Проверяем, есть ли сезонность
            try:
                # Пытаемся разложить временной ряд на компоненты
                decomposition = seasonal_decompose(sales_ts, model='additive', period=7)  # Недельный период
                seasonal = True
            except Exception as e:
                logger.warning(f"Could not perform seasonal decomposition: {str(e)}")
                seasonal = False
            
            # Выбираем модель прогнозирования в зависимости от наличия сезонности
            if seasonal:
                # Модель Holt-Winters с учетом сезонности
                model = ExponentialSmoothing(
                    sales_ts,
                    seasonal_periods=7,
                    trend='add',
                    seasonal='add',
                    use_boxcox=True,
                    initialization_method="estimated"
                )
            else:
                # Модель экспоненциального сглаживания без сезонности
                model = ExponentialSmoothing(
                    sales_ts,
                    trend='add',
                    initialization_method="estimated"
                )
            
            # Подгоняем модель к историческим данным
            model_fit = model.fit(optimized=True)
            
            # Генерируем прогноз
            forecast = model_fit.forecast(forecast_days)
            
            # Округляем значения прогноза и заменяем отрицательные значения нулями
            forecast = np.round(forecast).clip(min=0)
            
            # Форматируем результаты
            forecast_start_date = historical_sales.index[-1] + timedelta(days=1)
            forecast_dates = pd.date_range(start=forecast_start_date, periods=forecast_days, freq='D')
            
            forecast_results = []
            for date, value in zip(forecast_dates, forecast.values):
                forecast_results.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "predicted_quantity": int(value)
                })
            
            # Рассчитываем суммарный прогноз и статистику
            total_predicted = int(forecast.sum())
            avg_daily_predicted = float(forecast.mean())
            max_daily_predicted = int(forecast.max())
            
            result = {
                "product_id": product_id,
                "product_name": product.name,
                "forecast_generated_at": datetime.now(),
                "forecast_period_days": forecast_days,
                "summary": {
                    "total_predicted_quantity": total_predicted,
                    "avg_daily_predicted": avg_daily_predicted,
                    "max_daily_predicted": max_daily_predicted
                },
                "historical_data": {
                    "days_analyzed": history_days,
                    "total_quantity": int(historical_sales["quantity"].sum()),
                    "avg_daily_quantity": float(historical_sales["quantity"].mean()),
                    "max_daily_quantity": int(historical_sales["quantity"].max())
                },
                "forecast": forecast_results
            }
            
            return result
        
        except Exception as e:
            logger.error(f"Error generating forecast for product {product_id}: {str(e)}")
            return {
                "product_id": product_id,
                "product_name": product.name,
                "forecast_generated_at": datetime.now(),
                "forecast_period_days": forecast_days,
                "message": f"Ошибка при создании прогноза: {str(e)}",
                "forecast": []
            }
    
    def generate_purchase_recommendations(self, days_forecast: int = 30, days_coverage: int = 14):
        """
        Генерация рекомендаций по закупкам на основе прогноза спроса,
        текущих запасов и времени доставки
        """
        # Получаем все активные продукты
        products = self.db.query(Product).filter(Product.is_active == True).all()
        
        recommendations = []
        
        for product in products:
            try:
                # Получаем текущие запасы
                total_stock = self.db.query(
                    db.func.sum(Stock.quantity)
                ).filter(
                    Stock.product_id == product.id
                ).scalar() or 0
                
                # Получаем прогноз спроса
                forecast = self.generate_forecast(product.id, forecast_days=days_forecast)
                
                if not forecast or "message" in forecast:
                    # Если прогноз не удался, используем простое правило
                    # на основе среднего расхода за последние 30 дней
                    historical_sales = self.get_historical_sales(product.id, 30)
                    if historical_sales.empty:
                        # Если нет исторических данных, пропускаем
                        continue
                    
                    avg_daily_sales = historical_sales["quantity"].mean()
                    estimated_demand = avg_daily_sales * days_coverage
                else:
                    # Используем прогноз на период coverage_days
                    forecast_period = min(days_forecast, days_coverage)
                    estimated_demand = sum(
                        item["predicted_quantity"] 
                        for item in forecast["forecast"][:forecast_period]
                    )
                
                # Время доставки от поставщика (в днях) - можно хранить в БД
                lead_time = product.supplier_lead_time if hasattr(product, 'supplier_lead_time') else 7
                
                # Минимальный запас (в днях продаж) - можно хранить в БД
                safety_stock_days = product.safety_stock_days if hasattr(product, 'safety_stock_days') else 3
                
                # Рассчитываем страховой запас
                safety_stock = avg_daily_sales * safety_stock_days if 'avg_daily_sales' in locals() else 0
                
                # Рассчитываем рекомендуемое количество для закупки
                recommended_purchase = max(0, estimated_demand + safety_stock - total_stock)
                
                # Минимальный размер заказа поставщику - можно хранить в БД
                min_order_quantity = product.min_order_quantity if hasattr(product, 'min_order_quantity') else 1
                
                # Округляем до минимального размера заказа
                if recommended_purchase > 0:
                    recommended_purchase = max(min_order_quantity, recommended_purchase)
                
                # Добавляем рекомендацию
                if recommended_purchase > 0 or total_stock < safety_stock:
                    urgency = "High" if total_stock < safety_stock else "Medium" if total_stock < estimated_demand else "Low"
                    
                    recommendations.append({
                        "product_id": product.id,
                        "product_name": product.name,
                        "current_stock": total_stock,
                        "estimated_demand_days": days_coverage,
                        "estimated_demand_quantity": estimated_demand,
                        "safety_stock": safety_stock,
                        "lead_time_days": lead_time,
                        "recommended_purchase_quantity": int(recommended_purchase),
                        "urgency": urgency,
                        "estimated_stock_out_date": (
                            (datetime.now() + timedelta(days=int(total_stock / avg_daily_sales))) if avg_daily_sales > 0 else None
                        ) if 'avg_daily_sales' in locals() else None
                    })
            
            except Exception as e:
                logger.error(f"Error generating purchase recommendation for product {product.id}: {str(e)}")
        
        # Сортируем рекомендации по срочности и количеству
        recommendations.sort(
            key=lambda x: (
                0 if x["urgency"] == "High" else 1 if x["urgency"] == "Medium" else 2,
                -x["recommended_purchase_quantity"]
            )
        )
        
        return {
            "generated_at": datetime.now(),
            "coverage_days": days_coverage,
            "recommendations_count": len(recommendations),
            "recommendations": recommendations
        }