import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Filter, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { signOut, getCurrentUser, type AuthUser } from '../lib/auth';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

// Dashboard Components
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductsManager from '../components/admin/ProductsManager';
import CategoriesManager from '../components/admin/CategoriesManager';
import UsersManager from '../components/admin/UsersManager';
import SettingsManager from '../components/admin/SettingsManager';

type TabType = 'dashboard' | 'products' | 'categories' | 'users' | 'settings';

interface ConnectionStatus {
  isConnected: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: true
  });

  // Check connection and authentication
  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        console.log('Checking Supabase configuration...');
        
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          throw new Error('Supabase is not configured. Please check your environment variables.');
        }

        console.log('Supabase configured, testing connection...');

        // Test basic connection by checking if we can access the categories table
        const { data: categoriesTest, error: categoriesError } = await supabase
          .from('categories')
          .select('count')
          .limit(1);

        if (categoriesError) {
          console.error('Categories table test failed:', categoriesError);
          throw new Error(`Database connection failed: ${categoriesError.message}`);
        }

        console.log('Database connection successful');

        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check failed:', sessionError);
          throw new Error(`Authentication check failed: ${sessionError.message}`);
        }

        if (!session) {
          console.log('No active session found');
          if (mounted) {
            setConnectionStatus({
              isConnected: true,
              isAuthenticated: false,
              user: null,
              error: null,
              isLoading: false
            });
          }
          return;
        }

        console.log('Session found, getting user details...');

        // Get user details
        const user = await getCurrentUser();
        
        if (!user) {
          throw new Error('Failed to get user details');
        }

        console.log('User authenticated:', user.email);

        if (mounted) {
          setConnectionStatus({
            isConnected: true,
            isAuthenticated: true,
            user,
            error: null,
            isLoading: false
          });
        }

      } catch (error) {
        console.error('Connection check failed:', error);
        if (mounted) {
          setConnectionStatus({
            isConnected: false,
            isAuthenticated: false,
            user: null,
            error: error instanceof Error ? error.message : 'Unknown connection error',
            isLoading: false
          });
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading state
  if (connectionStatus.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingIndicator size="lg" variant="dashboard" message="Connecting to Supabase..." />
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Checking database connection...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show connection error
  if (connectionStatus.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage 
            message={connectionStatus.error}
            onRetry={() => window.location.reload()}
          />
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Troubleshooting Steps:
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Check your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
              <li>• Ensure your Supabase project is active and accessible</li>
              <li>• Run the database migrations in your Supabase dashboard</li>
              <li>• Check if RLS policies are properly configured</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!connectionStatus.isAuthenticated) {
    return <LoginForm onSuccess={() => window.location.reload()} />;
  }

  // Main admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Connected</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {connectionStatus.user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:transition-none`}>
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: Filter },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as TabType);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'categories' && <CategoriesManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        onSuccess();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Need to create an admin account?
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-400">
            Go to your Supabase Dashboard → Authentication → Users → Add user
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;