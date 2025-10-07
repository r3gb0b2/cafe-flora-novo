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
import { DataProvider, useData } from './context/DataContext';
import FirebaseConfigWarning from './components/FirebaseConfigWarning';
import Button from './components/ui/Button';

const LoadingOverlay: React.FC = () => {
  const { isLoading, loadingError } = useData();

  if (!isLoading && !loadingError) {
    return null;
  }

  if (loadingError) {
    return (
      <div className="fixed inset-0 bg-red-50 z-[9999] flex items-center justify-center p-8 text-center" role="alert">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl border-t-4 border-red-600">
           <h2 className="text-2xl font-bold text-red-700 mb-4">Erro de Carregamento</h2>
           <p className="text-gray-700 text-left">{loadingError}</p>
           <p className="mt-6 text-sm text-gray-500 text-left">
             <b>Dica:</b> Se você for o desenvolvedor, certifique-se de que as credenciais do Firebase em <code>index.html</code> estão corretas e que as regras de segurança do Firestore permitem a leitura pública das coleções: <code>products</code>, <code>tables</code>, <code>waiters</code>, e <code>orders</code>.
           </p>
           <Button variant="danger" onClick={() => window.location.reload()} className="mt-6">
             Tentar Novamente
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 z-[9999] flex items-center justify-center transition-opacity duration-300" aria-live="assertive" role="alert">
      <div className="flex items-center space-x-3 text-brand-green-dark">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-2xl font-semibold tracking-wider">Carregando...</span>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <FirebaseConfigWarning />
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
          <LoadingOverlay />
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;