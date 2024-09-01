import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import MenuManagement from './MenuManagement';
import PaymentManagement from './PaymentManagement';
import TransactionHistory from './TransactionHistory';

const AdminDashboard = ({ activeTab }) => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="transactions" element={<TransactionHistory />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;