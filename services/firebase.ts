import { Product, Table, TableStatus, Waiter, Order } from '../types';

// Os dados de produtos, mesas, garçons e pedidos agora são carregados diretamente do Firestore.
// O arquivo seedData.ts é usado para popular o banco de dados na primeira execução.
//
// Exemplo de estrutura de documento para a coleção 'products':
// { name: 'Café Espresso', price: 5.00, stock: 100, category: 'Bebidas' }
//
// Exemplo para a coleção 'tables':
// { name: 'Mesa 1', status: 'Disponível', orderId: null }
//
// Exemplo para a coleção 'waiters':
// { name: 'João' }