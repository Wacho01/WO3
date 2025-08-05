import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { type Product, supabase } from '../lib/supabase';
import { Search, Filter } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  activeFilter: string;
  searchTerm: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, activeFilter, searchTerm }) => {
  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category first (if not 'all' and no search term)
    if (activeFilter !== 'all' && !searchTerm.trim()) {
      result = result.filter(product => product.category_id === activeFilter);
    }

    // Then filter by search term (searches across all products when searching)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.product_name.toLowerCase().includes(searchLower) ||
        (product.subtitle && product.subtitle.toLowerCase().includes(searchLower)) ||
        (product.category_id && product.category_id.toLowerCase().includes(searchLower)) ||
        ((product as any).categories?.label && (product as any).categories.label.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [products, activeFilter, searchTerm]);

  const getResultsText = () => {
    const total = filteredProducts.length;
    const totalProducts = products.length;
    
    if (searchTerm.trim()) {
      return {
        main: `Found ${total} result${total !== 1 ? 's' : ''} for "${searchTerm}"`,
        sub: `Searched across ${totalProducts} products`
      };
    }
    
    if (activeFilter !== 'all') {
      const categoryName = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
      return {
        main: `${total} product${total !== 1 ? 's' : ''} in ${categoryName}`,
        sub: null
      };
    }
    
    return {
      main: `Showing all ${total} products`,
      sub: null
    };
  };

  const resultsInfo = getResultsText();

  const handleProductView = async (productId: string) => {
    try {
      await supabase.rpc('log_product_activity', {
        product_id: productId,
        activity_type: 'view',
        activity_data: { source: 'catalog' }
      });
    } catch (error) {
      console.error('Error logging product view:', error);
    }
  };

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Results Summary */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {searchTerm.trim() ? (
              <Search className="h-5 w-5" style={{ color: '#217cac' }} />
            ) : (
              <Filter className="h-5 w-5" style={{ color: '#217cac' }} />
            )}
            <p className="text-xl font-raleway font-semibold" style={{ color: '#217cac' }}>
              {resultsInfo.main}
            </p>
          </div>
          {resultsInfo.sub && (
            <p className="text-sm font-raleway" style={{ color: '#8c8c8c' }}>
              {resultsInfo.sub}
            </p>
          )}
        </div>
        
        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="transform transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <ProductCard
                  title={product.product_name}
                  subtitle={product.subtitle}
                  image={product.image}
                  categoryName={(product as any).categories?.label}
                  href={product.href || '#'}
                  productNumber={(product as any).product_number}
                  onView={() => handleProductView(product.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* No Results State */
          <div className="text-center py-20">
            <div className="mb-6">
              <Search className="mx-auto h-20 w-20" style={{ color: '#bbb' }} />
            </div>
            <h3 className="text-2xl font-raleway font-semibold mb-3" style={{ color: '#444444' }}>
              {searchTerm.trim() 
                ? `No products found for "${searchTerm}"` 
                : 'No products found in this category'
              }
            </h3>
            <p className="text-lg font-raleway mb-6" style={{ color: '#8c8c8c' }}>
              {searchTerm.trim()
                ? 'Try adjusting your search terms or browse by category'
                : 'Try selecting a different category or search for specific products'
              }
            </p>
            
            {/* Search Suggestions */}
            {searchTerm.trim() && (
              <div className="max-w-md mx-auto">
                <p className="text-sm font-raleway mb-3" style={{ color: '#8c8c8c' }}>
                  Popular searches:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['slide', 'sprayer', 'elephant', 'truck', 'dolphin'].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="px-3 py-1 text-sm rounded-full border transition-colors duration-200 font-raleway"
                      style={{ 
                        borderColor: '#217cac', 
                        color: '#217cac',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#217cac';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#217cac';
                      }}
                      onClick={() => {
                        // This would trigger a search - you could implement this
                        console.log(`Search for: ${suggestion}`);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;