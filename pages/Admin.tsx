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

export default Admin;