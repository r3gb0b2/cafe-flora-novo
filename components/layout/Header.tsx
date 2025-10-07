
import React from 'react';
import { useLocation } from 'react-router-dom';
import { UserCircleIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
             <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-light focus:border-transparent"
            aria-label="Buscar"
          />
        </div>
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:bg-gray-100 focus:text-gray-600" aria-label="Notificações">
            <BellIcon className="w-6 h-6" />
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-600 focus:outline-none" aria-label="Perfil do usuário">
            <UserCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
};

export default Header;
