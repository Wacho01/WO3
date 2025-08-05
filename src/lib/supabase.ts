import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging to help identify configuration issues
console.log('Supabase Configuration Debug:');
console.log('URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);
console.log('Current origin:', window.location.origin);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  console.error('Please check your .env file and ensure it contains:');
  console.error('VITE_SUPABASE_URL=your-supabase-project-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
}

// Validate URL format
if (supabaseUrl) {
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.error('Invalid Supabase URL format:', supabaseUrl);
    console.error('URL should be in format: https://your-project.supabase.co');
  }
}

// Create a fallback client or null if credentials are missing
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
}) : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Helper function to get configuration status
export const getSupabaseConfigStatus = () => {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl,
    currentOrigin: window.location.origin
  };
};

// Enhanced error handling for common issues
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error details:', error);
  
  // Handle table not found errors
  if (error.code === '42P01' || error.message?.includes('does not exist')) {
    return {
      type: 'table_missing',
      message: 'Database tables are not set up. Please run the database migrations first.',
      suggestions: [
        'Go to your Supabase dashboard',
        'Navigate to SQL Editor',
        'Run the initialization migration',
        'Refresh the page after migration completes'
      ]
    };
  }
  
  // Handle relationship errors
  if (error.code === 'PGRST200' || error.message?.includes('Could not find a relationship')) {
    return {
      type: 'relationship',
      message: 'Database relationships are not properly configured.',
      suggestions: [
        'Ensure foreign key constraints are created',
        'Check that category_id column exists in products table',
        'Verify the database migration ran successfully'
      ]
    };
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return {
      type: 'connection',
      message: 'Unable to connect to Supabase. Please check:\n' +
               '1. Your internet connection\n' +
               '2. Supabase project is active and accessible\n' +
               '3. CORS settings in Supabase dashboard\n' +
               '4. Environment variables are correct',
      suggestions: [
        'Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file',
        'Check Supabase project status in dashboard',
        'Add your domain to CORS origins in Supabase settings',
        'Ensure Supabase project is not paused or deleted'
      ]
    };
  }
  
  if (error.message?.includes('Invalid API key')) {
    return {
      type: 'auth',
      message: 'Invalid Supabase API key. Please check your VITE_SUPABASE_ANON_KEY.',
      suggestions: [
        'Verify the anon key in your Supabase dashboard',
        'Ensure the key is copied correctly without extra spaces',
        'Check if the key has expired or been regenerated'
      ]
    };
  }
  
  if (error.message?.includes('CORS')) {
    return {
      type: 'cors',
      message: 'CORS policy is blocking the request.',
      suggestions: [
        `Add ${window.location.origin} to allowed origins in Supabase dashboard`,
        'Check Authentication > Settings > Site URL configuration',
        'Verify API settings allow requests from your domain'
      ]
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unknown error occurred',
    suggestions: [
      'Check browser console for more details',
      'Verify Supabase project configuration',
      'Try refreshing the page'
    ]
  };
};

// Test connection function with better error handling
export const testConnection = async () => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured properly', getSupabaseConfigStatus());
    return false;
  }
  
  try {
    // Test with a simple query that should work even with RLS
    const { data, error } = await supabase!
      .from('categories')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', handleSupabaseError(error));
      return false;
    }
    console.log('Supabase connection test successful', { dataLength: data?.length });
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    console.error('Error details:', handleSupabaseError(error));
    return false;
  }
};

// Connection status component helper
export const getConnectionStatusMessage = () => {
  const config = getSupabaseConfigStatus();
  
  if (!config.hasUrl) {
    return {
      type: 'error',
      title: 'Missing Supabase URL',
      message: 'VITE_SUPABASE_URL is not set in your environment variables.',
      action: 'Please add your Supabase project URL to the .env file.'
    };
  }
  
  if (!config.hasKey) {
    return {
      type: 'error',
      title: 'Missing Supabase Key',
      message: 'VITE_SUPABASE_ANON_KEY is not set in your environment variables.',
      action: 'Please add your Supabase anon key to the .env file.'
    };
  }
  
  return {
    type: 'success',
    title: 'Configuration Complete',
    message: 'Supabase credentials are configured.',
    action: 'Testing connection...'
  };
};

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          label: string;
          disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          label: string;
          disabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          disabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          product_name: string; // This represents the product name in the database
          subtitle: string | null; // This represents the product activity in the database
          image: string;
          category_id: string | null;
          href: string | null;
          featured: boolean;
          active: boolean;
          file_url: string | null;
          file_name: string | null;
          file_type: string | null;
          is_deleted: boolean;
          product_number: string;
          last_activity: string;
          view_count: number;
          first_name: string | null;
          last_name: string | null;
          activity_log: any[];
          created_at: string;
          updated_at: string;
          flow_requirement_value: number | null;
          flow_requirement_unit: string | null;
          flow_requirement_lpm: number | null;
          flow_requirement_lpm_unit: string | null;
          product_data_sheet_url: string | null;
          top_svg_file_url: string | null;
          side_svg_file_url: string | null;
          width_in: number | null;
          width_cm: number | null;
          length_in: number | null;
          length_cm: number | null;
          height_in: number | null;
          height_cm: number | null;
        };
        Insert: {
          id?: string;
          product_name: string; // This represents the product name in the database
          subtitle?: string | null; // This represents the product activity in the database
          image: string;
          category_id?: string | null;
          href?: string | null;
          featured?: boolean;
          active?: boolean;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          is_deleted?: boolean;
          product_number?: string;
          last_activity?: string;
          view_count?: number;
          first_name?: string | null;
          last_name?: string | null;
          activity_log?: any[];
          created_at?: string;
          updated_at?: string;
          flow_requirement_value?: number | null;
          flow_requirement_unit?: string | null;
          flow_requirement_lpm?: number | null;
          flow_requirement_lpm_unit?: string | null;
          product_data_sheet_url?: string | null;
          top_svg_file_url?: string | null;
          side_svg_file_url?: string | null;
          width_in?: number | null;
          width_cm?: number | null;
          length_in?: number | null;
          length_cm?: number | null;
          height_in?: number | null;
          height_cm?: number | null;
        };
        Update: {
          id?: string;
          product_name?: string; // This represents the product name in the database
          first_name?: string | null;
          last_name?: string | null;
          subtitle?: string | null; // This represents the product activity in the database
          image?: string;
          category_id?: string | null;
          href?: string | null;
          featured?: boolean;
          active?: boolean;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          is_deleted?: boolean;
          product_number?: string;
          last_activity?: string;
          view_count?: number;
          activity_log?: any[];
          created_at?: string;
          updated_at?: string;
          flow_requirement_value?: number | null;
          flow_requirement_unit?: string | null;
          flow_requirement_lpm?: number | null;
          flow_requirement_lpm_unit?: string | null;
          product_data_sheet_url?: string | null;
          top_svg_file_url?: string | null;
          side_svg_file_url?: string | null;
          width_in?: number | null;
          width_cm?: number | null;
          length_in?: number | null;
          length_cm?: number | null;
          height_in?: number | null;
          height_cm?: number | null;
        };
      };
    };
  };
}

export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type User = Database['public']['Tables']['users']['Row'];