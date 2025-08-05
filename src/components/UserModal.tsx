import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Calendar, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { resetPassword } from '../lib/auth';

interface UserData {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

interface UserModalProps {
  user: UserData | null;
  onClose: () => void;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'admin',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetEmailStatus, setResetEmailStatus] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        role: user.role,
        password: '' // Never pre-fill password
      });
    } else {
      // Reset form for new user
      setFormData({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'admin',
        password: ''
      });
    }
    setErrors({});
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Password validation for new users
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            email: formData.email,
            user_metadata: {
              first_name: formData.first_name,
              last_name: formData.last_name
            }
          }
        );

        if (authError) throw authError;

        // Update user record in users table
        const { error: userError } = await supabase
          .from('users')
          .update({
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (userError) throw userError;
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name
          }
        });

        if (authError) throw authError;

        // Create user record in users table
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role
          }]);

        if (userError) throw userError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to save user. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSendPasswordReset = async () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required to send password reset' }));
      return;
    }

    setResetEmailStatus({ loading: true, success: false, error: null });

    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        throw error;
      }

      setResetEmailStatus({ 
        loading: false, 
        success: true, 
        error: null 
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResetEmailStatus({ loading: false, success: false, error: null });
      }, 5000);

    } catch (error) {
      console.error('Error sending password reset email:', error);
      setResetEmailStatus({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send password reset email' 
      });

      // Clear error message after 10 seconds
      setTimeout(() => {
        setResetEmailStatus({ loading: false, success: false, error: null });
      }, 10000);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <User className="w-6 h-6 mr-2" />
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{errors.submit}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Personal Information
              </h3>

              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                    errors.first_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                    errors.last_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>}
              </div>

              {/* User ID (read-only for existing users) */}
              {user && (
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="user_id"
                    value={formData.id}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    User ID cannot be changed
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Account Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Account Information
              </h3>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                    errors.role ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>}
              </div>

              {/* Password (only for new users) */}
              {!user && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter secure password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters long
                  </p>
                </div>
              )}

              {/* Password Reset (for existing users) */}
              {user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Reset
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleSendPasswordReset}
                      disabled={resetEmailStatus.loading || !formData.email.trim()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
                    >
                      {resetEmailStatus.loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Password Reset Email</span>
                        </>
                      )}
                    </button>

                    {/* Reset Email Status Messages */}
                    {resetEmailStatus.success && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Password reset email sent successfully to {formData.email}
                        </span>
                      </div>
                    )}

                    {resetEmailStatus.error && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-700 dark:text-red-400">
                          {resetEmailStatus.error}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      The user will receive an email with instructions to reset their password.
                    </p>
                  </div>
                </div>
              )}
              {/* Created Date (for existing users) */}
              {user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Date Created
                  </label>
                  <input
                    type="text"
                    value={new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* User Guidelines */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">User Management Guidelines:</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Admin users have full access to all system features</li>
              <li>• Regular users have limited access based on role permissions</li>
              <li>• Email addresses must be unique across all users</li>
              <li>• Password changes for existing users should be done through Supabase Auth</li>
              <li>• User accounts are managed through Supabase Authentication</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : user ? 'Update User' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;