import React from 'react';
import { ProductConfig } from '../config/productConfig';

interface ConfigurableFooterProps {
  config: ProductConfig;
}

const ConfigurableFooter: React.FC<ConfigurableFooterProps> = ({ config }) => {
  return (
    <>
      {/* Footer Background - positioned in front of canvas */}
      <div className="footer_background"></div>

      {/* Model Info Frame */}
      <div className="frame"> 
        <span className="frame__title">{config.product.name}</span>
        <span className="frame_vertical"></span>
        <span className="frame__category">{config.product.category}</span>
        <span className="frame__subcategory">{config.product.subcategory}</span>
      </div>
    </>
  );
};

export default ConfigurableFooter;