(async function testOrder() {
  try {
    // Получаем токен
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    
    if (!token) {
      console.error('Нет токена для авторизации');
      return;
    }
    
    // Пробуем разные варианты данных
    const testStructures = [
      // 1. Самый простой вариант - только обязательные поля
      {
        name: "Минимальная структура",
        data: {
          total_amount: 100
        }
      },
      
      // 2. Пробуем без user_id
      {
        name: "Базовая структура без user_id",
        data: {
          total_amount: 100,
          status: "pending"
        }
      },
      
      // 3. Структура с items как пустым массивом
      {
        name: "С пустым массивом items",
        data: {
          total_amount: 100,
          status: "pending",
          items: []
        }
      },
      
      // 4. Пробуем integer вместо float для total_amount
      {
        name: "С целочисленной суммой",
        data: {
          total_amount: 100,
          status: "processing" // пробуем другой статус
        }
      },
      
      // 5. Пробуем с полем user
      {
        name: "С полем user",
        data: {
          total_amount: 100,
          status: "pending",
          user: {
            id: parseInt(localStorage.getItem('userId') || '0')
          }
        }
      }
    ];
    
    // Выполняем каждый тест
    for (const test of testStructures) {
      console.log(`\nТест: ${test.name}`);
      console.log('Отправляемые данные:', test.data);
      
      try {
        const response = await fetch('http://127.0.0.1:8000/orders', {
          method: 'POST',
          headers: {
            'Authorization': `${tokenType} ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(test.data)
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          console.log('%c✓ Успех!', 'color: green; font-weight: bold');
          console.log('Ответ:', responseData);
        } else {
          console.log('%c✗ Ошибка!', 'color: red; font-weight: bold');
          console.log('Код:', response.status);
          console.log('Ответ:', responseData);
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    }
  } catch (error) {
    console.error('Общая ошибка:', error);
  }
})();