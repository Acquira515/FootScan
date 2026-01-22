import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Backtest from './pages/Backtest';
import History from './pages/History';
import Settings from './pages/Settings';
import { ToastProvider, useToast } from './contexts/ToastContext';
import Toast from './components/Toast';
import './styles/globals.css';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold">⚽ Football Prediction</h1>
            <div className="flex gap-6">
              <Link to="/" className="hover:text-blue-400 transition">Home</Link>
              <Link to="/predict" className="hover:text-blue-400 transition">Predict</Link>
              <Link to="/backtest" className="hover:text-blue-400 transition">Backtest</Link>
              <Link to="/history" className="hover:text-blue-400 transition">History</Link>
              <Link to="/settings" className="hover:text-blue-400 transition">Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="flex flex-col h-screen bg-gray-100">
          <Navigation />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/backtest" element={<Backtest />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
        <ToastContainer />
      </Router>
    </ToastProvider>
  );
};

export default App;
