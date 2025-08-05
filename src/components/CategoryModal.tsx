import React, { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle, Image } from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    disabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        label: category.label,
        disabled: category.disabled,
      });
    } else {
      // Reset form for new category
      setFormData({
        id: '',
        label: '',
        disabled: false,
      });
    }
    setErrors({});
    setImageFile(null);
    setImagePreview('');
  }, [category]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Category name is required';
    }

    if (!category && !formData.id.trim()) {
      newErrors.id = 'Category ID is required for new categories';
    }

    // Validate ID format (lowercase, no spaces, alphanumeric + hyphens/underscores)
    if (!category && formData.id.trim()) {
      const idPattern = /^[a-z0-9_-]+$/;
      if (!idPattern.test(formData.id.trim())) {
        newErrors.id = 'Category ID must be lowercase letters, numbers, hyphens, or underscores only';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image file must be less than 2MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase!.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase!.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        id: category ? category.id : formData.id.trim().toLowerCase(),
        label: formData.label.trim(),
        disabled: formData.disabled,
      };

      if (category) {
        // Update existing category
        const { error } = await supabase!
          .from('categories')
          .update({
            label: categoryData.label,
            disabled: categoryData.disabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase!
          .from('categories')
          .insert([categoryData]);

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('A category with this ID already exists');
          }
          throw error;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save category. Please try again.' });
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

  const generateIdFromLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {category ? 'Edit Category' : 'Add New Category'}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="label"
                  value={formData.label}
                  onChange={(e) => {
                    handleInputChange('label', e.target.value);
                    // Auto-generate ID for new categories
                    if (!category && e.target.value) {
                      const generatedId = generateIdFromLabel(e.target.value);
                      handleInputChange('id', generatedId);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                    errors.label ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter category name"
                />
                {errors.label && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.label}</p>}
              </div>

              {/* Category ID (only for new categories) */}
              {!category && (
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category ID *
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(URL-friendly identifier)</span>
                  </label>
                  <input
                    type="text"
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value.toLowerCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm transition-colors ${
                      errors.id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="category-id"
                  />
                  {errors.id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Used in URLs and database. Auto-generated from name, but you can customize it.
                  </p>
                </div>
              )}


              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={formData.disabled}
                  onChange={(e) => handleInputChange('disabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="disabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Disabled (hidden from public filters)
                </label>
              </div>
            </div>

            {/* Right Column - Optional Image */}
            <div className="space-y-6">
              {/* Optional Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Icon/Image (Optional)
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Image Upload Input */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Image className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {imageFile ? imageFile.name : 'Click to upload icon/image'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 2MB
                    </span>
                  </label>
                </div>

                {errors.image && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>}
              </div>

              {/* Category Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Category Guidelines:</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Category names should be descriptive and user-friendly</li>
                  <li>• Disabled categories are hidden from public filters</li>
                  <li>• Icons/images are optional but help with visual identification</li>
                  <li>• Category IDs cannot be changed after creation</li>
                </ul>
              </div>
            </div>
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
              <span>{loading ? 'Saving...' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;