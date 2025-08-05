import React from 'react';

const Footer: React.FC = () => {
  return (
    <>
      {/* Footer Background - positioned in front of canvas */}
      <div className="footer_background"></div>

      {/* Model Info Frame */}
      <div className="frame"> 
        <span className="frame__title">BLACK RHINO</span>
        <span className="frame_vertical"></span>
        <span className="frame__category">FunForms™</span>
        <span className="frame__subcategory">Sprayer</span>
      </div>
    </>
  );
};

export default Footer;