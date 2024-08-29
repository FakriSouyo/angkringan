import React from 'react';
import AdminOverview from './AdminOverview';
import MenuManagement from './MenuManagement';
import PaymentManagement from './PaymentManagement';
import TransactionHistory from './TransactionHistory';

const AdminDashboard = ({ activeTab }) => {
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;