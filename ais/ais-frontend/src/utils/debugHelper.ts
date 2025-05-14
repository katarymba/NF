// Создайте этот файл для отладки API запросов
export const logAPIError = (err: any) => {
  console.error("API Error:", err);
  
  if (err.response) {
    console.error("Статус:", err.response.status);
    console.error("Данные:", err.response.data);
    
    if (err.response.data && err.response.data.detail) {
      if (Array.isArray(err.response.data.detail)) {
        // Выводим ошибки валидации в удобном формате
        console.error("Ошибки валидации:");
        err.response.data.detail.forEach((item: any, index: number) => {
          console.error(`${index + 1}. Поле: ${item.loc.join('.')}, Сообщение: ${item.msg}, Тип: ${item.type}`);
        });
      } else {
        console.error("Сообщение об ошибке:", err.response.data.detail);
      }
    }
  }
  
  return err;
};