import { useState, useEffect } from 'react';
import { 
  supabase, 
  testConnection, 
  type Category, 
  isSupabaseConfigured,
  handleSupabaseError
} from '../lib/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please set up your environment variables.');
      }

      console.log('Fetching categories...');
      
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error('Unable to connect to Supabase. Please check your configuration and network connection.');
      }

      const { data, error: supabaseError } = await supabase!
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (supabaseError) {
        console.error('Supabase query error:', supabaseError);
        const errorInfo = handleSupabaseError(supabaseError);
        throw new Error(errorInfo.message);
      }

      console.log('Categories fetched successfully:', data?.length || 0, 'items');
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorInfo = err instanceof Error ? handleSupabaseError(err) : { message: 'Failed to fetch categories' };
      const errorMessage = errorInfo.message || 'Failed to fetch categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
};