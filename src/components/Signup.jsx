import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiLock, FiMail, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Signup = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [cooldownTimer, setCooldownTimer] = useState(() => {
    const storedCooldownEnd = localStorage.getItem('signupCooldownEnd');
    if (storedCooldownEnd) {
      const remainingTime = Math.max(0, parseInt(storedCooldownEnd) - Date.now());
      return Math.ceil(remainingTime / 1000);
    }
    return 0;
  });

  const COOLDOWN_PERIOD = 3600000; // 1 hour in milliseconds

  useEffect(() => {
    let timer;
    if (cooldownTimer > 0) {
      timer = setInterval(() => {
        setCooldownTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          if (newTimer <= 0) {
            localStorage.removeItem('signupCooldownEnd');
            return 0;
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTimer]);

  const setCooldown = () => {
    const cooldownEnd = Date.now() + COOLDOWN_PERIOD;
    localStorage.setItem('signupCooldownEnd', cooldownEnd.toString());
    setCooldownTimer(Math.ceil(COOLDOWN_PERIOD / 1000));
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Nama harus diisi');
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email tidak valid');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password harus minimal 8 karakter');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Password harus mengandung huruf besar, huruf kecil, dan angka');
      return false;
    }
    if (!phoneNumber.trim() || !/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(phoneNumber)) {
      toast.error('Nomor telepon tidak valid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cooldownTimer > 0) {
      toast.error(`Silakan tunggu ${formatTime(cooldownTimer)} sebelum mencoba lagi.`);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone_number: phoneNumber,
          }
        }
      });

      if (error) throw error;

      if (data && data.user) {
        toast.success('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi akun.');
        onClose();
      } else {
        throw new Error('Pendaftaran gagal. Data pengguna tidak ditemukan.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('User already registered')) {
        toast.error('Email sudah terdaftar. Silakan gunakan email lain atau coba login.');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('Password harus minimal 6 karakter.');
      } else if (error.message.includes('Email rate limit exceeded')) {
        setCooldown();
        toast.error('Batas percobaan pendaftaran tercapai. Silakan coba lagi dalam 1 jam.');
      } else {
        toast.error('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Daftar</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-primary">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Nama
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan Nama"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan Email"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-1">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Masukkan Nomor Telepon"
                    required
                  />
                </div>
              </div>
              {cooldownTimer > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Silakan tunggu {formatTime(cooldownTimer)} sebelum mencoba lagi.
                </p>
              )}
              <button
                type="submit"
                className={`w-full py-2 rounded-md transition duration-300 flex items-center justify-center
                  ${cooldownTimer > 0 || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                disabled={loading || cooldownTimer > 0}
              >
                {loading ? 'Mendaftar...' : cooldownTimer > 0 ? 'Tunggu...' : 'Daftar'}
              </button>
            </form>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Sudah punya akun?{' '}
              <button onClick={onSwitchToLogin} className="text-primary hover:underline">
                Login
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Signup;