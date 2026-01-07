import React from 'react';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;
