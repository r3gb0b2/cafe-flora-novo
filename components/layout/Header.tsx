
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
              <path d="M21 21L15.803 15.803M15.803 15.803C17.2937 14.3123 18.2163 12.3576 18.3364 10.2738C18.4566 8.19001 17.7656 6.16041 16.4214 4.5959C15.0772 3.03139 13.1813 2.05814 11.1718 1.87428C9.1623 1.69042 7.18837 2.31233 5.61813 3.61813C4.04788 4.92394 3.00049 6.8159 2.71533 8.8712C2.43017 10.9265 2.92695 13.0135 4.10821 14.7302C5.28947 16.4468 7.06941 17.6743 9.07462 18.1706C11.0798 18.6669 13.1866 18.3973 15.006 17.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </span>
          <input className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-brand-green-light" type="text" placeholder="Buscar..." />
        </div>
      </div>
    </header>
  );
};

export default Header;
   