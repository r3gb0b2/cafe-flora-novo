
import { Product, Table, TableStatus, Waiter, Order } from '../types';

export const initialWaiters: Waiter[] = [
  { id: 'waiter_1', name: 'João' },
  { id: 'waiter_2', name: 'Maria' },
  { id: 'waiter_3', name: 'Carlos' },
];

export const initialProducts: Product[] = [
  { id: 'prod_1', name: 'Café Espresso', price: 5.00, stock: 100, category: 'Bebidas' },
  { id: 'prod_2', name: 'Cappuccino', price: 8.50, stock: 80, category: 'Bebidas' },
  { id: 'prod_3', name: 'Pão de Queijo', price: 4.00, stock: 120, category: 'Salgados' },
  { id: 'prod_4', name: 'Croissant', price: 7.00, stock: 50, category: 'Salgados' },
  { id: 'prod_5', name: 'Bolo de Chocolate', price: 9.00, stock: 30, category: 'Doces' },
  { id: 'prod_6', name: 'Suco de Laranja', price: 6.50, stock: 70, category: 'Bebidas' },
];

export const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Mesa ${i + 1}`,
  status: TableStatus.Available,
  orderId: null,
}));

export const initialOrders: Order[] = [];

// This file mocks a Firebase connection. In a real application, you would use
// the Firebase SDK to fetch and manipulate data from Firestore.
// For example:
// import { getFirestore, collection, getDocs } from "firebase/firestore"; 
// const db = getFirestore(app);
// const productsCol = collection(db, 'products');
// const productsSnapshot = await getDocs(productsCol);
// export const initialProducts = productsSnapshot.docs.map(doc => doc.data());
   