import React from 'react';

interface ProductCardProps {
  title: string;
  subtitle?: string;
  image: string;
  categoryName?: string;
  href?: string;
  productNumber?: string;
  onView?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  categoryName,
  href = '#',
  productNumber,
  onView
}) => {
  const handleClick = () => {
    // Open the ProductView application's indexProduct.html (Three.js template) in a new tab
    window.open('/src/components/ProductView/indexProduct.html', '_blank');
    
    if (onView) {
      onView();
    }
  };

  return (
    <div className="p-2">
      <div className="bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-lg group" 
           style={{ borderColor: '#ccc' }}
           onMouseEnter={(e) => {
             e.currentTarget.style.borderColor = '#777';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.borderColor = '#ccc';
           }}>
        <div 
          className="block cursor-pointer"
          onClick={handleClick}
        >
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover cursor-crosshair transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold text-center group-hover:font-bold transition-all duration-300 font-raleway"
                style={{ color: '#444444' }}>
              {title}
            </h3>
            {productNumber && (
              <div className="text-center mt-1">
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {productNumber}
                </span>
              </div>
            )}
            {categoryName && (
              <p className="text-sm font-raleway text-center mt-2" style={{ color: '#444444' }}>
                {categoryName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;