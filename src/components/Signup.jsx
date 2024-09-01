import React, { useState } from 'react';
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

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Nama harus diisi');
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email tidak valid');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password harus minimal 6 karakter');
      return false;
    }
    if (!phoneNumber.trim() || !/^\d+$/.test(phoneNumber)) {
      toast.error('Nomor telepon tidak valid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Daftar pengguna baru
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number: phoneNumber,
          }
        }
      });

      if (error) throw error;

      if (data && data.user) {
        // Tambahkan data ke tabel profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              name,
              phone_number: phoneNumber,
            }
          ], { onConflict: 'id' });

        if (profileError) throw profileError;

        toast.success('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi akun.');
        onClose();
      } else {
        throw new Error('Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error(error.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
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
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition duration-300 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
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