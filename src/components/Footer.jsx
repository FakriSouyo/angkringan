import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = ({ scrollToSection, homeRef, aboutRef, menuRef, contactRef }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path, ref) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToSection(ref), 100);
    } else {
      scrollToSection(ref);
    }
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Angkringan</h3>
            <p className="mb-2">Nikmati cita rasa autentik dari Angkringan Mas Pithik</p>
            <p className="mb-2">Telp: 082213969231</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Alamat</h3>
            <p>Komplek Reni Jaya Blok AA 1 no. 1</p>
            <p>Jalan Flamboyan Raya</p>
            <p>Pamulang, Tangerang Selatan</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Navigasi</h3>
            <ul>
              <li className="mb-2">
                <button onClick={() => handleNavigation('/', homeRef)} className="hover:text-gray-300">Beranda</button>
              </li>
              <li className="mb-2">
                <button onClick={() => handleNavigation('/', aboutRef)} className="hover:text-gray-300">Tentang</button>
              </li>
              <li className="mb-2">
                <button onClick={() => navigate('/full-menu')} className="hover:text-gray-300">Menu</button>
              </li>
              <li className="mb-2">
                <button onClick={() => handleNavigation('/', contactRef)} className="hover:text-gray-300">Kontak</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>© 2024 Angkringan. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;