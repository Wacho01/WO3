import { useState, useEffect } from 'react';
import { 
  supabase, 
  type Product, 
  isSupabaseConfigured,
  testConnection,
  handleSupabaseError
} from '../lib/supabase';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please set up your environment variables.');
      }

      console.log('Fetching products...');
      
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error('Unable to connect to Supabase. Please check your configuration and network connection.');
      }

      const { data, error: supabaseError } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, label)
        `)
        .eq('active', true)
        .neq('is_deleted', true)
        .order('product_name', { ascending: true }); // Order by product name alphabetically

      if (supabaseError) {
        console.error('Supabase query error:', supabaseError);
        const errorInfo = handleSupabaseError(supabaseError);
        throw supabaseError;
      }

      console.log('Products fetched successfully:', data?.length || 0, 'items');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorInfo = err instanceof Error ? handleSupabaseError(err) : { message: 'Failed to fetch products' };
      const errorMessage = errorInfo.message || 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch
  };
};