import React from "react";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import HeroBg from '../assets/about.jpg'



export default function About() {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-24 min-h-screen flex items-center bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 sm:px-6 md:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <img
              src={HeroBg}
              width="500"
              height="500"
              alt="Tim Angkringan"
              className="rounded-2xl shadow-2xl w-full max-w-md mx-auto md:max-w-none"
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
            />
          </motion.div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 sm:mb-6">Tentang Angkringan</h2>
            <p className="text-foreground mb-4 sm:mb-6 text-base sm:text-lg">
              Angkringan adalah bisnis keluarga yang telah menyajikan masakan Indonesia autentik selama lebih dari 20
              tahun. Misi kami adalah membawa kekayaan rasa dan tradisi Indonesia ke komunitas lokal kami.
            </p>
            <p className="text-foreground mb-6 sm:mb-8 text-base sm:text-lg">
              Tim koki dan pelayan kami yang berdedikasi bekerja tanpa lelah untuk memastikan setiap kunjungan ke Angkringan menjadi
              pengalaman yang tak terlupakan. Kami bangga menggunakan bahan-bahan terbaik dan resep turun-temurun untuk
              menciptakan hidangan lezat kami.
            </p>
            <Link
              to="contact"
              smooth={true}
              duration={500}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all duration-300 ease-in-out"
            >
              Hubungi Kami
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}