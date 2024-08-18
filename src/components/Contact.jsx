import React from "react";
import { Element } from "react-scroll";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";

export default function Contact() {
  return (
    <Element name="contact" id="contact" className="py-16 md:py-24 min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-6 md:px-10 max-w-lg">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center"
        >
          Hubungi Kami
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card rounded-xl shadow-lg p-8"
        >
          <p className="text-foreground mb-6 text-center text-lg">Punya pertanyaan atau ingin memesan? Hubungi kami!</p>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-foreground font-medium">Nama</label>
              <input id="name" type="text" placeholder="Masukkan nama Anda" className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-foreground font-medium">Email</label>
              <input id="email" type="email" placeholder="Masukkan email Anda" className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-foreground font-medium">Pesan</label>
              <textarea id="message" placeholder="Masukkan pesan Anda" className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200 min-h-[120px]" />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ease-in-out"
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