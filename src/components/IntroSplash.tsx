import React, { useEffect, useState } from 'react';

interface IntroSplashProps {
  onComplete: () => void;
}

const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setLogoVisible(true), 500);
    const timer2 = setTimeout(() => setTextVisible(true), 1200);
    const timer3 = setTimeout(() => setFadeOut(true), 3000);
    const timer4 = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-transform duration-1000 ${fadeOut ? '-translate-y-full' : ''}`}
      style={{
        background: 'linear-gradient(180deg, #2a9cd7 0%, #195d81 74%)'
      }}
    >
      <div className="text-center text-white">
        <div className={`mb-8 transition-all duration-1000 ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img 
            src="/src/assets/intro_logo.png" 
            alt="Water Odyssey Intro Logo" 
            className="mx-auto mb-4 h-42 w-auto"
          />
        </div>
        <div className={`transition-all duration-1000 delay-300 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-2xl md:text-2xl font-light tracking-wide font-poppins">
            CREATING COMPELLING AQUATIC PLAY EXPERIENCES
          </h1>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;