import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { API_FULL_URL } from '../../services/api';

import {
    Product,
    StockItem,
    Warehouse,
    Category,
    ProductFilter
} from './interfaces';

// Константы
const CURRENT_DATE = '2025-06-24 17:38:24';
const CURRENT_USER = 'katarymba';

// Заглушки для категорий на основе предоставленных данных
const mockCategories = [
    { id: '1', name: 'Консервы', description: 'Рыбные консервы разных видов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '2', name: 'Икра', description: 'Икра различных видов рыб', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '3', name: 'Деликатесы', description: 'Рыбные деликатесы премиум-класса', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '4', name: 'Свежая рыба', description: 'Свежая охлажденная рыба', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '5', name: 'Замороженная рыба', description: 'Свежемороженая рыба различных видов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '6', name: 'Морепродукты', description: 'Различные виды морепродуктов', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '7', name: 'Полуфабрикаты', description: 'Рыбные полуфабрикаты готовые к приготовлению', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' },
    { id: '8', name: 'Копчёная рыба', description: 'Рыба холодного и горячего копчения', created_at: '2025-05-18T13:12:27Z', updated_at: '2025-05-26T17:30:51Z' }
];

// Склады
const mockWarehouses = [
    { id: '1', name: 'Основной склад', address: 'ул. Портовая, 15', city: 'Мурманск', created_at: '2025-01-05T10:00:00Z' },
    { id: '2', name: 'Холодильный склад №1', address: 'ул. Прибрежная, 8', city: 'Мурманск', created_at: '2025-01-05T10:15:00Z' },
    { id: '3', name: 'Транзитный склад', address: 'ул. Промышленная, 42', city: 'Санкт-Петербург', created_at: '2025-01-06T09:30:00Z' },
    { id: '4', name: 'Распределительный центр', address: 'Логистическая ул., 5', city: 'Москва', created_at: '2025-01-07T11:20:00Z' }
];

// Поставщики
const suppliers = [
    'Северный улов', 'Беломор-Фиш', 'Мурманский рыбокомбинат', 
    'Баренц-Маркет', 'Архангельский траулер', 'РыбаОпт', 
    'Дары моря', 'Полярная звезда', 'АкваТорг', 'Северная рыба'
];

// Функции для генерации случайных значений
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomDate = (start = new Date(2025, 0, 1), end = new Date()) => 
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

// Реальные товары на основе предоставленных данных
const realProducts = [
    { id: '1', sku: 'SR-001', name: 'Ассорти горбуша/сельдь', category_id: '1', category_name: 'Консервы', description: 'Ассорти из горбуши и сельди - разнообразие вкусов в одной банке.', unit: 'шт', price: 112, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '2', sku: 'SR-002', name: 'ВОБЛА ВЯЛЕНАЯ', category_id: '8', category_name: 'Копчёная рыба', description: 'Вяленая вобла - традиционная закуска с характерным вкусом.', unit: 'кг', price: 1390, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '3', sku: 'SR-003', name: 'ГОРБУША косичка х/к', category_id: '8', category_name: 'Копчёная рыба', description: 'Горбуша косичка холодного копчения - традиционный продукт с насыщенным вкусом.', unit: 'кг', price: 249, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '4', sku: 'SR-004', name: 'ГОРБУША Х/К п юг', category_id: '8', category_name: 'Копчёная рыба', description: 'Пласт горбуши холодного копчения - традиционный продукт с нежным вкусом и ароматом.', unit: 'кг', price: 1099.99, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '5', sku: 'SR-005', name: 'ЖЕРЕХ Х/К ПЛАСТ п бг', category_id: '8', category_name: 'Копчёная рыба', description: 'Пласт жереха холодного копчения - отличный выбор для гурманов, ценящих изысканные рыбные деликатесы.', unit: 'кг', price: 989, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '6', sku: 'SR-006', name: 'ЗУБАТКА Г/К кусок', category_id: '8', category_name: 'Копчёная рыба', description: 'Кусок зубатки горячего копчения - деликатес с плотной текстурой и выраженным вкусом.', unit: 'кг', price: 1399.99, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '7', sku: 'SR-007', name: 'ИКРА КЕТЫ с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра кеты - классический деликатес, богатый белком и полезными микроэлементами.', unit: 'кг', price: 13999, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '8', sku: 'SR-008', name: 'ИКРА КИЖУЧА с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра кижуча - деликатес высшего качества с ярким вкусом и ароматом.', unit: 'кг', price: 14999, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '9', sku: 'SR-009', name: 'Икра Сибирского осетра 113г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра сибирского осетра - изысканный деликатес с неповторимым вкусом.', unit: 'шт', price: 8490, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '10', sku: 'SR-010', name: 'Икра Сибирского осетра 125г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра сибирского осетра - изысканный деликатес с неповторимым вкусом.', unit: 'шт', price: 9500, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '11', sku: 'SR-011', name: 'Икра Сибирского осетра 500г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра сибирского осетра - изысканный деликатес с неповторимым вкусом.', unit: 'шт', price: 35000, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '12', sku: 'SR-012', name: 'Икра Сибирского осетра 57г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра сибирского осетра - изысканный деликатес с неповторимым вкусом.', unit: 'шт', price: 3990, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '13', sku: 'SR-013', name: 'Икра СТЕРЛЯДИ 100г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра стерляди - редкий деликатес премиум-класса.', unit: 'шт', price: 7800, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '14', sku: 'SR-014', name: 'Икра СТЕРЛЯДИ 50г с/с', category_id: '2', category_name: 'Икра', description: 'Слабосоленая икра стерляди - редкий деликатес премиум-класса.', unit: 'шт', price: 3900, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '15', sku: 'SR-015', name: 'ИКРА ТРЕСКИ АТЛ', category_id: '2', category_name: 'Икра', description: 'Икра трески атлантической - доступный и питательный продукт с приятным вкусом.', unit: 'кг', price: 199.99, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '16', sku: 'SR-016', name: "Котлета 'Царская' из СОМА", category_id: '7', category_name: 'Полуфабрикаты', description: 'Изысканная котлета Царская из мяса сома настоящий кулинарный шедевр для гурманов. Приготовлена из отборного филе речного сома с добавлением секретной смеси специй по старинному рецепту.', unit: 'шт', price: 599.99, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '17', sku: 'SR-017', name: 'ЛАНГУСТИНЫ без головы', category_id: '6', category_name: 'Морепродукты', description: 'Лангустины без головы - изысканный морепродукт с нежным мясом и сладковатым вкусом.', unit: 'кг', price: 1640, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '18', sku: 'SR-018', name: 'МИНТАЙ с/м', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженый минтай - диетическая рыба с низким содержанием жира и высоким содержанием белка.', unit: 'кг', price: 269.99, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '19', sku: 'SR-019', name: 'МОЙВА Г/К нп сг', category_id: '8', category_name: 'Копчёная рыба', description: 'Мойва горячего копчения - доступная и вкусная закуска с насыщенным ароматом копчения.', unit: 'кг', price: 969.99, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '20', sku: 'SR-020', name: 'МОРСИК 0,3л, 0.5л, 1л', category_id: '3', category_name: 'Деликатесы', description: 'Морсик - освежающий напиток на основе натуральных ягод.', unit: 'шт', price: 49, supplier: 'РыбаОпт', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '21', sku: 'SR-021', name: 'Набор «ПАТРИОТ»', category_id: '3', category_name: 'Деликатесы', description: 'Эксклюзивный набор деликатесов ПАТРИОТ создан для настоящих ценителей морепродуктов.', unit: 'шт', price: 1999, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '22', sku: 'SR-022', name: 'Набор «ПАТРИОТ»', category_id: '3', category_name: 'Деликатесы', description: 'Вторая версия набора', unit: 'шт', price: 2000, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '23', sku: 'SR-023', name: 'Навага-ЛЕДЯНАЯ', category_id: '5', category_name: 'Замороженная рыба', description: 'Ледяная навага, выловленная в чистых водах северных морей, отличается особой нежностью мяса и изысканным вкусом.', unit: 'кг', price: 199.99, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '24', sku: 'SR-024', name: 'ОКУНЬ МОРСКОЙ С/М', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженый морской окунь - рыба с нежным мясом и отличными вкусовыми качествами.', unit: 'кг', price: 549, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '25', sku: 'SR-025', name: 'ОСЁТР сибирский', category_id: '4', category_name: 'Свежая рыба', description: 'Сибирский осётр - редкая деликатесная рыба с особыми вкусовыми качествами.', unit: 'кг', price: 1699, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '26', sku: 'SR-026', name: 'ПАЛТУС охлажденный или с/м', category_id: '4', category_name: 'Свежая рыба', description: 'Палтус охлажденный или свежемороженый - диетическая рыба с нежным мясом.', unit: 'кг', price: 1790, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '27', sku: 'SR-027', name: 'ПЕЧЕНЬ ТРЕСКИ НАТУРАЛЬНАЯ ст.б', category_id: '1', category_name: 'Консервы', description: 'Натуральная печень трески - продукт премиум-класса, приготовленный по классической технологии.', unit: 'шт', price: 998, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '28', sku: 'SR-028', name: 'ПЕЧЕНЬ ТРЕСКИ ПО-МУРМАНСКИ ж.б', category_id: '1', category_name: 'Консервы', description: 'Печень трески по-мурмански - традиционный северный деликатес с богатым составом полезных веществ.', unit: 'шт', price: 499, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '29', sku: 'SR-029', name: 'СЕЛЬДЬ АТЛ. В МАСЛЕ ст.б', category_id: '1', category_name: 'Консервы', description: 'Атлантическая сельдь в масле - продукт премиум-класса в стеклянной банке.', unit: 'шт', price: 349, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '30', sku: 'SR-030', name: 'СЕЛЬДЬ в масле', category_id: '1', category_name: 'Консервы', description: 'Сельдь в масле - классический продукт с мягким вкусом.', unit: 'шт', price: 179, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '31', sku: 'SR-031', name: 'СЕЛЬДЬ ОЛЮТОРСКАЯ', category_id: '5', category_name: 'Замороженная рыба', description: 'Олюторская сельдь - один из лучших видов дальневосточной сельди.', unit: 'кг', price: 399, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '32', sku: 'SR-032', name: 'СЕЛЬДЬ ФИЛЕ КУСОЧКИ ПО-ФРАНЦУЗСКИ', category_id: '3', category_name: 'Деликатесы', description: 'Нежное филе сельди в ароматной заливке с добавлением трав и специй по французскому рецепту.', unit: 'упак', price: 349, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '33', sku: 'SR-033', name: 'СЁМГА С/С в/у пласт', category_id: '4', category_name: 'Свежая рыба', description: 'Слабосоленая сёмга в вакуумной упаковке - нежнейший продукт премиум-класса.', unit: 'кг', price: 3599.99, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '34', sku: 'SR-034', name: 'Скумбрия', category_id: '3', category_name: 'Деликатесы', description: 'Холодного копчения', unit: 'кг', price: 343, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '35', sku: 'SR-035', name: 'СКУМБРИЯ КОРОЛЕВСКАЯ Х/К', category_id: '8', category_name: 'Копчёная рыба', description: 'Королевская скумбрия холодного копчения - продукт с ярким вкусом и насыщенным ароматом.', unit: 'кг', price: 1099, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '36', sku: 'SR-036', name: 'СКУМБРИЯ косичка Х/К', category_id: '8', category_name: 'Копчёная рыба', description: 'Скумбрия косичка холодного копчения - удобный формат для подачи и употребления.', unit: 'шт', price: 165, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '37', sku: 'SR-037', name: 'СОМ Г/К КУСОК', category_id: '8', category_name: 'Копчёная рыба', description: 'Сом горячего копчения - сочное и ароматное мясо с характерным дымным ароматом.', unit: 'кг', price: 1089, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '38', sku: 'SR-038', name: 'СТЕЙК ЗУБАТКИ (синей) С/М', category_id: '5', category_name: 'Замороженная рыба', description: 'Стейк синей зубатки свежемороженый - продукт для приготовления разнообразных блюд.', unit: 'кг', price: 289, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '39', sku: 'SR-039', name: 'СТЕЙК СЁМГИ', category_id: '4', category_name: 'Свежая рыба', description: 'Стейк сёмги - премиальный продукт для приготовления изысканных блюд.', unit: 'кг', price: 2150, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '40', sku: 'SR-040', name: 'СТЕЙК ТРЕСКИ С/М', category_id: '5', category_name: 'Замороженная рыба', description: 'Стейк трески свежемороженый - натуральный продукт для приготовления полезных и вкусных блюд.', unit: 'кг', price: 590, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '41', sku: 'SR-041', name: 'СТЕЙК ФОРЕЛИ', category_id: '4', category_name: 'Свежая рыба', description: 'Стейк форели - сочный кусок рыбы идеальной толщины для запекания или жарки.', unit: 'кг', price: 1790, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '42', sku: 'SR-042', name: 'СУДАК ВЯЛЕНЫЙ', category_id: '8', category_name: 'Копчёная рыба', description: 'Вяленый судак - деликатес с плотной структурой и насыщенным вкусом.', unit: 'кг', price: 519, supplier: 'Беломор-Фиш', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '43', sku: 'SR-043', name: 'ТРЕСКА С/М', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженая треска - диетический продукт, богатый белком и полезными микроэлементами.', unit: 'кг', price: 579, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '44', sku: 'SR-044', name: 'ТРЕСКА филе-кусочки в масле', category_id: '1', category_name: 'Консервы', description: 'Филе-кусочки трески в масле - готовый к употреблению продукт высокого качества.', unit: 'шт', price: 239, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '45', sku: 'SR-045', name: 'Трио горбуша/сельдь/скумбрия', category_id: '1', category_name: 'Консервы', description: 'Трио из горбуши, сельди и скумбрии - идеальный выбор для разнообразия вкусов.', unit: 'шт', price: 105, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '46', sku: 'SR-046', name: 'ТУНЕЦ НАТУРАЛЬНЫЙ ст.б', category_id: '1', category_name: 'Консервы', description: 'Натуральный тунец в собственном соку - отличный источник белка и омега-3 жирных кислот.', unit: 'шт', price: 698, supplier: 'Северный улов', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '47', sku: 'SR-047', name: 'ФАЛАНГИ КАМЧАТСКОГО КРАБА', category_id: '6', category_name: 'Морепродукты', description: 'Фаланги камчатского краба - деликатес с нежным, сладковатым мясом.', unit: 'кг', price: 5900, supplier: 'Дары моря', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '48', sku: 'SR-048', name: 'ФИЛЕ МАСЛЯНОЙ КУСОК Х/К', category_id: '8', category_name: 'Копчёная рыба', description: 'Филе масляной рыбы холодного копчения отличается мягкой текстурой и богатым, насыщенным вкусом.', unit: 'кг', price: 2289, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '49', sku: 'SR-049', name: 'ФИЛЕ МИНТАЯ с/м', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженое филе минтая - диетический продукт без костей, готовый к приготовлению.', unit: 'кг', price: 419, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '50', sku: 'SR-050', name: 'Филе ПАЛТУСА с/м', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженое филе палтуса - диетический продукт с нежным вкусом.', unit: 'кг', price: 599, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '51', sku: 'SR-051', name: 'Филе ТРЕСКИ кубики', category_id: '5', category_name: 'Замороженная рыба', description: 'Кубики филе трески - удобный формат для приготовления различных блюд.', unit: 'кг', price: 589, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '52', sku: 'SR-052', name: 'ФИЛЕ ТРЕСКИ с/м на коже', category_id: '5', category_name: 'Замороженная рыба', description: 'Свежемороженое филе трески на коже - натуральный продукт высокого качества.', unit: 'кг', price: 579, supplier: 'Северная рыба', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '53', sku: 'SR-053', name: 'ФОРЕЛЬ КАРЕЛЬСКАЯ, ОХЛАЖДЕННАЯ', category_id: '4', category_name: 'Свежая рыба', description: 'Охлажденная карельская форель - свежая рыба высшего качества из экологически чистых водоемов Карелии.', unit: 'кг', price: 887, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '54', sku: 'SR-054', name: 'ФОРЕЛЬ С/С в/у пласт', category_id: '4', category_name: 'Свежая рыба', description: 'Слабосоленая форель в вакуумной упаковке - нежный продукт с изысканным вкусом.', unit: 'кг', price: 2789, supplier: 'Баренц-Маркет', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '55', sku: 'SR-055', name: 'ФОРЕЛЬ ТУШКА Х/К', category_id: '8', category_name: 'Копчёная рыба', description: 'Форель холодного копчения - изысканный деликатес с нежным, слегка сладковатым вкусом и тонким ароматом копчения.', unit: 'кг', price: 2789, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '56', sku: 'SR-056', name: 'ХРЕБТЫ ФОРЕЛИ Г/К', category_id: '8', category_name: 'Копчёная рыба', description: 'Хребты форели горячего копчения - настоящее лакомство для ценителей рыбных деликатесов.', unit: 'кг', price: 899.99, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '57', sku: 'SR-057', name: 'Щепа Бука', category_id: '3', category_name: 'Деликатесы', description: 'Щепа бука для копчения рыбы - придает изысканный аромат.', unit: 'упак', price: 95, supplier: 'РыбаОпт', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '58', sku: 'SR-058', name: 'Щепа Вишни', category_id: '3', category_name: 'Деликатесы', description: 'Щепа вишни для копчения рыбы - придает насыщенный фруктовый аромат.', unit: 'упак', price: 95, supplier: 'РыбаОпт', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '59', sku: 'SR-059', name: 'Щепа Ольхи', category_id: '3', category_name: 'Деликатесы', description: 'Щепа ольхи для копчения рыбы - классический вариант для создания традиционного аромата.', unit: 'упак', price: 75, supplier: 'РыбаОпт', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() },
    { id: '60', sku: 'SR-060', name: 'ЯЗЫК ТРЕСКИ ст.б', category_id: '3', category_name: 'Деликатесы', description: 'Язык трески в стеклянной банке - редкий деликатес, богатый полезными веществами.', unit: 'шт', price: 390, supplier: 'Мурманский рыбокомбинат', is_active: true, created_at: getRandomDate(), updated_at: getRandomDate() }
];

// Генерация складских запасов для 60 товаров
const generateStockItems = (products) => {
    const stockItems = [];
    let id = 1;
    
    // Для каждого товара создаем запасы на 1-3 случайных складах
    products.forEach(product => {
        const warehouseCount = getRandomInt(1, 3);
        const usedWarehouseIds = new Set();
        
        for (let i = 0; i < warehouseCount; i++) {
            // Выбираем случайный склад, которого еще нет у товара
            let warehouse;
            do {
                warehouse = getRandomElement(mockWarehouses);
            } while (usedWarehouseIds.has(warehouse.id));
            
            usedWarehouseIds.add(warehouse.id);
            
            const quantity = getRandomFloat(0, 500, 1);
            const minimumQuantity = getRandomFloat(10, 50, 1);
            const reorderLevel = getRandomFloat(minimumQuantity, minimumQuantity * 2, 1);
            
            // Определяем статус на основе количества
            let status;
            if (quantity === 0) {
                status = 'out-of-stock';
            } else if (quantity < minimumQuantity) {
                status = 'low-stock';
            } else if (quantity > minimumQuantity * 5) {
                status = 'over-stock';
            } else {
                status = 'in-stock';
            }
            
            stockItems.push({
                id: id.toString(),
                product_id: product.id,
                warehouse_id: warehouse.id,
                warehouse_name: warehouse.name,
                quantity,
                quantity_reserved: Math.random() < 0.3 ? getRandomFloat(0, quantity / 2, 1) : 0,
                minimum_quantity: minimumQuantity,
                reorder_level: reorderLevel,
                status,
                last_count_date: getRandomDate(),
                last_counted_by: getRandomElement(['katarymba', 'admin', 'operator1', 'manager'])
            });
            
            id++;
        }
    });
    
    return stockItems;
};

// Создаем запасы для реальных товаров
const mockStockItems = generateStockItems(realProducts);

interface StockManagementProps {
    isLoading: boolean;
    products: Product[];
    stockItems: StockItem[];
    warehouses: Warehouse[];
    categories: Category[];
    fetchData: () => Promise<void>;
    API_BASE_URL: string;
    getCurrentDateTime: () => string;
    getCurrentUser: () => string;
    determineStockStatus: (quantity: number, minQuantity: number) => string;
}

const StockManagement: React.FC<StockManagementProps> = ({
    isLoading: propIsLoading,
    products: propProducts,
    stockItems: propStockItems,
    warehouses: propWarehouses,
    categories: propCategories,
    fetchData: propFetchData,
    API_BASE_URL,
    getCurrentDateTime = () => CURRENT_DATE,
    getCurrentUser = () => CURRENT_USER,
    determineStockStatus = (quantity, minQuantity) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity < minQuantity) return 'low-stock';
        if (quantity > minQuantity * 5) return 'over-stock';
        return 'in-stock';
    }
}) => {
    // Используем заглушки для данных или реальные данные, если они предоставлены
    const [isLoading, setIsLoading] = useState(true);
    const [products] = useState(() => propProducts && propProducts.length ? propProducts : realProducts);
    const [stockItems] = useState(() => propStockItems && propStockItems.length ? propStockItems : mockStockItems);
    const [warehouses] = useState(() => propWarehouses && propWarehouses.length ? propWarehouses : mockWarehouses);
    const [categories] = useState(() => propCategories && propCategories.length ? propCategories : mockCategories);

    // Симуляция загрузки данных
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    // State for filters and sorting
    const [filters, setFilters] = useState<ProductFilter>({
        search: '',
        category_id: '',
        status: 'all',
        supplier: '',
        warehouse_id: '',
        sortBy: 'name',
        sortDirection: 'asc'
    });

    // State for modals
    const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
    const [showInventoryCountModal, setShowInventoryCountModal] = useState<boolean>(false);
    const [showProductDetailsModal, setShowProductDetailsModal] = useState<boolean>(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

    // State for new product
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        sku: '',
        name: '',
        category_id: '',
        unit: 'кг',
        price: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    // State for new stock item
    const [newStockItem, setNewStockItem] = useState<Partial<StockItem>>({
        product_id: '',
        warehouse_id: '',
        quantity: 0,
        minimum_quantity: 0,
        reorder_level: 0,
        status: 'in-stock'
    });

    // State for inventory count
    const [newInventoryCount, setNewInventoryCount] = useState<{
        product_id: string;
        warehouse_id: string;
        new_quantity: number;
        notes: string;
    }>({
        product_id: '',
        warehouse_id: '',
        new_quantity: 0,
        notes: ''
    });

    // Filter handlers
    const handleFilterChange = (name: keyof ProductFilter, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortChange = (field: string) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Reset form for new product
    const resetNewProductForm = () => {
        setNewProduct({
            sku: '',
            name: '',
            category_id: '',
            unit: 'кг',
            price: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        setNewStockItem({
            product_id: '',
            warehouse_id: '',
            quantity: 0,
            minimum_quantity: 0,
            reorder_level: 0,
            status: 'in-stock'
        });
    };

    // Selected product and its stocks
    const selectedProduct = useMemo(() => {
        if (!selectedProductId || !products.length) return null;
        return products.find(p => p.id === selectedProductId) || null;
    }, [selectedProductId, products]);

    const selectedProductStocks = useMemo(() => {
        if (!selectedProductId || !stockItems.length) return [];
        return stockItems.filter(item => item.product_id === selectedProductId);
    }, [selectedProductId, stockItems]);

    // Selected warehouse
    const selectedWarehouse = useMemo(() => {
        if (!selectedWarehouseId || !warehouses.length) return null;
        return warehouses.find(w => w.id === selectedWarehouseId) || null;
    }, [selectedWarehouseId, warehouses]);

    // Filtered stocks
    const filteredStockItems = useMemo(() => {
        if (!stockItems.length) return [];

        return stockItems.filter(item => {
            // Find product to get data about it
            const product = products.find(p => p.id === item.product_id);
            if (!product) return false;

            // Filter by search query
            if (
                filters.search &&
                !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !product.sku?.toLowerCase().includes(filters.search.toLowerCase())
            ) {
                return false;
            }

            // Filter by category
            if (filters.category_id && product.category_id !== filters.category_id) {
                return false;
            }

            // Filter by status
            if (filters.status !== 'all' && item.status !== filters.status) {
                return false;
            }

            // Filter by supplier
            if (filters.supplier && product.supplier !== filters.supplier) {
                return false;
            }

            // Filter by warehouse
            if (filters.warehouse_id && item.warehouse_id !== filters.warehouse_id) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            // Find products to get data about them
            const productA = products.find(p => p.id === a.product_id);
            const productB = products.find(p => p.id === b.product_id);
            if (!productA || !productB) return 0;

            // Sort by selected field
            switch (filters.sortBy) {
                case 'name':
                    return filters.sortDirection === 'asc'
                        ? productA.name.localeCompare(productB.name)
                        : productB.name.localeCompare(productA.name);
                case 'sku':
                    return filters.sortDirection === 'asc'
                        ? (productA.sku || '').localeCompare(productB.sku || '')
                        : (productB.sku || '').localeCompare(productA.sku || '');
                case 'quantity':
                    return filters.sortDirection === 'asc'
                        ? a.quantity - b.quantity
                        : b.quantity - a.quantity;
                case 'category':
                    return filters.sortDirection === 'asc'
                        ? (productA.category_name || '').localeCompare(productB.category_name || '')
                        : (productB.category_name || '').localeCompare(productA.category_name || '');
                case 'lastUpdated':
                    return filters.sortDirection === 'asc'
                        ? new Date(a.last_count_date || 0).getTime() - new Date(b.last_count_date || 0).getTime()
                        : new Date(b.last_count_date || 0).getTime() - new Date(a.last_count_date || 0).getTime();
                default:
                    return 0;
            }
        });
    }, [stockItems, products, filters]);

    // Add product handler (заглушка)
    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.category_id) {
            alert('Пожалуйста, заполните обязательные поля: Наименование, Категория');
            return;
        }

        try {
            // Имитация добавления товара
            setTimeout(() => {
                resetNewProductForm();
                setShowAddProductModal(false);
                alert('Товар успешно добавлен!');
            }, 500);
        } catch (err) {
            console.error("Error adding product:", err);
            alert('Ошибка при добавлении товара. Пожалуйста, попробуйте снова.');
        }
    };

    // Inventory count handler (заглушка)
    const handleInventoryCount = async () => {
        if (!newInventoryCount.product_id || !newInventoryCount.warehouse_id) {
            alert('Пожалуйста, выберите товар и склад');
            return;
        }

        try {
            // Имитация пересчета товара
            setTimeout(() => {
                setNewInventoryCount({
                    product_id: '',
                    warehouse_id: '',
                    new_quantity: 0,
                    notes: ''
                });
                setShowInventoryCountModal(false);
                alert('Пересчет товара успешно выполнен!');
            }, 500);
        } catch (err) {
            console.error("Error during inventory count:", err);
            alert('Ошибка при пересчете товара. Пожалуйста, попробуйте снова.');
        }
    };

    // Функции для форматирования данных
    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };

    return (
        <>
        {/* Filters and search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Поиск
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Поиск по названию или артикулу"
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Категория
                        </label>
                        <select
                            id="category"
                            value={filters.category_id}
                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все категории</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Статус
                        </label>
                        <select
                            id="status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="all">Все статусы</option>
                            <option value="in-stock">В наличии</option>
                            <option value="low-stock">Заканчивается</option>
                            <option value="out-of-stock">Отсутствует</option>
                            <option value="over-stock">Избыток</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Склад
                        </label>
                        <select
                            id="warehouse"
                            value={filters.warehouse_id}
                            onChange={(e) => handleFilterChange('warehouse_id', e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                            <option value="">Все склады</option>
                            {warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between mt-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Найдено: <span className="font-medium">{filteredStockItems.length}</span> позиций
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => setFilters({
                                search: '',
                                category_id: '',
                                status: 'all',
                                supplier: '',
                                warehouse_id: '',
                                sortBy: 'name',
                                sortDirection: 'asc'
                            })}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                        >
                            Сбросить фильтры
                        </button>

                        <button
                            onClick={() => setShowInventoryCountModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
                        >
                            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                            Пересчет товара
                        </button>

                        <button
                            onClick={() => setShowAddProductModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-1" />
                            Добавить товар
                        </button>
                    </div>
                </div>
            </div>

        {/* Products table */}
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('name')}
                                >
                                    Наименование
                                    {filters.sortBy === 'name' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('sku')}
                                >
                                    Артикул
                                    {filters.sortBy === 'sku' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('category')}
                                >
                                    Категория
                                    {filters.sortBy === 'category' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Склад
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('quantity')}
                                >
                                    Количество
                                    {filters.sortBy === 'quantity' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Цена
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Стоимость
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Статус
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                <div
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleSortChange('lastUpdated')}
                                >
                                                                        Обновлено
                                    {filters.sortBy === 'lastUpdated' && (
                                        filters.sortDirection === 'asc' ?
                                            <ChevronUpIcon className="h-4 w-4 ml-1" /> :
                                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStockItems.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Товары не найдены. Измените параметры поиска или добавьте новые товары.
                                </td>
                            </tr>
                        ) : (
                            filteredStockItems.map((item) => {
                                // Find product to get its data
                                const product = products.find(p => p.id === item.product_id);
                                if (!product) return null;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded-md object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                                                        <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                        {product.sr_sync && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                                    Север-Рыба
                                                                </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {product.supplier ? `Поставщик: ${product.supplier}` : 'Поставщик не указан'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{product.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{product.category_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{item.warehouse_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {item.quantity} {product.unit}
                                                {item.quantity_reserved && item.quantity_reserved > 0 && (
                                                    <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                            (зарез. {item.quantity_reserved})
                                                        </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Мин.: {item.minimum_quantity} / Уровень заказа: {item.reorder_level}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{formatPrice(product.price)}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">за {product.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {formatPrice(item.quantity * product.price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.status === 'in-stock' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                    ${item.status === 'low-stock' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                    ${item.status === 'out-of-stock' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                                    ${item.status === 'over-stock' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                `}>
                                                    {item.status === 'in-stock' && 'В наличии'}
                                                    {item.status === 'low-stock' && 'Заканчивается'}
                                                    {item.status === 'out-of-stock' && 'Отсутствует'}
                                                    {item.status === 'over-stock' && 'Избыток'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.last_count_date ? (
                                                <div>
                                                    <div>{formatDateTime(item.last_count_date)}</div>
                                                    <div className="text-xs">{item.last_counted_by}</div>
                                                </div>
                                            ) : (
                                                'Не проверялось'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedProductId(product.id);
                                                    setSelectedWarehouseId(item.warehouse_id);
                                                    setShowProductDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                            >
                                                Детали
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewInventoryCount({
                                                        product_id: product.id,
                                                        warehouse_id: item.warehouse_id,
                                                        new_quantity: item.quantity,
                                                        notes: ''
                                                    });
                                                    setShowInventoryCountModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            >
                                                Пересчет
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Inventory Count Modal */}
        {showInventoryCountModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                    </div>

                    {/* Modal */}
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                Пересчет товара
                            </h2>
                            <button onClick={() => setShowInventoryCountModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form content */}
                        <div className="px-6 py-4">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="count-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Товар <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="count-product"
                                        value={newInventoryCount.product_id}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, product_id: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите товар</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="count-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Склад <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="count-warehouse"
                                        value={newInventoryCount.warehouse_id}
                                        onChange={(e) => {
                                            const warehouseId = e.target.value;
                                            setNewInventoryCount({...newInventoryCount, warehouse_id: warehouseId});

                                            // If both product and warehouse are selected - find current quantity
                                            if (newInventoryCount.product_id && warehouseId) {
                                                const stockItem = stockItems.find(item => item.product_id === newInventoryCount.product_id &&
                                                    item.warehouse_id === warehouseId
                                                );

                                                if (stockItem) {
                                                    setNewInventoryCount(prev => ({...prev, new_quantity: stockItem.quantity}));
                                                } else {
                                                    setNewInventoryCount(prev => ({...prev, new_quantity: 0}));
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите склад</option>
                                        {warehouses.map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {newInventoryCount.product_id && newInventoryCount.warehouse_id && (
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            Текущее количество:
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {(() => {
                                                const stockItem = stockItems.find(item =>
                                                    item.product_id === newInventoryCount.product_id &&
                                                    item.warehouse_id === newInventoryCount.warehouse_id
                                                );

                                                if (stockItem) {
                                                    const product = products.find(p => p.id === newInventoryCount.product_id);
                                                    return `${stockItem.quantity} ${product ? product.unit : 'ед.'}`;
                                                } else {
                                                    return 'Товар отсутствует на этом складе';
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="new-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Новое количество <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="new-quantity"
                                        value={newInventoryCount.new_quantity}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, new_quantity: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="count-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Примечание
                                    </label>
                                    <textarea
                                        id="count-notes"
                                        value={newInventoryCount.notes}
                                        onChange={(e) => setNewInventoryCount({...newInventoryCount, notes: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Причина корректировки"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowInventoryCountModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleInventoryCount}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                disabled={!newInventoryCount.product_id || !newInventoryCount.warehouse_id}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Product Modal */}
        {showAddProductModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                    </div>

                    {/* Modal */}
                    <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        {/* Modal header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                Добавление нового товара
                            </h2>
                            <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form content */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Артикул (SKU) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="sku"
                                        value={newProduct.sku || ''}
                                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Например: FR-001"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Наименование <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newProduct.name || ''}
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Введите название товара"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Категория <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        value={newProduct.category_id || ''}
                                        onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Единица измерения
                                    </label>
                                    <select
                                        id="unit"
                                        value={newProduct.unit || 'кг'}
                                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                    >
                                        <option value="кг">кг (килограмм)</option>
                                        <option value="шт">шт (штука)</option>
                                        <option value="л">л (литр)</option>
                                        <option value="упак">упак (упаковка)</option>
                                        <option value="ящик">ящик</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Цена <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="price"
                                            value={newProduct.price || 0}
                                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">₽</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Поставщик
                                    </label>
                                    <input
                                        type="text"
                                        id="supplier"
                                        value={newProduct.supplier || ''}
                                        onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                                        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        placeholder="Название поставщика"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Первоначальный складской запас
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="stock-warehouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Склад
                                        </label>
                                        <select
                                            id="stock-warehouse"
                                            value={newStockItem.warehouse_id || ''}
                                            onChange={(e) => setNewStockItem({...newStockItem, warehouse_id: e.target.value})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="">Выберите склад</option>
                                            {warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="stock-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Количество
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-quantity"
                                            value={newStockItem.quantity || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, quantity: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="stock-min-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Минимальное количество
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-min-quantity"
                                            value={newStockItem.minimum_quantity || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, minimum_quantity: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="stock-reorder-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Уровень для заказа
                                        </label>
                                        <input
                                            type="number"
                                            id="stock-reorder-level"
                                            value={newStockItem.reorder_level || 0}
                                            onChange={(e) => setNewStockItem({...newStockItem, reorder_level: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAddProductModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md mr-2"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                Добавить товар
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Product Details Modal */}
            {showProductDetailsModal && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        {/* Modal */}
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            {/* Modal header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                    Детали товара
                                </h2>
                                <button onClick={() => setShowProductDetailsModal(false)} className="text-gray-400 hover:text-gray-500">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        {selectedProduct.image_url ? (
                                            <div className="aspect-w-1 aspect-h-1">
                                                <img
                                                    src={selectedProduct.image_url}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-center object-cover rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="col-span-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {selectedProduct.name}
                                                    {selectedProduct.sr_sync && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                            Север-Рыба
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Артикул: {selectedProduct.sku}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Категория</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.category_name}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Единица измерения</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.unit}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Цена</div>
                                                <div className="text-base text-gray-900 dark:text-white font-medium">{formatPrice(selectedProduct.price)}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">Поставщик</div>
                                                <div className="text-base text-gray-900 dark:text-white">{selectedProduct.supplier || 'Не указан'}</div>
                                            </div>
                                        </div>

                                        {/* Stock by warehouse */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Запасы по складам</h4>

                                            {selectedProductStocks.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                    <p>Товар отсутствует на складах</p>
                                                </div>
                                            ) : (
                                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Склад
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Количество
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Мин. кол-во
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Статус
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Действия
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {selectedProductStocks.map(stock => (
                                                            <tr key={stock.warehouse_id}>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                    {stock.warehouse_name}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                                                                    {stock.quantity} {selectedProduct.unit}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">
                                                                    {stock.minimum_quantity} {selectedProduct.unit}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                        ${stock.status === 'in-stock' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}
                                                                        ${stock.status === 'low-stock' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}
                                                                        ${stock.status === 'out-of-stock' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}
                                                                        ${stock.status === 'over-stock' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}
                                                                    `}>
                                                                        {stock.status === 'in-stock' && 'В наличии'}
                                                                        {stock.status === 'low-stock' && 'Заканчивается'}
                                                                        {stock.status === 'out-of-stock' && 'Отсутствует'}
                                                                        {stock.status === 'over-stock' && 'Избыток'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setNewInventoryCount({
                                                                                product_id: selectedProduct.id,
                                                                                warehouse_id: stock.warehouse_id,
                                                                                new_quantity: stock.quantity,
                                                                                notes: ''
                                                                            });
                                                                            setShowProductDetailsModal(false);
                                                                            setShowInventoryCountModal(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    >
                                                                        Пересчет
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Information */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Дополнительная информация</h4>

                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Дата создания</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatDateTime(selectedProduct.created_at)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Последнее обновление</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {formatDateTime(selectedProduct.updated_at)}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">Описание</div>
                                                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                                                            {selectedProduct.description || 'Описание не указано'}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">ID товара (для API)</div>
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {selectedProduct.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowProductDetailsModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StockManagement;