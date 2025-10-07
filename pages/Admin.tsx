import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useData } from '../context/DataContext';
import { Waiter } from '../types';

const Admin: React.FC = () => {
    const { 
        tables, addTable, removeTable, 
        orders, cancelOrder, 
        waiters, addWaiter, updateWaiter, deleteWaiter,
        isLoading,
        seedDatabase 
    } = useData();

    const openOrders = orders.filter(o => o.status === 'open');

    // State for waiter management
    const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
    const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
    const [waiterName, setWaiterName] = useState('');

    const handleOpenWaiterModal = (waiter: Waiter | null = null) => {
        setEditingWaiter(waiter);
        setWaiterName(waiter ? waiter.name : '');
        setIsWaiterModalOpen(true);
    };

    const handleCloseWaiterModal = () => {
        setIsWaiterModalOpen(false);
        setEditingWaiter(null);
        setWaiterName('');
    };

    const handleSaveWaiter = async () => {
        if (!waiterName.trim()) {
            alert("O nome do garçom não pode estar vazio.");
            return;
        }
        if (editingWaiter) {
            await updateWaiter({ ...editingWaiter, name: waiterName });
        } else {
            await addWaiter(waiterName);
        }
        handleCloseWaiterModal();
    };

    const handleDeleteWaiter = async (waiterId: string) => {
        if (window.confirm("Tem certeza que deseja remover este garçom?")) {
            await deleteWaiter(waiterId);
        }
    };

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

            <Card title="Gerenciamento de Garçons">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">Total de garçons: {waiters.length}</p>
                    <Button onClick={() => handleOpenWaiterModal()} disabled={isLoading}>Adicionar Garçom</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3">Nome</th>
                                <th className="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waiters.map(waiter => (
                                <tr key={waiter.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{waiter.name}</td>
                                    <td className="p-3 text-center space-x-2">
                                        <Button variant="secondary" onClick={() => handleOpenWaiterModal(waiter)} className="py-1 px-3" disabled={isLoading}>Editar</Button>
                                        <Button variant="danger" onClick={() => handleDeleteWaiter(waiter.id)} className="py-1 px-3" disabled={isLoading}>Remover</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

            <Modal isOpen={isWaiterModalOpen} onClose={handleCloseWaiterModal} title={editingWaiter ? 'Editar Garçom' : 'Adicionar Garçom'}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="waiterName" className="block text-sm font-medium text-gray-700">Nome do Garçom</label>
                        <input 
                            type="text" 
                            id="waiterName"
                            value={waiterName} 
                            onChange={(e) => setWaiterName(e.target.value)} 
                            className="mt-1 w-full p-2 border rounded-md shadow-sm" 
                            disabled={isLoading} 
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="secondary" onClick={handleCloseWaiterModal} disabled={isLoading}>Cancelar</Button>
                        <Button onClick={handleSaveWaiter} disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Card title="Gerenciamento de Dados">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Use esta opção para restaurar os dados iniciais do sistema. Isso é útil para testes ou se você limpou o banco de dados e deseja começar de novo com os dados de exemplo.
                    </p>
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-r-lg">
                        <p className="font-bold">Atenção!</p>
                        <p>Esta ação irá <span className="font-semibold">apagar permanentemente</span> todos os produtos, mesas e garçons cadastrados e substituí-los por um conjunto de dados de exemplo. Pedidos existentes não serão afetados.</p>
                    </div>
                    <Button 
                        variant="danger" 
                        onClick={seedDatabase}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : 'Popular Banco de Dados com Dados Iniciais'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Admin;