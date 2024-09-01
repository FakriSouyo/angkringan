import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiList, FiDollarSign, FiClock, FiUser, FiLogOut } from "react-icons/fi";
import { supabase } from '../services/supabase';

const AdminNavbar = ({ userName, setActiveTab }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setActiveTab(path.split('/').pop());
  }, [navigate, setActiveTab]);

  return (
    <nav className="bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
      <Link to="/admin" className="flex items-center gap-2 transition-transform hover:scale-105">
        <img src="/src/assets/logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="text-2xl font-bold text-primary">Dashboard Admin</span>
      </Link>
      <div className="flex items-center gap-6">
        <button onClick={() => handleNavigation('/admin/overview')} className="text-primary hover:text-accent transition-colors duration-200">
          <FiHome className="inline-block mr-2" />Ringkasan
        </button>
        <button onClick={() => handleNavigation('/admin/menu')} className="text-primary hover:text-accent transition-colors duration-200">
          <FiList className="inline-block mr-2" />Manajemen Menu
        </button>
        <button onClick={() => handleNavigation('/admin/payments')} className="text-primary hover:text-accent transition-colors duration-200">
          <FiDollarSign className="inline-block mr-2" />Pembayaran
        </button>
        <button onClick={() => handleNavigation('/admin/transactions')} className="text-primary hover:text-accent transition-colors duration-200">
          <FiClock className="inline-block mr-2" />Riwayat Transaksi
        </button>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-white bg-black hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-full"
          >
            <FiUser className="mr-2" />
            <span>{userName}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
              >
                <FiLogOut className="mr-2" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;