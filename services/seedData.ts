import { TableStatus } from '../types';

// Os dados a seguir são usados para popular o banco de dados na primeira vez que o aplicativo é executado.
// O campo 'id' será gerado automaticamente pelo Firestore, portanto, não é incluído aqui.

export const seedProducts = [
  { name: 'Café Espresso', price: 5.00, stock: 100, category: 'Bebidas' },
  { name: 'Cappuccino Italiano', price: 8.50, stock: 80, category: 'Bebidas' },
  { name: 'Pão de Queijo (Unidade)', price: 4.00, stock: 150, category: 'Salgados' },
  { name: 'Croissant Tradicional', price: 7.00, stock: 60, category: 'Salgados' },
  { name: 'Bolo de Chocolate (Fatia)', price: 9.00, stock: 40, category: 'Doces' },
  { name: 'Suco de Laranja Natural (300ml)', price: 7.50, stock: 90, category: 'Bebidas' },
  { name: 'Torta de Frango (Fatia)', price: 12.00, stock: 50, category: 'Salgados' },
  { name: 'Brownie com Sorvete', price: 15.00, stock: 35, category: 'Doces' },
  { name: 'Água Mineral sem Gás', price: 3.50, stock: 200, category: 'Bebidas' },
  { name: 'Misto Quente', price: 10.00, stock: 70, category: 'Salgados' },
];

export const seedTables = [
  { name: 'Mesa 1', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 2', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 3', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 4', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 5', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 6', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 7', status: TableStatus.Available, orderId: null },
  { name: 'Mesa 8', status: TableStatus.Available, orderId: null },
];

export const seedWaiters = [
  { name: 'João' },
  { name: 'Maria' },
  { name: 'Carlos' },
];
