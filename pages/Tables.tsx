
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

export default Tables;
