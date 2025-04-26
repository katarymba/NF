import pandas as pd
from datetime import datetime, timedelta
from io import BytesIO
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import logging
from sqlalchemy.orm import Session
from app.models import Supplier, Product, PurchaseOrder, PurchaseOrderItem
from app.config import settings

logger = logging.getLogger("supplier-automation")

class SupplierAutomationService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_purchase_order(self, supplier_id: int, items: list, notes: str = ""):
        """
        Автоматическое создание заказа поставщику
        
        Args:
            supplier_id: ID поставщика
            items: Список товаров для заказа в формате [{"product_id": int, "quantity": int}, ...]
            notes: Дополнительные примечания к заказу
        
        Returns:
            dict: Информация о созданном заказе
        """
        try:
            # Получаем информацию о поставщике
            supplier = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if not supplier:
                return {"error": f"Поставщик с ID {supplier_id} не найден"}
            
            # Проверяем, что все товары существуют и доступны у этого поставщика
            valid_items = []
            invalid_items = []
            
            for item in items:
                product = self.db.query(Product).filter(
                    Product.id == item["product_id"],
                    Product.supplier_id == supplier_id
                ).first()
                
                if product:
                    valid_items.append({
                        "product_id": item["product_id"],
                        "product_name": product.name,
                        "quantity": item["quantity"],
                        "unit_price": product.purchase_price or product.price * 0.7  # Если нет цены закупки, берем 70% от розничной
                    })
                else:
                    invalid_product = self.db.query(Product).filter(Product.id == item["product_id"]).first()
                    invalid_items.append({
                        "product_id": item["product_id"],
                        "product_name": invalid_product.name if invalid_product else "Неизвестный товар",
                        "reason": "Товар не связан с этим поставщиком" if invalid_product else "Товар не найден"
                    })
            
            if not valid_items:
                return {"error": "Нет действительных товаров для заказа", "invalid_items": invalid_items}
            
            # Создаем заказ поставщику
            purchase_order = PurchaseOrder(
                supplier_id=supplier_id,
                order_date=datetime.now(),
                expected_delivery_date=datetime.now() + timedelta(days=supplier.lead_time or 7),
                status="draft",
                notes=notes,
                created_by_id=1  # ID пользователя, создавшего заказ
            )
            
            self.db.add(purchase_order)
            self.db.flush()  # Получаем ID заказа
            
            # Добавляем товары в заказ
            total_amount = 0
            for item in valid_items:
                order_item = PurchaseOrderItem(
                    purchase_order_id=purchase_order.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    total_price=item["quantity"] * item["unit_price"]
                )
                total_amount += order_item.total_price
                self.db.add(order_item)
            
            # Обновляем общую сумму заказа
            purchase_order.total_amount = total_amount
            
            # Сохраняем изменения
            self.db.commit()
            
            # Возвращаем информацию о созданном заказе
            return {
                "success": True,
                "purchase_order_id": purchase_order.id,
                "supplier": {
                    "id": supplier.id,
                    "name": supplier.name,
                    "email": supplier.email,
                    "phone": supplier.phone
                },
                "total_amount": total_amount,
                "items_count": len(valid_items),
                "invalid_items": invalid_items if invalid_items else None,
                "order_date": purchase_order.order_date,
                "expected_delivery_date": purchase_order.expected_delivery_date
            }
        
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error generating purchase order: {str(e)}")
            return {"error": f"Ошибка при создании заказа: {str(e)}"}
    
    def send_purchase_order_to_supplier(self, purchase_order_id: int):
        """
        Автоматическая отправка заказа поставщику по email
        
        Args:
            purchase_order_id: ID заказа поставщику
        
        Returns:
            dict: Результат отправки
        """
        try:
            # Получаем информацию о заказе и поставщике
            purchase_order = self.db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_order_id).first()
            if not purchase_order:
                return {"error": f"Заказ с ID {purchase_order_id} не найден"}
            
            supplier = self.db.query(Supplier).filter(Supplier.id == purchase_order.supplier_id).first()
            if not supplier:
                return {"error": f"Поставщик для заказа {purchase_order_id} не найден"}
            
            if not supplier.email:
                return {"error": f"Поставщик {supplier.name} не имеет email-адреса"}
            
            # Получаем товары заказа
            order_items = self.db.query(PurchaseOrderItem).filter(
                PurchaseOrderItem.purchase_order_id == purchase_order_id
            ).all()
            
            if not order_items:
                return {"error": f"Заказ {purchase_order_id} не содержит товаров"}
            
            # Формируем данные для Excel-файла
            order_data = []
            for item in order_items:
                product = self.db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    order_data.append({
                        "Код товара": product.sku or f"ID{product.id}",
                        "Наименование": product.name,
                        "Количество": item.quantity,
                        "Ед. изм.": product.unit or "шт.",
                        "Цена за ед.": item.unit_price,
                        "Сумма": item.total_price
                    })
            
            # Создаем Excel-файл с заказом
            df = pd.DataFrame(order_data)
            excel_buffer = BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='xlsxwriter') as writer:
                df.to_excel(writer, sheet_name='Заказ', index=False)
                worksheet = writer.sheets['Заказ']
                
                # Форматирование таблицы
                header_format = writer.book.add_format({
                    'bold': True, 
                    'align': 'center', 
                    'valign': 'vcenter',
                    'border': 1,
                    'bg_color': '#D9EAD3'
                })
                
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                    worksheet.set_column(col_num, col_num, len(value) + 5)
                
                # Добавляем итоговую строку
                total_row = len(df) + 1
                total_format = writer.book.add_format({'bold': True})
                total_sum_format = writer.book.add_format({'bold': True, 'num_format': '#,##0.00 ₽'})
                
                worksheet.write(total_row, 0, "ИТОГО:", total_format)
                worksheet.write_formula(
                    total_row, 
                    5, 
                    f'=SUM(F2:F{total_row})', 
                    total_sum_format
                )
                
                # Добавляем информацию о заказе
                info_row = total_row + 2
                worksheet.write(info_row, 0, f"Заказ №: {purchase_order.id}", total_format)
                worksheet.write(info_row + 1, 0, f"Дата заказа: {purchase_order.order_date.strftime('%d.%m.%Y')}")
                worksheet.write(info_row + 2, 0, f"Ожидаемая дата поставки: {purchase_order.expected_delivery_date.strftime('%d.%m.%Y')}")
                worksheet.write(info_row + 3, 0, f"Поставщик: {supplier.name}")
                
                if purchase_order.notes:
                    worksheet.write(info_row + 4, 0, f"Примечания: {purchase_order.notes}")
            
            excel_buffer.seek(0)
            
            # Создаем email
            msg = MIMEMultipart()
            msg['From'] = settings.EMAIL_SENDER
            msg['To'] = supplier.email
            msg['Subject'] = f'Заказ №{purchase_order.id} от компании "Север-Рыба"'
            
            # Добавляем текст письма
            current_date = datetime.now().strftime("%d.%m.%Y")
            email_body = f"""
            <html>
            <body>
                <p>Здравствуйте!</p>
                <p>Компания "Север-Рыба" направляет Вам заказ №{purchase_order.id} от {current_date}.</p>
                <p>Подробная информация о заказе содержится в прикрепленном файле.</p>
                <p>Ожидаемая дата поставки: {purchase_order.expected_delivery_date.strftime('%d.%m.%Y')}</p>
                <p>Пожалуйста, подтвердите получение заказа и возможность его исполнения в указанные сроки.</p>
                <br>
                <p>С уважением,<br>
                Компания "Север-Рыба"<br>
                Email: {settings.EMAIL_CONTACT}<br>
                Телефон: {settings.COMPANY_PHONE}</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(email_body, 'html'))
            
            # Прикрепляем Excel-файл
            attachment = MIMEBase('application', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            attachment.set_payload(excel_buffer.read())
            encoders.encode_base64(attachment)
            file_name = f"Заказ_{purchase_order.id}_{current_date}.xlsx"
            attachment.add_header('Content-Disposition', f'attachment; filename="{file_name}"')
            msg.attach(attachment)
            
            # Отправляем email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                
                server.send_message(msg)
            
            # Обновляем статус заказа
            purchase_order.status = "sent"
            purchase_order.email_sent_date = datetime.now()
            self.db.commit()
            
            logger.info(f"Purchase order #{purchase_order_id} successfully sent to {supplier.email}")
            
            return {
                "success": True,
                "message": f"Заказ №{purchase_order_id} успешно отправлен поставщику {supplier.name}",
                "supplier_email": supplier.email,
                "sent_date": purchase_order.email_sent_date
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error sending purchase order #{purchase_order_id}: {str(e)}")
            return {
                "error": f"Ошибка при отправке заказа: {str(e)}",
                "purchase_order_id": purchase_order_id
            }