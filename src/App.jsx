import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
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
import NotFound from "./components/NotFound";

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
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
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
      return updatedItems;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => {
      const updatedCart = prevItems.filter(item => item.menu_item_id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = (adminStatus) => {
    setIsAdmin(adminStatus);
  };

  return (
    <ErrorBoundary>
      <Router>
        <AppContent
          session={session}
          isAdmin={isAdmin}
          userName={userName}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          isLoginOpen={isLoginOpen}
          setIsLoginOpen={setIsLoginOpen}
          isSignupOpen={isSignupOpen}
          setIsSignupOpen={setIsSignupOpen}
          cartItems={cartItems}
          activeAdminTab={activeAdminTab}
          setActiveAdminTab={setActiveAdminTab}
          homeRef={homeRef}
          aboutRef={aboutRef}
          menuRef={menuRef}
          contactRef={contactRef}
          scrollToSection={scrollToSection}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          handleLoginSuccess={handleLoginSuccess}
        />
      </Router>
    </ErrorBoundary>
  );
}

function AppContent({
  session,
  isAdmin,
  userName,
  isCartOpen,
  setIsCartOpen,
  isLoginOpen,
  setIsLoginOpen,
  isSignupOpen,
  setIsSignupOpen,
  cartItems,
  activeAdminTab,
  setActiveAdminTab,
  homeRef,
  aboutRef,
  menuRef,
  contactRef,
  scrollToSection,
  addToCart,
  removeFromCart,
  clearCart,
  handleLoginSuccess
}) {
  const location = useLocation();
  const isNotFoundPage = location.pathname === "*";

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const section = location.state.scrollTo;
      if (section === 'home') scrollToSection(homeRef);
      if (section === 'about') scrollToSection(aboutRef);
      if (section === 'contact') scrollToSection(contactRef);
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const renderNavbar = () => {
    if (location.pathname === "*") return null;
    return isAdmin ? (
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
        notifications={[]}
        setIsProfileOpen={() => {}}
        handleTransactionHistoryClick={() => {}}
      />
    );
  };

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      {renderNavbar()}
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
            isAdmin ? (
              <ErrorBoundary>
                <AdminDashboard activeTab={activeAdminTab} />
              </ErrorBoundary>
            ) : <Navigate to="/" replace />
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
        </>
      )}
    </div>
  );
}

export default App;