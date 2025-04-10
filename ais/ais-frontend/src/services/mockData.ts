// src/services/mockData.ts

// Моковые данные категорий
export const mockCategories = [
    { id: 1, name: 'Свежая рыба' },
    { id: 2, name: 'Замороженная рыба' },
    { id: 3, name: 'Икра' },
    { id: 4, name: 'Консервы' },
    { id: 5, name: 'Морепродукты' }
  ];
  
  // Моковые данные товаров
  export const mockProducts = [
    {
      id: 1,
      name: 'Лосось свежий',
      description: 'Свежий лосось, выловленный в Баренцевом море',
      price: 1200,
      stock_quantity: 15,
      category_id: 1,
      category: { id: 1, name: 'Свежая рыба' },
      created_at: new Date().toISOString(),
      is_new: true,
      is_bestseller: false
    },
    {
      id: 2,
      name: 'Треска замороженная',
      description: 'Замороженное филе трески',
      price: 450,
      stock_quantity: 32,
      category_id: 2,
      category: { id: 2, name: 'Замороженная рыба' },
      is_new: false,
      is_bestseller: true
    },
    {
      id: 3,
      name: 'Икра лососевая',
      description: 'Красная икра высшего сорта',
      price: 2800,
      stock_quantity: 8,
      category_id: 3,
      category: { id: 3, name: 'Икра' },
      is_new: false,
      is_bestseller: true
    },
    {
      id: 4,
      name: 'Консервы из сайры',
      description: 'Сайра в собственном соку',
      price: 220,
      stock_quantity: 45,
      category_id: 4,
      category: { id: 4, name: 'Консервы' },
      is_new: false,
      is_bestseller: false
    },
    {
      id: 5,
      name: 'Креветки королевские',
      description: 'Крупные королевские креветки',
      price: 950,
      stock_quantity: 0,
      category_id: 5,
      category: { id: 5, name: 'Морепродукты' },
      is_new: true,
      is_bestseller: false
    }
  ];