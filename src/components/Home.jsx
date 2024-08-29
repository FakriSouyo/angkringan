import React from "react";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import HeroBg from '../assets/home.jpg'

export default function Home() {
  return (
    <section id="home" className="bg-gradient-to-b from-background to-secondary py-16 md:py-24 min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 md:mb-6 leading-tight">
              Selamat datang di <span className="text-accent-foreground">Angkringan</span>
            </h1>
            <p className="text-foreground mb-6 md:mb-8 text-base sm:text-lg">
              Temukan cita rasa autentik Indonesia di Angkringan kami yang nyaman. Nikmati berbagai hidangan dan minuman tradisional dalam suasana yang hangat dan mengundang.
            </p>
            <Link
              to="menu"
              smooth={true}
              duration={500}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all duration-300 ease-in-out"
            >
              Jelajahi Menu
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mt-8 md:mt-0"
          >
            <img
              src={HeroBg}
              width="500"
              height="500"
              alt="Angkringan"
              className="rounded-2xl shadow-2xl w-full max-w-md mx-auto md:max-w-none"
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}