
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

export default Dashboard;
   