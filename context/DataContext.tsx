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
  loadingError: string | null;
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
  seedDatabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState({ products: false, tables: false, orders: false, waiters: false });
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>('connecting');
  
  // Helper to safely convert Firestore docs to plain JS objects, preventing circular reference errors.
  const processDoc = (doc: any) => {
    const data = doc.data();
    const plainData: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // Convert Firestore Timestamps to JS Date objects using duck typing for reliability.
        if (value && typeof value.toDate === 'function') {
          plainData[key] = value.toDate();
        } else {
          plainData[key] = value;
        }
      }
    }
    return { id: doc.id, ...plainData };
  };

  useEffect(() => {
     if (initialLoad.products && initialLoad.tables && initialLoad.orders && initialLoad.waiters) {
      setIsLoading(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
        // Only show a timeout error if we are still loading AND the status hasn't changed to 'connected'.
        // This prevents a false positive error on slow connections that are actually working.
        if (isLoading && firebaseStatus === 'connecting') {
            console.error("Firebase connection timed out after 15 seconds.");
            setLoadingError("A conexão com o banco de dados está demorando mais que o esperado. Verifique sua conexão à internet e a configuração do Firebase no arquivo 'index.html'.");
            setIsLoading(false);
            setFirebaseStatus('error');
        }
    }, 15000);

    const unsubscribers: (() => void)[] = [];

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

        console.log("Setting up Firestore listeners. If you don't see data, check your Firebase config in index.html and your Firestore security rules.");
        
        const createListener = (collectionName: string, setter: Function, stateKey: string) => {
            const unsubscribe = onSnapshot(collection(db, collectionName),
                (snapshot) => {
                    console.log(`Firestore update: Received ${snapshot.docs.length} ${collectionName}.`);
                    if (firebaseStatus === 'connecting') setFirebaseStatus('connected');
                    
                    const data = snapshot.docs.map(processDoc);
                    
                    if (collectionName === "products") {
                        data.forEach((product: any) => {
                            if (typeof product.price !== 'number') {
                                console.warn(`Produto ID ${product.id} com preço inválido:`, product.price, `- usando 0 como padrão.`);
                                product.price = 0;
                            }
                            if (typeof product.stock !== 'number') {
                                console.warn(`Produto ID ${product.id} com estoque inválido:`, product.stock, `- usando 0 como padrão.`);
                                product.stock = 0;
                            }
                        });
                    }

                    setter(data);
                    setInitialLoad(prev => ({ ...prev, [stateKey]: true }));
                },
                (error) => {
                    console.error(`Firestore (${collectionName}) error: `, error.message);
                    setFirebaseStatus('error');
                    const errorMessage = (error && (error as any).message) ? String((error as any).message) : "Erro de conexão desconhecido.";
                    setLoadingError(`Erro ao carregar '${collectionName}'. Verifique as regras de segurança do Firestore. Detalhes: ${errorMessage}`);
                    setIsLoading(false);
                }
            );
            unsubscribers.push(unsubscribe);
        };

        createListener("products", setProducts, "products");
        createListener("tables", setTables, "tables");
        createListener("waiters", setWaiters, "waiters");

        const ordersUnsubscribe = onSnapshot(collection(db, "orders"), 
          (snapshot) => {
            console.log(`Firestore update: Received ${snapshot.docs.length} orders.`);
            if (firebaseStatus === 'connecting') setFirebaseStatus('connected');
            
            const ordersData = snapshot.docs.map(doc => {
              const plainOrder: any = processDoc(doc);

              // Sanitize order items to prevent crashes from bad data
              const sanitizedItems: OrderItem[] = (Array.isArray(plainOrder.items) ? plainOrder.items : []).map((item: any) => ({
                  productId: item.productId,
                  productName: item.productName,
                  quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
                  unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
              }));
              plainOrder.items = sanitizedItems;

              // If total is invalid, recalculate it from sanitized items
              if (typeof plainOrder.total !== 'number') {
                  const recalculatedTotal = sanitizedItems.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
                  console.warn(`Pedido ID ${doc.id} com total inválido:`, plainOrder.total, `- recalculado para ${recalculatedTotal.toFixed(2)}.`);
                  plainOrder.total = recalculatedTotal;
              }

              return plainOrder as Order;
            });
            setOrders(ordersData);
            setInitialLoad(prev => ({ ...prev, orders: true }));
          },
          (error) => {
            console.error("Firestore (orders) error: ", error.message);
            setFirebaseStatus('error');
            const errorMessage = (error && (error as any).message) ? String((error as any).message) : "Erro de conexão desconhecido.";
            setLoadingError(`Erro ao carregar 'pedidos'. Verifique as regras de segurança do Firestore. Detalhes: ${errorMessage}`);
            setIsLoading(false);
          }
        );
        unsubscribers.push(ordersUnsubscribe);
      } catch (error: any) {
        console.error("Erro fatal durante a inicialização do Firestore:", error);
        setFirebaseStatus('error');
        const errorMessage = (error && error.message) ? String(error.message) : "Ocorreu um erro inesperado.";
        setLoadingError(`Não foi possível inicializar o banco de dados. Verifique a configuração do Firebase e as regras de segurança. Detalhes: ${errorMessage}`);
        setIsLoading(false);
      }
    };
    
    setupAndSeed();

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribers.forEach(unsub => unsub());
    };
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

  const seedDatabase = async () => {
    if (!window.confirm("Você tem certeza? Esta ação irá apagar TODOS os produtos, mesas e garçons existentes e substituí-los por dados de exemplo. Pedidos não serão afetados.")) {
        return;
    }
    setIsLoading(true);
    try {
        const deleteCollection = async (collectionName: string) => {
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(collectionRef);
            if (snapshot.empty) return;
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Collection '${collectionName}' cleared.`);
        };

        const seedCollection = async (collectionName: string, seedData: any[]) => {
            const batch = writeBatch(db);
            seedData.forEach(item => {
                const docRef = doc(collection(db, collectionName));
                batch.set(docRef, item);
            });
            await batch.commit();
            console.log(`Collection '${collectionName}' seeded.`);
        };

        await deleteCollection("products");
        await deleteCollection("tables");
        await deleteCollection("waiters");

        await seedCollection("products", seedProducts);
        await seedCollection("tables", seedTables);
        await seedCollection("waiters", seedWaiters);

        alert("Banco de dados populado com sucesso!");
    } catch (e: any) {
        console.error("Falha ao popular banco de dados:", e.message);
        alert("Ocorreu um erro ao popular o banco de dados. Verifique o console para mais detalhes.");
    } finally {
        setIsLoading(false);
    }
  };

  const value = { products, tables, orders, waiters, isLoading, loadingError, firebaseStatus, getTableById, getOpenOrderByTableId, addProductToOrder, updateOrderItemQuantity, removeOrderItem, closeTable, updateProduct, addProduct, deleteProduct, addTable, removeTable, cancelOrder, addWaiter, updateWaiter, deleteWaiter, seedDatabase };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};