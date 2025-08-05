import React, { useState } from 'react';
import { Plus, Edit3, Save, X, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';

interface CategoriesManagerProps {
  categories: Category[];
  onUpdate: () => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({ categories, onUpdate }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ id: '', label: '', disabled: false });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({ label: '', disabled: false });

  const handleEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditForm({
      label: category.label,
      disabled: category.disabled,
    });
  };

  const handleSaveEdit = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          label: editForm.label,
          disabled: editForm.disabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;

      setEditingCategory(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.id.trim() || !newCategory.label.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          id: newCategory.id.toLowerCase().replace(/\s+/g, ''),
          label: newCategory.label,
          disabled: newCategory.disabled,
        }]);

      if (error) throw error;

      setNewCategory({ id: '', label: '', disabled: false });
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ disabled: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating category status:', error);
      alert('Failed to update category status');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (categoryId === 'all') {
      alert('Cannot delete the "All" category');
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This will also affect products in this category.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Categories Management</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category ID *
              </label>
              <input
                type="text"
                value={newCategory.id}
                onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., newcategory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Label *
              </label>
              <input
                type="text"
                value={newCategory.label}
                onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., New Category"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="newDisabled"
              checked={newCategory.disabled}
              onChange={(e) => setNewCategory(prev => ({ ...prev, disabled: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="newDisabled" className="ml-2 block text-sm text-gray-700">
              Disabled (not shown in filters)
            </label>
          </div>
          <div className="mt-6 flex items-center space-x-4">
            <button
              onClick={handleAddCategory}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Category</span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCategory({ id: '', label: '', disabled: false, sort_order: 0 });
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCategory === category.id ? (
                      <input
                        type="text"
                        value={editForm.label}
                        onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{category.label}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{category.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {category.disabled ? 'Disabled' : 'Active'}
                      </span>
                      {editingCategory === category.id && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.disabled}
                            onChange={(e) => setEditForm(prev => ({ ...prev, disabled: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-1 text-xs text-gray-600">Disabled</span>
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editingCategory === category.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(category.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleCategoryStatus(category.id, category.disabled)}
                            className={`${category.disabled ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                          >
                            {category.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          {category.id !== 'all' && (
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;