import React, { useState, useEffect } from "react";
import { Element } from "react-scroll";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import emailjs from 'emailjs-com';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    emailjs.init("ybyKscxug5e_5xd_u"); // Ganti dengan Public Key EmailJS Anda
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await emailjs.send(
        'service_3zglkin', // Service ID yang Anda berikan
        'template_f50f18j', // Ganti dengan Template ID EmailJS Anda yang baru
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'isfan.diar123@gmail.com' // Email admin
        }
      );
      toast.success('Pesan berhasil dikirim!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  return (
    <Element name="contact" id="contact" className="py-16 md:py-24 min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 sm:mb-12 text-center"
        >
          Hubungi Kami
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card rounded-xl shadow-lg p-6 sm:p-8"
        >
          <p className="text-foreground mb-4 sm:mb-6 text-center text-base sm:text-lg">Punya saran atau kritik terhadap kami? Silahkan hubungi kami!</p>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-foreground font-medium text-sm sm:text-base">Nama</label>
              <input id="name" type="text" value={formData.name} onChange={handleChange} placeholder="Masukkan nama Anda" className="w-full p-2 sm:p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 text-sm sm:text-base" required />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-foreground font-medium text-sm sm:text-base">Email</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Masukkan email Anda" className="w-full p-2 sm:p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 text-sm sm:text-base" required />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-foreground font-medium text-sm sm:text-base">Pesan</label>
              <textarea id="message" value={formData.message} onChange={handleChange} placeholder="Masukkan pesan Anda" className="w-full p-2 sm:p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base" required />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-in-out"
            >
              <FiSend className="mr-2" />
              Kirim Pesan
            </button>
          </form>
        </motion.div>
      </div>
    </Element>
  );
}