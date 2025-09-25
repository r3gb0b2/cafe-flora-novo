
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import Order from './pages/Order';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-100 font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/order/:tableId" element={<Order />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
   