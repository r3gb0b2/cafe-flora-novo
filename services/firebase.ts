import { Product, Table, TableStatus, Waiter, Order } from '../types';

export const initialWaiters: Waiter[] = [
  { id: 'waiter_1', name: 'João' },
  { id: 'waiter_2', name: 'Maria' },
  { id: 'waiter_3', name: 'Carlos' },
];

// Os dados de produtos, mesas e pedidos agora são carregados diretamente do Firestore.
// Para popular o banco de dados pela primeira vez, você pode adicionar documentos
// manualmente no Console do Firebase ou criar um script de seeding.
//
// Exemplo de estrutura de documento para a coleção 'products':
// { name: 'Café Espresso', price: 5.00, stock: 100, category: 'Bebidas' }
//
// Exemplo para a coleção 'tables':
// { name: 'Mesa 1', status: 'Disponível', orderId: null }
