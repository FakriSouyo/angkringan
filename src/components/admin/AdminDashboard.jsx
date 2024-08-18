import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiHome, FiList, FiDollarSign, FiClock, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOverview from './AdminOverview';
import MenuManagement from './MenuManagement';
import PaymentManagement from './PaymentManagement';
import TransactionHistory from './TransactionHistory';
import { supabase } from '../../services/supabase';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]));
        console.log('JWT payload:', payload);
        console.log('Is admin:', payload['is_admin']);
      }
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'menu':
        return <MenuManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <AdminOverview />;
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-4 transition-colors duration-200 ${
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
      }`}
    >
      <Icon className="mr-3" /> {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ duration: 0.3, type: 'tween' }}
            className={`${
              isMobile ? 'absolute' : 'relative'
            } z-20 w-64 bg-card text-card-foreground shadow-lg h-full`}
          >
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="text-2xl">
                  <FiX />
                </button>
              )}
            </div>
            <nav className="mt-6 space-y-2 px-2">
              <NavButton icon={FiHome} label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavButton icon={FiList} label="Menu Management" isActive={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
              <NavButton icon={FiDollarSign} label="Payment Management" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
              <NavButton icon={FiClock} label="Transaction History" isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-md p-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl">
            <FiMenu />
          </button>
          <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
              <FiUser />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;