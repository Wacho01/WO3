import React, { useState, useEffect } from 'react';
import { Package, Filter, Users, TrendingUp, Eye, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingIndicator from '../LoadingIndicator';
import StatsLoadingSkeleton from '../StatsLoadingSkeleton';
import ProductModal from '../ProductModal';
import CategoryModal from '../CategoryModal';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalViews: number;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('active, featured, view_count, is_deleted')
        .neq('is_deleted', true);

      if (productsError) throw productsError;

      // Fetch categories count
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      if (categoriesError) throw categoriesError;

      // Fetch users count
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (usersError) throw usersError;

      // Calculate stats
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.active).length || 0;
      const featuredProducts = products?.filter(p => p.featured).length || 0;
      const totalViews = products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

      setStats({
        totalProducts,
        activeProducts,
        featuredProducts,
        totalCategories: categories?.length || 0,
        totalUsers: users?.length || 0,
        totalViews
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setShowProductModal(true);
  };

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleCloseModals = () => {
    setShowProductModal(false);
    setShowCategoryModal(false);
  };

  const handleSave = () => {
    fetchDashboardStats(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <StatsLoadingSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Eye,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Featured Products',
      value: stats.featuredProducts,
      icon: Star,
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Filter,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: TrendingUp,
      color: 'pink',
      bgColor: 'bg-pink-100 dark:bg-pink-900',
      iconColor: 'text-pink-600 dark:text-pink-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={handleAddProduct}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Add Product</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product</p>
          </button>
          
          <button 
            onClick={handleAddCategory}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Filter className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Add Category</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new category</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Manage Users</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">User administration</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <TrendingUp className="w-8 h-8 text-pink-600 dark:text-pink-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">View Analytics</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Product performance</p>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={null}
          onClose={handleCloseModals}
          onSave={handleSave}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          category={null}
          onClose={handleCloseModals}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DashboardOverview;