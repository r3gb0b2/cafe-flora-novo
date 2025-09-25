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

export default Reports;