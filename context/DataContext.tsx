import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, Table, TableStatus, Order, OrderItem, Waiter } from '../types';
import { seedProducts, seedTables, seedWaiters } from '../services/seedData';
import { 
  getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, Timestamp, getDocs, writeBatch, query, where, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// @ts-ignore
const db = window.db;

type FirebaseStatus = 'connecting' | 'connected' | 'error';

interface DataContextType {
  products: Product[];
  tables: Table[];
  orders: Order[];
  waiters: Waiter[];
  isLoading: boolean;
  firebaseStatus: FirebaseStatus;
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
  addWaiter: (name: string) => Promise<void>;
  updateWaiter: (waiter: Waiter) => Promise<void>;
  deleteWaiter: (waiterId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState({ products: false, tables: false, orders: false, waiters: false });
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>('connecting');


  useEffect(() => {
     if (initialLoad.products && initialLoad.tables && initialLoad.orders && initialLoad.waiters) {
      setIsLoading(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    const setupAndSeed = async () => {
        try {
            const seedIfNeeded = async (collectionName: string, seedData: any[]) => {
                const snapshot = await getDocs(collection(db, collectionName));
                if (snapshot.empty) {
                    console.log(`Coleção '${collectionName}' vazia. Semeando com dados iniciais...`);
                    const batch = writeBatch(db);
                    seedData.forEach(item => {
                        const docRef = doc(collection(db, collectionName));
                        batch.set(docRef, item);
                    });
                    await batch.commit();
                    console.log(`Dados iniciais para '${collectionName}' semeados com sucesso.`);
                }
            };
            
            await seedIfNeeded("products", seedProducts);
            await seedIfNeeded("tables", seedTables);
            await seedIfNeeded("waiters", seedWaiters);

        } catch (error) {
            console.error("Erro ao semear o banco de dados:", error);
            setFirebaseStatus('error');
        }

        console.log("Setting up Firestore listeners. If you don't see data, check your Firebase config in index.html and your Firestore security rules.");
        
        const createListener = (collectionName: string, setter: Function, stateKey: string) => {
            return onSnapshot(collection(db, collectionName),
                (snapshot) => {
                    console.log(`Firestore update: Received ${snapshot.docs.length} ${collectionName}.`);
                    if (firebaseStatus === 'connecting') setFirebaseStatus('connected');
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setter(data);
                    setInitialLoad(prev => ({ ...prev, [stateKey]: true }));
                },
                (error) => {
                    console.error(`Firestore (${collectionName}) error: `, error.message);
                    setFirebaseStatus('error');
                }
            );
        };

        const unsubProducts = createListener("products", setProducts, "products");
        const unsubTables = createListener("tables", setTables, "tables");
        const unsubWaiters = createListener("waiters", setWaiters, "waiters");

        const unsubOrders = onSnapshot(collection(db, "orders"), 
          (snapshot) => {
            console.log(`Firestore update: Received ${snapshot.docs.length} orders.`);
            if (firebaseStatus === 'connecting') setFirebaseStatus('connected');
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
            setFirebaseStatus('error');
          }
        );

        return () => {
          unsubProducts();
          unsubTables();
          unsubOrders();
          unsubWaiters();
        };
    };
    
    setupAndSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            for (const item of orderData.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);
                if (productDoc.exists()) {
                    const newStock = productDoc.data().stock + item.quantity;
                    transaction.update(productRef, { stock: newStock });
                }
            }

            const tableRef = doc(db, 'tables', orderData.tableId);
            transaction.update(tableRef, { status: TableStatus.Available, orderId: null });
            transaction.delete(orderRef);
        });
    } catch (e: any) {
        console.error("Transaction failed: ", e.message);
        alert(e.message || "Não foi possível cancelar o pedido.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const addWaiter = async (name: string) => {
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'waiters'), { name });
    } catch (e: any) { 
      console.error("Falha ao adicionar garçom:", e.message); 
      alert("Falha ao adicionar garçom."); 
    }
    finally { setIsLoading(false); }
  };

  const updateWaiter = async (waiter: Waiter) => {
    setIsLoading(true);
    try {
      const waiterRef = doc(db, "waiters", waiter.id);
      await updateDoc(waiterRef, { name: waiter.name });
    } catch (e: any) { 
      console.error("Falha ao atualizar garçom:", e.message); 
      alert("Falha ao atualizar garçom."); 
    }
    finally { setIsLoading(false); }
  };

  const deleteWaiter = async (waiterId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "waiters", waiterId));
    } catch (e: any) { 
      console.error("Falha ao remover garçom:", e.message); 
      alert("Falha ao remover garçom."); 
    }
    finally { setIsLoading(false); }
  };

  const value = { products, tables, orders, waiters, isLoading, firebaseStatus, getTableById, getOpenOrderByTableId, addProductToOrder, updateOrderItemQuantity, removeOrderItem, closeTable, updateProduct, addProduct, deleteProduct, addTable, removeTable, cancelOrder, addWaiter, updateWaiter, deleteWaiter };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};