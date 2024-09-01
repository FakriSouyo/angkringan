import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { supabase } from "./services/supabase";
import ErrorBoundary from './components/ErrorBoundary';
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

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [userName, setUserName] = useState('');

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const menuRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
        fetchUserName(session.user.id);
      }
    });

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
  }, []);

  const checkAdminStatus = async (userId) => {
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
  };

  const fetchUserName = async (userId) => {
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
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(storedCart);
      updateCartNotification(storedCart);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (item) => {
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
      updateCartNotification(updatedItems);
      return updatedItems;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => {
      const updatedCart = prevItems.filter(item => item.menu_item_id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      updateCartNotification(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    updateCartNotification([]);
  };

  const updateCartNotification = (items) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent('cartUpdate', { detail: count }));
  };

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = (adminStatus) => {
    setIsAdmin(adminStatus);
  };

  const handleAdminTabChange = (tab) => {
    setActiveAdminTab(tab);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Toaster position="top-center" reverseOrder={false} />
          {isAdmin ? (
            <AdminNavbar 
              userName={userName}
              setActiveTab={handleAdminTabChange}
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
              notifications={[]}
              setIsProfileOpen={() => {}}
              handleTransactionHistoryClick={() => {}}
            />
          )}
          <Routes>
            <Route path="/" element={
              session && isAdmin ? <Navigate to="/admin" replace /> : (
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
              )
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
                isAdmin ? (
                  <ErrorBoundary>
                    <AdminDashboard activeTab={activeAdminTab} />
                  </ErrorBoundary>
                ) : <Navigate to="/" replace />
              } 
            />
          </Routes>
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
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;