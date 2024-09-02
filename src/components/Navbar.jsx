// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiFileText, FiHome, FiList, FiDollarSign, FiClock, FiBell } from "react-icons/fi";
// import { supabase } from '../services/supabase';
// import Profile from './Profile';
// import TransactionHistory from './TransactionHistory';

// export default function Navbar({ session, setIsCartOpen, openLoginModal, cartItemCount, scrollToSection, homeRef, aboutRef, menuRef, contactRef, hasCartItems, isAdmin, setActiveTab }) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
//   const [userName, setUserName] = useState('');
//   const [notifications, setNotifications] = useState([]);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const fetchUserName = useCallback(async () => {
//     if (session) {
//       try {
//         const { data, error } = await supabase
//           .from('profiles')
//           .select('name')
//           .eq('id', session.user.id)
//           .single();

//         if (error) throw error;
//         setUserName(data.name || 'Pengguna');
//       } catch (error) {
//         console.error('Error fetching user name:', error);
//         setUserName('Pengguna');
//       }
//     }
//   }, [session]);

//   const fetchNotifications = useCallback(async () => {
//     if (session) {
//       try {
//         const { data, error } = await supabase
//           .from('notifications')
//           .select('*')
//           .eq('user_id', session.user.id)
//           .eq('read', false)
//           .order('created_at', { ascending: false });

//         if (error) throw error;
//         setNotifications(data);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     }
//   }, [session]);

//   useEffect(() => {
//     if (session) {
//       fetchUserName();
//       fetchNotifications();
//       const channel = supabase
//         .channel('notifications')
//         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, handleNewNotification)
//         .subscribe();

//       return () => {
//         supabase.removeChannel(channel);
//       };
//     }
//   }, [session, fetchUserName, fetchNotifications]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleNewNotification = useCallback((payload) => {
//     if (payload.new.user_id === session?.user.id) {
//       setNotifications(prev => [payload.new, ...prev]);
//     }
//   }, [session]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setIsDropdownOpen(false);
//     setIsMenuOpen(false);
//     navigate('/');
//   };

//   const handleNavigation = useCallback((path, ref) => {
//     if (location.pathname !== '/') {
//       navigate('/');
//       setTimeout(() => scrollToSection(ref), 100);
//     } else {
//       scrollToSection(ref);
//     }
//     setIsMenuOpen(false);
//   }, [location.pathname, navigate, scrollToSection]);

//   const handleTransactionHistoryClick = useCallback(() => {
//     setIsTransactionHistoryOpen(true);
//     clearNotifications();
//   }, []);

//   const clearNotifications = useCallback(async () => {
//     if (session) {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ read: true })
//         .eq('user_id', session.user.id);

//       if (error) {
//         console.error('Error clearing notifications:', error);
//       } else {
//         setNotifications([]);
//       }
//     }
//   }, [session]);

//   // Rest of the component code...

//   return (
//     <>
//       {/* Your existing JSX */}
//     </>
//   );
// }