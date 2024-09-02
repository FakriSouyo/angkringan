import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { supabase } from "./services/supabase";
import AdminNavbar from "./components/AdminNavbar";
import UserNavbar from "./components/UserNavbar";
import Home from "./components/Home";
import About from "./components/About";
import Menu from "./components/Menu";
import FullMenu from "./components/FullMenu";
import Contact from "./components/Contact";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/admin/AdminDashboard";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import TransactionHistory from "./components/TransactionHistory";
import Profile from "./components/Profile";
import ErrorBoundary from './components/ErrorBoundary';
import Notifications from './components/Notifications';

const AppContent = () => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [userName, setUserName] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const menuRef = useRef(null);
  const contactRef = useRef(null);

  const location = useLocation();

  const checkAdminStatus = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setIsAdmin(data.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, []);

  const fetchUserName = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserName(data.name || 'User');
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
    }
  }, []);

  useEffect(() => {
    const setupSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
        fetchUserName(session.user.id);
      }
    };

    setupSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
        fetchUserName(session.user.id);
      } else {
        setIsAdmin(false);
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus, fetchUserName]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, []);

  const addToCart = useCallback((item) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.menu_item_id === item.menu_item_id);
      let updatedItems;
      if (existingItemIndex !== -1) {
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
      } else {
        updatedItems = [...prevItems, item];
      }
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prevItems => {
      const updatedCart = prevItems.filter(item => item.menu_item_id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart');
  }, []);

  const scrollToSection = useCallback((ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleLoginSuccess = useCallback((adminStatus) => {
    setIsAdmin(adminStatus);
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      
      const channel = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          handleNotificationChange
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

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

  const handleNotificationChange = (payload) => {
    if (payload.new && payload.new.user_id === session?.user?.id) {
      if (payload.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === payload.new.id ? payload.new : notif))
        );
      } else if (payload.eventType === 'DELETE') {
        setNotifications((prev) => prev.filter((notif) => notif.id !== payload.old.id));
      }
    }
  };

  const clearNotifications = useCallback(async () => {
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
  }, [session]);

  const handleTransactionHistoryClick = useCallback(() => {
    setIsTransactionHistoryOpen(true);
    clearNotifications();
  }, [clearNotifications]);

  const isNotFoundPage = location.pathname === "/404" || location.pathname === "*";

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      {!isNotFoundPage && (
        location.pathname.startsWith('/admin') ? (
          <AdminNavbar 
            userName={userName}
            setActiveTab={setActiveAdminTab}
          />
        ) : (
          <UserNavbar
            session={session}
            userName={userName}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            openLoginModal={() => setIsLoginOpen(true)}
            setIsCartOpen={setIsCartOpen}
            scrollToSection={scrollToSection}
            homeRef={homeRef}
            aboutRef={aboutRef}
            menuRef={menuRef}
            contactRef={contactRef}
            notifications={notifications}
            setIsProfileOpen={setIsProfileOpen}
            handleTransactionHistoryClick={handleTransactionHistoryClick}
            clearNotifications={clearNotifications}
          />
        )
      )}
      <Routes>
        <Route path="/" element={
          <ErrorBoundary>
            <>
              <div ref={homeRef}><Home /></div>
              <div ref={aboutRef}><About /></div>
              <div ref={menuRef}><Menu limit={6} addToCart={addToCart} /></div>
              <div ref={contactRef}><Contact /></div>
              <Footer 
                scrollToSection={scrollToSection}
                homeRef={homeRef}
                aboutRef={aboutRef}
                menuRef={menuRef}
                contactRef={contactRef}
              />
            </>
          </ErrorBoundary>
        } />
        <Route path="/fullmenu" element={
          <ErrorBoundary>
            <>
              <FullMenu addToCart={addToCart} />
              <Footer 
                scrollToSection={scrollToSection}
                homeRef={homeRef}
                aboutRef={aboutRef}
                menuRef={menuRef}
                contactRef={contactRef}
              />
            </>
          </ErrorBoundary>
        } />
        <Route 
          path="/admin/*" 
          element={
            <ErrorBoundary>
              <AdminDashboard activeTab={activeAdminTab} />
            </ErrorBoundary>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isNotFoundPage && (
        <>
          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            session={session}
            openLoginModal={() => setIsLoginOpen(true)}
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
          <Login
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onSwitchToSignup={() => {
              setIsLoginOpen(false);
              setIsSignupOpen(true);
            }}
            onLoginSuccess={handleLoginSuccess}
          />
          <Signup
            isOpen={isSignupOpen}
            onClose={() => setIsSignupOpen(false)}
            onSwitchToLogin={() => {
              setIsSignupOpen(false);
              setIsLoginOpen(true);
            }}
          />
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
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;