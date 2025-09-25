
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Product, Table, TableStatus, Order, OrderItem, Waiter } from '../types';
import { initialProducts, initialTables, initialWaiters, initialOrders } from '../services/firebase';

interface DataContextType {
  products: Product[];
  tables: Table[];
  orders: Order[];
  waiters: Waiter[];
  getTableById: (id: number) => Table | undefined;
  getOpenOrderByTableId: (tableId: number) => Order | undefined;
  addProductToOrder: (tableId: number, product: Product, waiterId: string) => void;
  updateOrderItemQuantity: (orderId: string, productId: string, newQuantity: number) => void;
  removeOrderItem: (orderId: string, productId: string) => void;
  closeTable: (orderId: string, paymentMethod: string) => void;
  updateProduct: (updatedProduct: Product) => void;
  addProduct: (newProduct: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  addTable: () => void;
  removeTable: (tableId: number) => void;
  cancelOrder: (orderId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);

  const getTableById = useCallback((id: number) => tables.find(t => t.id === id), [tables]);

  const getOpenOrderByTableId = useCallback((tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return undefined;
    return orders.find(o => o.id === table.orderId && o.status === 'open');
  }, [tables, orders]);
  
  const addProductToOrder = useCallback((tableId: number, product: Product, waiterId: string) => {
      if (product.stock <= 0) {
          alert("Produto fora de estoque!");
          return;
      }
  
      setTables(prevTables => prevTables.map(t => t.id === tableId ? { ...t, status: TableStatus.Occupied } : t));
  
      const openOrder = getOpenOrderByTableId(tableId);
  
      if (openOrder) {
          setOrders(prevOrders => prevOrders.map(o => {
              if (o.id === openOrder.id) {
                  const existingItem = o.items.find(item => item.productId === product.id);
                  let newItems: OrderItem[];
                  if (existingItem) {
                      newItems = o.items.map(item =>
                          item.productId === product.id
                              ? { ...item, quantity: item.quantity + 1 }
                              : item
                      );
                  } else {
                      newItems = [...o.items, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }];
                  }
                  const newTotal = newItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
                  return { ...o, items: newItems, total: newTotal };
              }
              return o;
          }));
      } else {
          const newOrderId = `order_${Date.now()}`;
          const newOrder: Order = {
              id: newOrderId,
              tableId,
              waiterId,
              items: [{ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }],
              total: product.price,
              createdAt: new Date(),
              status: 'open',
          };
          setOrders(prev => [...prev, newOrder]);
          setTables(prev => prev.map(t => t.id === tableId ? { ...t, orderId: newOrderId, status: TableStatus.Occupied } : t));
      }

      setProducts(prevProducts => prevProducts.map(p => p.id === product.id ? {...p, stock: p.stock - 1} : p));

  }, [getOpenOrderByTableId]);

  const updateOrderItemQuantity = useCallback((orderId: string, productId: string, newQuantity: number) => {
    let stockChange = 0;

    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
            const item = o.items.find(i => i.productId === productId);
            if (!item) return o;
            
            stockChange = item.quantity - newQuantity;

            const newItems = o.items.map(i => i.productId === productId ? { ...i, quantity: newQuantity } : i).filter(i => i.quantity > 0);
            const newTotal = newItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
            return { ...o, items: newItems, total: newTotal };
        }
        return o;
    }));

    if (stockChange !== 0) {
        setProducts(prevProducts => prevProducts.map(p => p.id === productId ? {...p, stock: p.stock + stockChange} : p));
    }

  }, []);

  const removeOrderItem = (orderId: string, productId: string) => {
    updateOrderItemQuantity(orderId, productId, 0);
  };
  
  const closeTable = useCallback((orderId: string, paymentMethod: string) => {
    let closedOrder: Order | undefined;
    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
          closedOrder = { ...o, status: 'closed', closedAt: new Date(), paymentMethod };
          return closedOrder;
        }
        return o;
    }));

    if (closedOrder) {
      setTables(prevTables => prevTables.map(t =>
          t.orderId === orderId
              ? { ...t, status: TableStatus.Available, orderId: null }
              : t
      ));
    }
  }, []);

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      ...newProductData
    };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };
  
  const addTable = () => {
    const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const newTable: Table = {
      id: newId,
      name: `Mesa ${newId}`,
      status: TableStatus.Available,
      orderId: null
    };
    setTables([...tables, newTable]);
  };

  const removeTable = (tableId: number) => {
    const table = getTableById(tableId);
    if(table && table.status !== TableStatus.Available) {
      alert("Não é possível remover uma mesa que está em uso.");
      return;
    }
    setTables(tables.filter(t => t.id !== tableId));
  };

  const cancelOrder = (orderId: string) => {
      const orderToCancel = orders.find(o => o.id === orderId);
      if (!orderToCancel) return;

      // Return items to stock
      orderToCancel.items.forEach(item => {
          setProducts(prev => prev.map(p => 
              p.id === item.productId ? { ...p, stock: p.stock + item.quantity } : p
          ));
      });

      // Free up the table
      setTables(prev => prev.map(t => 
          t.id === orderToCancel.tableId ? { ...t, status: TableStatus.Available, orderId: null } : t
      ));

      // Remove the order
      setOrders(prev => prev.filter(o => o.id !== orderId));
  };


  const value = {
    products,
    tables,
    orders,
    waiters,
    getTableById,
    getOpenOrderByTableId,
    addProductToOrder,
    updateOrderItemQuantity,
    removeOrderItem,
    closeTable,
    updateProduct,
    addProduct,
    deleteProduct,
    addTable,
    removeTable,
    cancelOrder,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
   