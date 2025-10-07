import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, Table, TableStatus, Order, OrderItem, Waiter } from '../types';
import { initialWaiters } from '../services/firebase';
import { 
  getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, Timestamp, getDocs, writeBatch, query, where, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// @ts-ignore
const db = window.db;

interface DataContextType {
  products: Product[];
  tables: Table[];
  orders: Order[];
  waiters: Waiter[];
  isLoading: boolean;
  getTableById: (id: string) => Table | undefined;
  getOpenOrderByTableId: (tableId: string) => Order | undefined;
  addProductToOrder: (tableId: string, product: Product, waiterId: string) => Promise<void>;
  updateOrderItemQuantity: (orderId: string, productId: string, newQuantity: number) => Promise<void>;
  removeOrderItem: (orderId: string, productId: string) => Promise<void>;
  closeTable: (orderId: string, paymentMethod: string) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addTable: () => Promise<void>;
  removeTable: (tableId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState({ products: false, tables: false, orders: false });

  useEffect(() => {
     if (initialLoad.products && initialLoad.tables && initialLoad.orders) {
      setIsLoading(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    console.log("Setting up Firestore listeners. If you don't see data, check your Firebase config in index.html and your Firestore security rules.");
    
    const unsubProducts = onSnapshot(collection(db, "products"), 
      (snapshot) => {
        console.log(`Firestore update: Received ${snapshot.docs.length} products.`);
        const productsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                price: data.price,
                stock: data.stock,
                category: data.category,
            } as Product;
        });
        setProducts(productsData);
        setInitialLoad(prev => ({ ...prev, products: true }));
      },
      (error) => {
        console.error("Firestore (products) error: ", error.message);
        alert("Não foi possível carregar os produtos. Verifique suas regras de segurança do Firestore e a conexão com a internet.");
      }
    );

    const unsubTables = onSnapshot(collection(db, "tables"), 
      (snapshot) => {
        console.log(`Firestore update: Received ${snapshot.docs.length} tables.`);
        const tablesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                status: data.status,
                orderId: data.orderId,
            } as Table;
        });
        setTables(tablesData);
        setInitialLoad(prev => ({ ...prev, tables: true }));
      },
      (error) => {
        console.error("Firestore (tables) error: ", error.message);
        alert("Não foi possível carregar as mesas. Verifique suas regras de segurança do Firestore e a conexão com a internet.");
      }
    );
    
    const unsubOrders = onSnapshot(collection(db, "orders"), 
      (snapshot) => {
        console.log(`Firestore update: Received ${snapshot.docs.length} orders.`);
        const ordersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              tableId: data.tableId,
              items: data.items,
              total: data.total,
              waiterId: data.waiterId,
              createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
              closedAt: data.closedAt ? (data.closedAt as Timestamp).toDate() : undefined,
              paymentMethod: data.paymentMethod,
              status: data.status,
          } as Order;
        });
        setOrders(ordersData);
        setInitialLoad(prev => ({ ...prev, orders: true }));
      },
      (error) => {
        console.error("Firestore (orders) error: ", error.message);
        alert("Não foi possível carregar os pedidos. Verifique suas regras de segurança do Firestore e a conexão com a internet.");
      }
    );

    return () => {
      unsubProducts();
      unsubTables();
      unsubOrders();
    };
  }, []);

  const getTableById = useCallback((id: string) => tables.find(t => t.id === id), [tables]);

  const getOpenOrderByTableId = useCallback((tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return undefined;
    return orders.find(o => o.id === table.orderId && o.status === 'open');
  }, [tables, orders]);
  
  const addProductToOrder = async (tableId: string, product: Product, waiterId: string) => {
    setIsLoading(true);
    try {
        await runTransaction(db, async (transaction) => {
            const productRef = doc(db, 'products', product.id);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists() || productDoc.data().stock < 1) {
                throw new Error("Produto fora de estoque!");
            }
            const newStock = productDoc.data().stock - 1;

            const tableRef = doc(db, 'tables', tableId);
            const tableDoc = await transaction.get(tableRef);
            if (!tableDoc.exists()) throw new Error("Mesa não encontrada!");

            const orderId = tableDoc.data().orderId;

            if (orderId) {
                const orderRef = doc(db, 'orders', orderId);
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists() || orderDoc.data().status !== 'open') {
                    throw new Error("Pedido associado à mesa não está aberto ou não foi encontrado.");
                }
                const currentOrderData = orderDoc.data();
                const existingItem = currentOrderData.items.find((item: OrderItem) => item.productId === product.id);
                let newItems = existingItem
                    ? currentOrderData.items.map((item: OrderItem) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
                    : [...currentOrderData.items, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }];
                
                const newTotal = newItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
                transaction.update(orderRef, { items: newItems, total: newTotal });
            } else {
                const newOrderRef = doc(collection(db, 'orders'));
                const newOrderData = { tableId, waiterId, items: [{ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }], total: product.price, createdAt: serverTimestamp(), status: 'open' };
                transaction.set(newOrderRef, newOrderData);
                transaction.update(tableRef, { orderId: newOrderRef.id, status: TableStatus.Occupied });
            }
            transaction.update(productRef, { stock: newStock });
        });
    } catch (e: any) {
        console.error("Transaction failed: ", e.message);
        alert(e.message || "Não foi possível adicionar o item. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  };

  const updateOrderItemQuantity = async (orderId: string, productId: string, newQuantity: number) => {
    setIsLoading(true);
    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, 'orders', orderId);
            const productRef = doc(db, 'products', productId);

            const orderDoc = await transaction.get(orderRef);
            const productDoc = await transaction.get(productRef);

            if (!orderDoc.exists() || !productDoc.exists()) throw new Error("Pedido ou produto não encontrado.");

            const orderData = orderDoc.data();
            const item = orderData.items.find((i: OrderItem) => i.productId === productId);
            if (!item) return;

            const stockChange = item.quantity - newQuantity;
            const newStock = productDoc.data().stock + stockChange;

            if (newStock < 0) throw new Error(`Estoque insuficiente. Apenas ${productDoc.data().stock} unidades disponíveis.`);

            const newItems = orderData.items.map((i: OrderItem) => i.productId === productId ? { ...i, quantity: newQuantity } : i).filter((i: OrderItem) => i.quantity > 0);
            const newTotal = newItems.reduce((acc, currentItem) => acc + (currentItem.unitPrice * currentItem.quantity), 0);

            transaction.update(productRef, { stock: newStock });
            transaction.update(orderRef, { items: newItems, total: newTotal });
        });
    } catch (e: any) {
        console.error("Transaction failed: ", e.message);
        alert(e.message || "Não foi possível atualizar o item.");
    } finally {
        setIsLoading(false);
    }
  };

  const removeOrderItem = (orderId: string, productId: string) => updateOrderItemQuantity(orderId, productId, 0);
  
  const closeTable = async (orderId: string, paymentMethod: string) => {
    setIsLoading(true);
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        if(!orderDoc.exists()) throw new Error("Pedido não encontrado");

        const batch = writeBatch(db);
        batch.update(orderRef, { status: 'closed', closedAt: serverTimestamp(), paymentMethod });
        
        const tableRef = doc(db, 'tables', orderDoc.data().tableId);
        batch.update(tableRef, { status: TableStatus.Available, orderId: null });
        
        await batch.commit();
    } catch (e: any) {
        console.error("Error closing table: ", e.message);
        alert(e.message || "Não foi possível fechar a mesa.");
    } finally {
        setIsLoading(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setIsLoading(true);
    try {
        const productRef = doc(db, "products", updatedProduct.id);
        // Explicitly create a clean object to prevent circular reference errors.
        const dataToUpdate = {
          name: updatedProduct.name,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          category: updatedProduct.category,
        };
        await updateDoc(productRef, dataToUpdate);
    } catch (e: any) { 
      console.error("Falha ao atualizar produto:", e.message); 
      alert("Falha ao atualizar produto."); 
    }
    finally { setIsLoading(false); }
  };

  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'products'), newProductData);
    } catch (e: any) { 
      console.error("Falha ao adicionar produto:", e.message); 
      alert("Falha ao adicionar produto."); 
    }
    finally { setIsLoading(false); }
  };

  const deleteProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (e: any) { 
      console.error("Falha ao remover produto:", e.message); 
      alert("Falha ao remover produto."); 
    }
    finally { setIsLoading(false); }
  };
  
  const addTable = async () => {
    setIsLoading(true);
    try {
        // Fetch current table count to avoid race conditions with local state
        const tablesCollectionRef = collection(db, 'tables');
        const tablesSnapshot = await getDocs(tablesCollectionRef);
        const newTableNumber = tablesSnapshot.size + 1;
        const newTableData = { name: `Mesa ${newTableNumber}`, status: TableStatus.Available, orderId: null };
        await addDoc(collection(db, 'tables'), newTableData);
    } catch (e: any) { 
      console.error("Falha ao adicionar mesa:", e.message); 
      alert("Falha ao adicionar mesa."); 
    }
    finally { setIsLoading(false); }
  };

  const removeTable = async (tableId: string) => {
    setIsLoading(true);
    try {
      const table = tables.find(t => t.id === tableId);
      if(table && table.status !== TableStatus.Available) {
        throw new Error("Não é possível remover uma mesa que está em uso.");
      }
      await deleteDoc(doc(db, "tables", tableId));
    } catch (e: any) { 
      console.error("Falha ao remover mesa:", e.message); 
      alert(e.message || "Falha ao remover mesa."); 
    }
    finally { setIsLoading(false); }
  };

  const cancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) throw new Error("Pedido não encontrado.");

            const orderData = orderDoc.data();

            // Return items to stock
            for (const item of orderData.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const newStock = productDoc.data().stock + item.quantity;
                    transaction.update(productRef, { stock: newStock });
                }
            }

            // Free up the table
            const tableRef = doc(db, 'tables', orderData.tableId);
            transaction.update(tableRef, { status: TableStatus.Available, orderId: null });

            // Delete the order
            transaction.delete(orderRef);
        });
    } catch (e: any) {
        console.error("Transaction failed: ", e.message);
        alert(e.message || "Não foi possível cancelar o pedido.");
    } finally {
        setIsLoading(false);
    }
  };


  const value = { products, tables, orders, waiters, isLoading, getTableById, getOpenOrderByTableId, addProductToOrder, updateOrderItemQuantity, removeOrderItem, closeTable, updateProduct, addProduct, deleteProduct, addTable, removeTable, cancelOrder };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};