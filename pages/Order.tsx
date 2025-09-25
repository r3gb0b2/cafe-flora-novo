
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const Order: React.FC = () => {
  const { tableId } = useParams();
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

  const numericTableId = Number(tableId);
  const table = getTableById(numericTableId);
  const order = getOpenOrderByTableId(numericTableId);

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
                    <Button onClick={() => addProductToOrder(numericTableId, product, 'waiter_1')} disabled={product.stock <= 0 || isLoading}>
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

export default Order;
