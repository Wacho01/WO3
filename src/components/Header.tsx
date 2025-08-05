import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import WaveShape from './WaveShape';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="relative">
      {/* Admin Button - Fixed position in upper left */}
      <button
        onClick={handleAdminClick}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group"
        style={{ color: '#217cac' }}
      >
        <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        <span className="font-medium text-sm">Admin</span>
      </button>

      <div className="relative bg-white pt-16 pb-8">
        <WaveShape className="bottom-0" fill="#2a9cd7" />
        <div className="relative z-10 text-center bottom-16">
          <img 
            src="/src/assets/logo11.png" 
            alt="Water Odyssey Logo" 
            className="mx-auto mb-2 h-[110px] w-auto"
          />
          <h2 className="absolute w-full top-16" style={{ color: '#217cac' }}>
            <a className="relative text-[20px] font-ligth tracking-normal font-work-sans font-bold left-[110px]">Digital Catalog</a>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Header;