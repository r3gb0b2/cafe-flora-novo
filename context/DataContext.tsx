
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Product, Table, TableStatus, Order, OrderItem, Waiter } from '../types';
import { initialProducts, initialTables, initialWaiters, initialOrders } from '../services/firebase';

interface DataContextType {
  products: Product[];
  tables: Table[];
  orders: Order[];
  waiters: Waiter[];
  isLoading: boolean;
  getTableById: (id: number) => Table | undefined;
  getOpenOrderByTableId: (tableId: number) => Order | undefined;
  addProductToOrder: (tableId: number, product: Product, waiterId: string) => Promise<void>;
  updateOrderItemQuantity: (orderId: string, productId: string, newQuantity: number) => Promise<void>;
  removeOrderItem: (orderId: string, productId: string) => Promise<void>;
  closeTable: (orderId: string, paymentMethod: string) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addTable: () => Promise<void>;
  removeTable: (tableId: number) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_LATENCY = 400;

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);
  const [isLoading, setIsLoading] = useState(false);

  const getTableById = useCallback((id: number) => tables.find(t => t.id === id), [tables]);

  const getOpenOrderByTableId = useCallback((tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return undefined;
    return orders.find(o => o.id === table.orderId && o.status === 'open');
  }, [tables, orders]);
  
  const addProductToOrder = async (tableId: number, product: Product, waiterId: string) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    if (product.stock <= 0) {
        alert("Produto fora de estoque!");
        setIsLoading(false);
        return;
    }

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
    setTables(prevTables => prevTables.map(t => t.id === tableId ? { ...t, status: TableStatus.Occupied } : t));
    setIsLoading(false);
  };

  const updateOrderItemQuantity = async (orderId: string, productId: string, newQuantity: number) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
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
    setIsLoading(false);
  };

  const removeOrderItem = async (orderId: string, productId: string) => {
    // This function calls another async function, so it doesn't need its own loading logic.
    await updateOrderItemQuantity(orderId, productId, 0);
  };
  
  const closeTable = async (orderId: string, paymentMethod: string) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
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
    setIsLoading(false);
  };

  const updateProduct = async (updatedProduct: Product) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setIsLoading(false);
  };

  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      ...newProductData
    };
    setProducts([...products, newProduct]);
    setIsLoading(false);
  };

  const deleteProduct = async (productId: string) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    setProducts(products.filter(p => p.id !== productId));
    setIsLoading(false);
  };
  
  const addTable = async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const newTable: Table = {
      id: newId,
      name: `Mesa ${newId}`,
      status: TableStatus.Available,
      orderId: null
    };
    setTables([...tables, newTable]);
    setIsLoading(false);
  };

  const removeTable = async (tableId: number) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
    const table = getTableById(tableId);
    if(table && table.status !== TableStatus.Available) {
      alert("Não é possível remover uma mesa que está em uso.");
      setIsLoading(false);
      return;
    }
    setTables(tables.filter(t => t.id !== tableId));
    setIsLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, API_LATENCY));
      const orderToCancel = orders.find(o => o.id === orderId);
      if (!orderToCancel) {
        setIsLoading(false);
        return;
      }

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
      setIsLoading(false);
  };


  const value = {
    products,
    tables,
    orders,
    waiters,
    isLoading,
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
