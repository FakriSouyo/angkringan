import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiFileText, FiHome, FiList, FiDollarSign, FiClock, FiBell } from "react-icons/fi";
import { supabase } from '../services/supabase';
import Profile from './Profile';
import TransactionHistory from './TransactionHistory';

export default function Navbar({ session, setIsCartOpen, openLoginModal, cartItemCount, scrollToSection, homeRef, aboutRef, menuRef, contactRef, hasCartItems, isAdmin, setActiveTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserName();
      fetchNotifications();
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, handleNewNotification)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  useEffect(() => {
    if (session && isAdmin) {
      navigate('/admin');
    }
  }, [session, isAdmin, navigate]);

  const fetchUserName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setUserName(data.name || 'Pengguna');
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('Pengguna');
    }
  };

  const fetchNotifications = async () => {
    if (session) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
      }
    }
  };

  const handleNewNotification = (payload) => {
    if (payload.new.user_id === session.user.id) {
      setNotifications(prev => [payload.new, ...prev]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path, ref) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection(ref), 100);
    } else {
      scrollToSection(ref);
    }
    setIsMenuOpen(false);
  };

  const handleTransactionHistoryClick = () => {
    setIsTransactionHistoryOpen(true);
    clearNotifications();
  };

  const clearNotifications = async () => {
    if (session) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error clearing notifications:', error);
      } else {
        setNotifications([]);
      }
    }
  };

  const renderAdminNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      <button onClick={() => setActiveTab('overview')} className="text-primary hover:text-accent transition-colors duration-200">
        <FiHome className="inline-block mr-2" />Ringkasan
      </button>
      <button onClick={() => setActiveTab('menu')} className="text-primary hover:text-accent transition-colors duration-200">
        <FiList className="inline-block mr-2" />Manajemen Menu
      </button>
      <button onClick={() => setActiveTab('payments')} className="text-primary hover:text-accent transition-colors duration-200">
        <FiDollarSign className="inline-block mr-2" />Pembayaran
      </button>
      <button onClick={() => setActiveTab('transactions')} className="text-primary hover:text-accent transition-colors duration-200">
        <FiClock className="inline-block mr-2" />Riwayat Transaksi
      </button>
      <div className="relative" ref={dropdownRef}>
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
              className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsProfileOpen(true);
              }}>
              <FiUser className="mr-2" />
              Profil
            </button>
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
    </nav>
  );

  const renderUserNav = () => (
    <nav className="hidden md:flex items-center gap-6">
      {[
        { key: 'Home', label: 'Beranda' },
        { key: 'About', label: 'Tentang' },
        { key: 'Menu', label: 'Menu' },
        { key: 'Contact', label: 'Kontak' }
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => item.key === "Menu" ? navigate('/full-menu') : handleNavigation('/', eval(`${item.key.toLowerCase()}Ref`))}
          className="text-primary hover:text-accent transition-colors duration-200"
        >
          {item.label}
        </button>
      ))}
      {session ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-white bg-black hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-full"
          >
            <FiUser className="mr-2" />
            <span>{userName}</span>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {notifications.length}
              </span>
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1">
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsProfileOpen(true);
                }}
              >
                <FiUser className="mr-2" />
                Profil
              </button>
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-primary hover:bg-accent/10"
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleTransactionHistoryClick();
                }}
              >
                <FiFileText className="mr-2" />
                Riwayat Transaksi
                {notifications.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>
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
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openLoginModal}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
        >
          Login
        </motion.button>
      )}
    </nav>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/80 backdrop-blur-md py-4 px-6 md:px-10 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md"
      >
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src="/src/assets/logo.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-primary">Mas Pithik</span> 
        </Link>
        {isAdmin ? renderAdminNav() : renderUserNav()}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[72px] left-0 right-0 bg-background/95 backdrop-blur-md p-4 shadow-lg z-40"
          >
            {isAdmin ? (
              <>
                <button onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }} className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left">
                  <FiHome className="inline-block mr-2" />Ringkasan
                </button>
                <button onClick={() => { setActiveTab('menu'); setIsMenuOpen(false); }} className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left">
                  <FiList className="inline-block mr-2" />Manajemen Menu
                </button>
                <button onClick={() => { setActiveTab('payments'); setIsMenuOpen(false); }} className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left">
                  <FiDollarSign className="inline-block mr-2" />Manajemen Pembayaran
                </button>
                <button onClick={() => { setActiveTab('transactions'); setIsMenuOpen(false); }} className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left">
                  <FiClock className="inline-block mr-2" />Riwayat Transaksi
                </button>
                <button
                  className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                >
                  <FiUser className="mr-2" />
                  Profil 
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                >
                  <FiLogOut className="mr-2" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                {[
                  { key: 'Home', label: 'Beranda' },
                  { key: 'About', label: 'Tentang' },
                  { key: 'Menu', label: 'Menu' },
                  { key: 'Contact', label: 'Kontak' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (item.key === "Menu") {
                        navigate('/full-menu');
                      } else {
                        handleNavigation('/', eval(`${item.key.toLowerCase()}Ref`));
                      }
                      setIsMenuOpen(false);
                    }}
                    className="text-primary hover:text-accent block py-2 transition-colors duration-200 w-full text-left"
                  >
                    {item.label}
                  </button>
                ))}
                {session ? (
                  <>
                    <button
                      className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(true);
                      }}
                    >
                      <FiUser className="mr-2" />
                      Profil 
                    </button>
                   <button
                  className="flex items-center text-primary hover:text-accent  py-2 transition-colors duration-200 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleTransactionHistoryClick();
                  }}
                >
                  <FiFileText className="mr-2" />
                  Riwayat Transaksi
                  Transaction History
                  {notifications.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-primary hover:text-accent py-2 transition-colors duration-200 w-full text-left"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      openLoginModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                  >
                    Login
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (only for non-admin users) */}
      {!isAdmin && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 z-50"
          onClick={() => setIsCartOpen(true)}
        >
          <FiShoppingCart size={24} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cartItemCount}
            </span>
          )}
        </motion.button>
      )}

      <Profile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        session={session} 
      />
      <TransactionHistory
        isOpen={isTransactionHistoryOpen}
        onClose={() => setIsTransactionHistoryOpen(false)}
        session={session}
      />
    </>
  );
}