import React from 'react';
import { useData } from '../context/DataContext';

// @ts-ignore - Acessando a variável global definida no index.html
const isPlaceholderConfig = window.firebaseConfig && window.firebaseConfig.apiKey === 'AIzaSyDsi6VpfhLQW8UWgAp5c4TRV7vqOkDyauU';

const FirebaseConfigWarning: React.FC = () => {
    const { firebaseStatus } = useData();

    // Oculta o aviso se a configuração não for a de exemplo OU se uma conexão for estabelecida com sucesso.
    // Isso evita que o aviso seja exibido se o aplicativo estiver realmente funcionando, resolvendo o problema do usuário.
    if (!isPlaceholderConfig || firebaseStatus === 'connected') {
        return null;
    }

    return (
        <div className="bg-red-600 text-white p-3 text-center fixed top-0 left-0 right-0 z-[10000]" role="alert">
            <p className="font-bold">AÇÃO NECESSÁRIA: Configuração do Firebase Incompleta</p>
            <p className="text-sm">
                Os dados não serão salvos ou sincronizados. Por favor, atualize o arquivo <code>index.html</code> com as suas credenciais do Firebase.
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline ml-2 font-semibold hover:text-red-200">
                    Abra o Console do Firebase
                </a>
            </p>
        </div>
    );
};

export default FirebaseConfigWarning;