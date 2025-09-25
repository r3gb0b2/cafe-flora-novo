
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

export default Sidebar;
   