
import React from 'react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const getTitle = () => {
    const path = location.pathname.split('/')[1];
    switch(path) {
      case 'dashboard': return 'Dashboard';
      case 'tables': return 'Mesas';
      case 'order': return 'Gerenciar Pedido';
      case 'inventory': return 'Estoque';
      case 'reports': return 'Relatórios';
      case 'admin': return 'Administração';
      default: return 'VerdeCafé';
    }
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      <h1 className="text-2xl font-semibold text-brand-green-dark">{getTitle()}</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15.803 15.803M15.803 15.803C17.2937 14.3123 18.2163 12.3576 18.3364 10.2738C18.4566 8.19001 17.7656 6.16041 16.4214 4.5959C15.0772 3.03139 13.1813 2.05814 11.1718 1.87428C9.1623 1.69042 7.18837 2.31233 5.61813 3.61813C4.04788 4.92394 3.00049 6.8159 2.71533 8.8712C2.43017 10.9265 2.92695 13.0135 4.10821 14.7302C5.28947 16.4468 7.06941 17.6743 9.07462 18.1706C11.0798 18.6669 13.1866 18.3973 1--- START OF FILE components/layout/Sidebar.tsx ---


import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  TableCellsIcon, 
  ArchiveBoxIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';


const Sidebar: React.FC = () => {

  const navLinkClasses = "flex items-center px-4 py-3 text-gray-200 transition-colors duration-200 transform rounded-lg hover:bg-brand-green-dark hover:text-white";
  const activeLinkClasses = "bg-brand-green-dark text-white";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-brand-green">
      <div className="flex items-center justify-center h-20 border-b border-brand-green-dark">
        <h1 className="text-2xl font-bold text-white">VerdeCafé</h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
          <HomeIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Dashboard</span>
        </NavLink>
        <NavLink to="/tables" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
          <TableCellsIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Mesas</span>
        </NavLink>
        <NavLink to="/inventory" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
          <ArchiveBoxIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Estoque</span>
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
          <ChartBarIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Relatórios</span>
        </NavLink>
        <NavLink to="/admin" className={({isActive}) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>
          <Cog6ToothIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Administração</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;--- START OF FILE components/ui/Card.tsx ---


import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-brand-green-dark mb-4 border-b pb-2">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;--- START OF FILE components/ui/Button.tsx ---


import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-brand-green hover:bg-brand-green-dark focus:ring-brand-green',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500 text-white',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;--- START OF FILE components/ui/Modal.tsx ---


import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-brand-green-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;--- START OF FILE pages/Dashboard.tsx ---


import React from 'react';
import Card from '../components/ui/Card';
import { useData } from '../context/DataContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const Dashboard: React.FC = () => {
  const { orders, products, tables } = useData();

  const closedOrders = orders.filter(o => o.status === 'closed');
  const totalRevenue = closedOrders.reduce((sum, order) => sum + order.total, 0);
  const occupiedTables = tables.filter(t => t.status === 'Ocupada').length;

  const salesData = closedOrders.map(order => ({
    name: order.closedAt ? new Date(order.closedAt).toLocaleDateString('pt-BR') : '',
    Vendas: order.total,
  })).reduce((acc, current) => {
    const existing = acc.find(item => item.name === current.name);
    if (existing) {
      existing.Vendas += current.Vendas;
    } else {
      acc.push(current);
    }
    return acc;
  }, [] as { name: string; Vendas: number }[]).sort((a,b) => new Date(a.name.split('/').reverse().join('-')).getTime() - new Date(b.name.split('/').reverse().join('-')).getTime());

  const topProductsData = products.sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-brand-green to-brand-green-dark text-white">
          <h4 className="text-lg">Faturamento Total</h4>
          <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <h4 className="text-lg text-gray-600">Pedidos Finalizados</h4>
          <p className="text-3xl font-bold text-brand-green-dark">{closedOrders.length}</p>
        </Card>
        <Card>
          <h4 className="text-lg text-gray-600">Mesas Ocupadas</h4>
          <p className="text-3xl font-bold text-brand-green-dark">{occupiedTables} / {tables.length}</p>
        </Card>
        <Card>
          <h4 className="text-lg text-gray-600">Itens em Estoque Baixo</h4>
           <p className="text-3xl font-bold text-brand-green-dark">{products.filter(p => p.stock < 20).length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Desempenho de Vendas">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="Vendas" stroke="#2E4636" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 Produtos com Estoque Baixo">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip formatter={(value: number) => `${value} unidades`} />
              <Legend />
              <Bar dataKey="stock" fill="#6B8E23" name="Estoque" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;--- START OF FILE pages/Tables.tsx ---


import React from 'react';
import { useData } from '../context/DataContext';
import { Table, TableStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const TableCard: React.FC<{ table: Table }> = ({ table }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.Available:
        return 'border-green-500 bg-green-50';
      case TableStatus.Occupied:
        return 'border-orange-500 bg-orange-50';
      case TableStatus.Closing:
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const handleClick = () => {
    navigate(`/order/${table.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${getStatusColor(table.status)}`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-brand-green-dark">{table.name}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
            table.status === TableStatus.Available ? 'bg-green-500' :
            table.status === TableStatus.Occupied ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          {table.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2">Clique para ver/iniciar pedido</p>
    </div>
  );
};

const Tables: React.FC = () => {
  const { tables } = useData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {/* FIX: The table `id` is a string, on which arithmetic operations are not allowed. Sorting by table name numerically is more intuitive. */}
      {tables.sort((a,b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map(table => (
        <TableCard key={table.id} table={table} />
      ))}
    </div>
  );
};

export default Tables;--- START OF FILE pages/Order.tsx ---

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const Order: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const {
    getTableById,
    getOpenOrderByTableId,
    products,
    addProductToOrder,
    updateOrderItemQuantity,
    removeOrderItem,
    closeTable,
    cancelOrder,
    isLoading
  } = useData();
  
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [isCloseTableModalOpen, setCloseTableModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [searchTerm, setSearchTerm] = useState('');

  if (!tableId) {
    return <div>ID da mesa não fornecido.</div>;
  }

  const table = getTableById(tableId);
  const order = getOpenOrderByTableId(tableId);

  const handleCloseTable = async () => {
    if (order) {
      await closeTable(order.id, paymentMethod);
      navigate('/tables');
    }
  };

  const handleCancelOrder = async () => {
    if (order && window.confirm("Tem certeza que deseja cancelar este pedido? Todos os itens serão retornados ao estoque.")) {
      await cancelOrder(order.id);
      navigate('/tables');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  if (!table) {
    return <div>Mesa não encontrada.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title={`Pedido da ${table.name}`}>
          {order && order.items.length > 0 ? (
            <div className="space-y-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Produto</th>
                    <th className="py-2 text-center">Qtd</th>
                    <th className="py-2 text-right">Subtotal</th>
                    <th className="py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.productId} className="border-b">
                      <td className="py-3">{item.productName}</td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => updateOrderItemQuantity(order.id, item.productId, parseInt(e.target.value, 10))}
                          className="w-16 text-center border rounded-md"
                          disabled={isLoading}
                        />
                      </td>
                      <td className="py-3 text-right">R$ {(item.unitPrice * item.quantity).toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => removeOrderItem(order.id, item.productId)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={isLoading}>
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-4">
                <p className="text-2xl font-bold text-brand-green-dark">Total: R$ {order.total.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum item adicionado a este pedido ainda.</p>
          )}
           <div className="mt-6 flex justify-between">
            <Button onClick={() => setAddProductModalOpen(true)} disabled={isLoading}>
              <PlusIcon className="w-5 h-5 inline-block mr-2" />
              Adicionar Produto
            </Button>
            {order && (
               <div className="space-x-2">
                <Button variant="danger" onClick={handleCancelOrder} disabled={isLoading}>Cancelar Pedido</Button>
                <Button variant="primary" onClick={() => setCloseTableModalOpen(true)} disabled={isLoading}>Fechar Mesa</Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card title="Informações">
            <p><strong>Mesa:</strong> {table.name}</p>
            <p><strong>Status:</strong> {table.status}</p>
            {order && (
                <>
                <p><strong>Pedido ID:</strong> {order.id.slice(-6)}</p>
                <p><strong>Aberto em:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                </>
            )}
        </Card>
      </div>

      <Modal isOpen={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} title="Adicionar Produto ao Pedido">
        <input 
          type="text"
          placeholder="Buscar produto..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map((product: Product) => (
                <div key={product.id} className="flex justify-between items-center p-3 rounded-md hover:bg-gray-100">
                    <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)} - Estoque: {product.stock}</p>
                    </div>
                    <Button onClick={() => addProductToOrder(tableId, product, 'waiter_1')} disabled={product.stock <= 0 || isLoading}>
                       <PlusIcon className="w-5 h-5"/>
                    </Button>
                </div>
            ))}
        </div>
      </Modal>

      <Modal isOpen={isCloseTableModalOpen} onClose={() => setCloseTableModalOpen(false)} title="Finalizar Pedido">
        <div className="space-y-4">
            <p className="text-lg">Total a pagar: <span className="font-bold text-brand-green-dark">R$ {order?.total.toFixed(2)}</span></p>
            <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <select 
                    id="paymentMethod" 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-green-light focus:border-brand-green-light"
                    disabled={isLoading}
                >
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Dinheiro</option>
                    <option>PIX</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setCloseTableModalOpen(false)} disabled={isLoading}>Cancelar</Button>
                <Button onClick={handleCloseTable} disabled={isLoading}>
                  {isLoading ? 'Confirmando...' : 'Confirmar Pagamento'}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Order;--- START OF FILE pages/Inventory.tsx ---


import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '' });

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setNewProduct({ name: product.name, price: product.price, stock: product.stock, category: product.category });
    } else {
      setNewProduct({ name: '', price: 0, stock: 0, category: 'Bebidas' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    if (editingProduct) {
      await updateProduct({ ...editingProduct, ...newProduct });
    } else {
      await addProduct(newProduct);
    }
    handleCloseModal();
  };
  
  const handleDelete = async (productId: string) => {
    if(window.confirm('Tem certeza que deseja remover este produto?')) {
        await deleteProduct(productId);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value }));
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Gerenciamento de Estoque</h2>
        <Button onClick={() => handleOpenModal()} disabled={isLoading}>Adicionar Produto</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">R$ {product.price.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`${product.stock < 20 ? 'text-red-500 font-semibold' : ''}`}>{product.stock}</span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <Button variant="secondary" onClick={() => handleOpenModal(product)} className="py-1 px-3" disabled={isLoading}>Editar</Button>
                  <Button variant="danger" onClick={() => handleDelete(product.id)} className="py-1 px-3" disabled={isLoading}>Remover</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}>
        <div className="space-y-4">
          <div>
            <label>Nome</label>
            <input type="text" name="name" value={newProduct.name} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div>
            <label>Categoria</label>
            <select name="category" value={newProduct.category} onChange={handleChange} className="w-full p-2 border rounded bg-white" disabled={isLoading}>
                <option value="Bebidas">Bebidas</option>
                <option value="Salgados">Salgados</option>
                <option value="Doces">Doces</option>
                <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label>Preço</label>
            <input type="number" name="price" value={newProduct.price} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div>
            <label>Estoque</label>
            <input type="number" name="stock" value={newProduct.stock} onChange={handleChange} className="w-full p-2 border rounded" disabled={isLoading} />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
             <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>Cancelar</Button>
             <Button onClick={handleSaveProduct} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
             </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default Inventory;--- START OF FILE pages/Reports.tsx ---

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ReportType, Order } from '../types';
import Button from '../components/ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
// @ts-ignore
const { jsPDF } = window.jspdf;

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>(ReportType.Sales);
  const { orders, waiters, products, tables } = useData();
  const closedOrders = orders.filter(o => o.status === 'closed');

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Relatório de ${activeTab}`, 14, 16);
    
    let head: string[][] = [];
    let body: any[][] = [];

    switch(activeTab) {
        case ReportType.Sales:
            head = [['Data', 'Mesa', 'Garçom', 'Pagamento', 'Total']];
            body = closedOrders.map(o => [
                new Date(o.closedAt!).toLocaleDateString('pt-BR'),
                tables.find(t => t.id === o.tableId)?.name || 'N/A',
                waiters.find(w => w.id === o.waiterId)?.name || 'N/A',
                o.paymentMethod,
                `R$ ${o.total.toFixed(2)}`
            ]);
            break;
        case ReportType.Products:
            head = [['Produto', 'Quantidade Vendida', 'Receita Gerada']];
            const productSales = getProductSalesData();
            body = productSales.map(p => [
                p.name,
                p.quantity,
                `R$ ${p.revenue.toFixed(2)}`
            ]);
            break;
        case ReportType.Commissions:
            head = [['Garçom', 'Vendas Totais', 'Comissão (10%)']];
            const commissionData = getCommissionData();
            body = commissionData.map(c => [
                c.name,
                `R$ ${c.totalSales.toFixed(2)}`,
                `R$ ${c.commission.toFixed(2)}`
            ]);
            break;
    }

    doc.autoTable({
        head: head,
        body: body,
        startY: 20
    });
    doc.save(`relatorio_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getProductSalesData = () => {
    const sales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
    closedOrders.forEach(order => {
        order.items.forEach(item => {
            if (!sales[item.productId]) {
                sales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
            }
            sales[item.productId].quantity += item.quantity;
            sales[item.productId].revenue += item.quantity * item.unitPrice;
        });
    });
    return Object.values(sales).sort((a,b) => b.quantity - a.quantity);
  };
  
  const getCommissionData = () => {
    const comissions: { [key: string]: { name: string, totalSales: number, commission: number } } = {};
    waiters.forEach(w => {
        comissions[w.id] = { name: w.name, totalSales: 0, commission: 0 };
    });
    closedOrders.forEach(order => {
        if(comissions[order.waiterId]) {
            comissions[order.waiterId].totalSales += order.total;
        }
    });
    Object.values(comissions).forEach(c => {
        c.commission = c.totalSales * 0.10; // 10% commission
    });
    return Object.values(comissions);
  };

  const COLORS = ['#1E3A2B', '#2E4636', '#6B8E23', '#A9A9A9', '#F5F5DC'];

  const renderContent = () => {
    switch (activeTab) {
      case ReportType.Sales:
        const salesByDay = closedOrders.reduce((acc, order) => {
            const date = new Date(order.closedAt!).toLocaleDateString('pt-BR');
            acc[date] = (acc[date] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);
        const salesChartData = Object.entries(salesByDay).map(([name, Vendas]) => ({name, Vendas}));
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">Vendas por Dia</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="Vendas" fill="#2E4636" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
      case ReportType.Products:
        const productChartData = getProductSalesData();
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">Produtos Mais Vendidos (por quantidade)</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={productChartData.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value: number) => `${value} unidades`} />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantidade" fill="#6B8E23" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
      case ReportType.Commissions:
        const commissionChartData = getCommissionData();
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">Comissão dos Atendentes</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie data={commissionChartData} dataKey="commission" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                             {commissionChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex border-b">
                {Object.values(ReportType).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 -mb-px text-sm font-semibold border-b-2 ${
                    activeTab === tab
                        ? 'text-brand-green border-brand-green'
                        : 'text-gray-500 border-transparent hover:text-brand-green'
                    }`}
                >
                    {tab}
                </button>
                ))}
            </div>
          </div>
          <Button onClick={handleExportPDF}>Exportar para PDF</Button>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default Reports;--- START OF FILE pages/Admin.tsx ---

import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useData } from '../context/DataContext';

const Admin: React.FC = () => {
    const { tables, addTable, removeTable, orders, cancelOrder, isLoading } = useData();
    const openOrders = orders.filter(o => o.status === 'open');

    return (
        <div className="space-y-6">
            <Card title="Gerenciamento de Mesas">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">Total de mesas: {tables.length}</p>
                    <Button onClick={addTable} disabled={isLoading}>Adicionar Nova Mesa</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tables.map(table => (
                        <div key={table.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{table.name}</span>
                            <Button 
                                variant="danger" 
                                className="py-1 px-2 text-xs" 
                                onClick={() => removeTable(table.id)}
                                disabled={table.status !== 'Disponível' || isLoading}
                                title={table.status !== 'Disponível' ? 'Mesa em uso' : 'Remover mesa'}
                            >
                                Remover
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Cancelamento de Pedidos Abertos">
                <p className="text-gray-600 mb-4">Aqui você pode cancelar pedidos que foram abertos por engano ou a pedido do cliente. Esta ação não pode ser desfeita.</p>
                {openOrders.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3">Mesa</th>
                                <th className="p-3">Aberto em</th>
                                <th className="p-3">Itens</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {openOrders.map(order => {
                                const tableName = tables.find(t => t.id === order.tableId)?.name || `ID: ${order.tableId}`;
                                return (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{tableName}</td>
                                    <td className="p-3">{new Date(order.createdAt).toLocaleTimeString('pt-BR')}</td>
                                    <td className="p-3">{order.items.length}</td>
                                    <td className="p-3 text-right">R$ {order.total.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <Button 
                                            variant="danger" 
                                            disabled={isLoading}
                                            onClick={() => {
                                                if(window.confirm(`Tem certeza que deseja cancelar o pedido da ${tableName}?`)){
                                                    cancelOrder(order.id)
                                                }
                                            }}
                                        >
                                            Cancelar Pedido
                                        </Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum pedido aberto no momento.</p>
                )}
            </Card>

            <Card title="Formas de Pagamento">
                <p className="text-gray-600">Gerencie as formas de pagamento aceitas. (Funcionalidade a ser implementada)</p>
            </Card>
        </div>
    );
};

export default Admin;--- START OF FILE components/FirebaseConfigWarning.tsx ---

import React from 'react';

// @ts-ignore - Acessando a variável global definida no index.html
const isConfigMissing = window.firebaseConfig && window.firebaseConfig.apiKey === 'YOUR_API_KEY';

const FirebaseConfigWarning: React.FC = () => {
    if (!isConfigMissing) {
        return null;
    }

    return (
        <div className="bg-red-600 text-white p-3 text-center fixed top-0 left-0 right-0 z-[10000]" role="alert">
            <p className="font-bold">AÇÃO NECESSÁRIA: Configuração do Firebase Incompleta</p>
            <p className="text-sm">
                Os dados não serão salvos ou sincronizados. Por favor, atualize o arquivo <code>index.html</code> com as suas credenciais do Firebase.
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline ml-2 font-semibold hover:text-red-200">
                    Abra o Console do Firebase
                </a>
            </p>
        </div>
    );
};

export default FirebaseConfigWarning;