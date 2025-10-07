import React from 'react';
import { useData } from '../../context/DataContext';

const FirebaseStatus: React.FC = () => {
    const { firebaseStatus } = useData();

    const getStatusIndicator = () => {
        switch (firebaseStatus) {
            case 'connected':
                return { 
                    color: 'bg-green-500', 
                    text: 'Online', 
                    title: 'Conectado ao banco de dados.' 
                };
            case 'connecting':
                return { 
                    color: 'bg-yellow-500 animate-pulse', 
                    text: 'Conectando...', 
                    title: 'Tentando conectar ao banco de dados...'
                };
            case 'error':
                return { 
                    color: 'bg-red-500', 
                    text: 'Erro de Conexão', 
                    title: 'Não foi possível conectar ao banco de dados. Verifique a internet e a configuração do Firebase.' 
                };
            default:
                return { 
                    color: 'bg-gray-500', 
                    text: 'Desconhecido', 
                    title: 'Status da conexão desconhecido.'
                };
        }
    };

    const { color, text, title } = getStatusIndicator();

    return (
        <div className="flex items-center space-x-2" title={title}>
            <span className={`h-3 w-3 rounded-full ${color}`}></span>
            <span className="text-sm text-gray-600 hidden sm:inline">{text}</span>
        </div>
    );
};

export default FirebaseStatus;
