import React, { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle, FileText, Image, Trash2 } from 'lucide-react';
import { supabase, type Product, type Category } from '../lib/supabase';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    category_id: '',
    href: '',
    featured: false,
    active: true,
    file_url: '',
    file_name: '',
    file_type: '',
    product_number: '',
    flow_requirement_value: null,
    flow_requirement_unit: 'GPM',
    flow_requirement_lpm: null,
    flow_requirement_lpm_unit: 'LPM',
    product_data_sheet_url: '',
    top_svg_file_url: '',
    side_svg_file_url: '',
    width_in: null,
    width_cm: null,
    length_in: null,
    length_cm: null,
    height_in: null,
    height_cm: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [dataSheetFile, setDataSheetFile] = useState<File | null>(null);
  const [topSvgFile, setTopSvgFile] = useState<File | null>(null);
  const [sideSvgFile, setSideSvgFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [topSvgPreview, setTopSvgPreview] = useState<string>('');
  const [sideSvgPreview, setSideSvgPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ image: number; document: number }>({
    image: 0,
    document: 0,
    dataSheet: 0,
    topSvg: 0,
    sideSvg: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.product_name,
        subtitle: product.subtitle || '',
        image: product.image,
        category_id: product.category_id || '',
        href: product.href || '',
        featured: product.featured,
        active: product.active,
        file_url: (product as any).file_url || '',
        file_name: (product as any).file_name || '',
        file_type: (product as any).file_type || '',
        product_number: (product as any).product_number || '',
        flow_requirement_value: (product as any).flow_requirement_value || null,
        flow_requirement_unit: (product as any).flow_requirement_unit || 'GPM',
        flow_requirement_lpm: (product as any).flow_requirement_lpm || null,
        flow_requirement_lpm_unit: (product as any).flow_requirement_lpm_unit || 'LPM',
        product_data_sheet_url: (product as any).product_data_sheet_url || '',
        top_svg_file_url: (product as any).top_svg_file_url || '',
        side_svg_file_url: (product as any).side_svg_file_url || '',
        width_in: (product as any).width_in || null,
        width_cm: (product as any).width_cm || null,
        length_in: (product as any).length_in || null,
        length_cm: (product as any).length_cm || null,
        height_in: (product as any).height_in || null,
        height_cm: (product as any).height_cm || null
      });
      setImagePreview(product.image);
      setTopSvgPreview((product as any).top_svg_file_url || '');
      setSideSvgPreview((product as any).side_svg_file_url || '');
    } else {
      // Reset form for new product
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        category_id: '',
        href: '',
        featured: false,
        active: true,
        file_url: '',
        file_name: '',
        file_type: '',
        product_number: '',
        flow_requirement_value: null,
        flow_requirement_unit: 'GPM',
        flow_requirement_lpm: null,
        flow_requirement_lpm_unit: 'LPM',
        product_data_sheet_url: '',
        top_svg_file_url: '',
        side_svg_file_url: '',
        width_in: null,
        width_cm: null,
        length_in: null,
        length_cm: null,
        height_in: null,
        height_cm: null
      });
      setImagePreview('');
      setTopSvgPreview('');
      setSideSvgPreview('');
    }
    setErrors({});
    setImageFile(null);
    setDocumentFile(null);
    setDataSheetFile(null);
    setTopSvgFile(null);
    setSideSvgFile(null);
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.product_number.trim()) {
      newErrors.product_number = 'Product number is required';
    }
    if (!formData.image.trim() && !imageFile) {
      newErrors.image = 'Image is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image file must be less than 5MB' }));
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (3D model formats)
      const allowedTypes = [
        'application/octet-stream', // .fbx, .obj files often have this MIME type
        'model/gltf-binary', // .glb files
        'model/gltf+json', // .gltf files
        'text/plain' // Some .obj files may have this MIME type
      ];
      
      // Also check file extension since MIME types for 3D files can be inconsistent
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.fbx', '.glb', '.gltf', '.obj'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        setErrors(prev => ({ ...prev, document: 'Please select a valid 3D model file (FBX, GLB, GLTF, OBJ)' }));
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, document: '3D model file must be less than 50MB' }));
        return;
      }

      setDocumentFile(file);
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleDataSheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF and common document formats)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, dataSheet: 'Please select a valid document file (PDF, DOC, DOCX, XLS, XLSX, TXT)' }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, dataSheet: 'Data sheet file must be less than 10MB' }));
        return;
      }

      setDataSheetFile(file);
      setErrors(prev => ({ ...prev, dataSheet: '' }));
    }
  };

  const handleTopSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        setErrors(prev => ({ ...prev, topSvg: 'Please select a valid SVG file' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, topSvg: 'SVG file must be less than 2MB' }));
        return;
      }

      setTopSvgFile(file);
      setErrors(prev => ({ ...prev, topSvg: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setTopSvgPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSideSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        setErrors(prev => ({ ...prev, sideSvg: 'Please select a valid SVG file' }));
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, sideSvg: 'SVG file must be less than 2MB' }));
        return;
      }

      setSideSvgFile(file);
      setErrors(prev => ({ ...prev, sideSvg: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSideSvgPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to convert GPM to LPM
  const convertGpmToLpm = (gpmValue: number | null): number | null => {
    if (gpmValue === null || gpmValue === undefined || isNaN(gpmValue)) {
      return null;
    }
    // 1 GPM = 3.78541 LPM
    return Math.round((gpmValue * 3.78541) * 100) / 100; // Round to 2 decimal places
  };

  // Handle flow requirement change with automatic LPM conversion
  const handleFlowRequirementChange = (value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    const lpmValue = convertGpmToLpm(numericValue);
    
    setFormData(prev => ({
      ...prev,
      flow_requirement_value: numericValue,
      flow_requirement_lpm: lpmValue
    }));
    
    // Clear error when user starts typing
    if (errors.flow_requirement_value) {
      setErrors(prev => ({ ...prev, flow_requirement_value: '' }));
    }
  };

  // Handle dimension change with automatic CM conversion
  const handleDimensionChange = (field: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    let cmValue = null;
    
    // Convert inches to centimeters (1 inch = 2.54 cm)
    if (numericValue !== null && !isNaN(numericValue)) {
      cmValue = Math.round((numericValue * 2.54) * 100) / 100; // Round to 2 decimal places
    }
    
    // Determine which CM field to update
    let cmField = '';
    if (field === 'width_in') cmField = 'width_cm';
    else if (field === 'length_in') cmField = 'length_cm';
    else if (field === 'height_in') cmField = 'height_cm';
    
    setFormData(prev => ({
      ...prev,
      [field]: numericValue,
      [cmField]: cmValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image;
      let fileUrl = formData.file_url;
      let fileName = formData.file_name;
      let fileType = formData.file_type;
      let dataSheetUrl = formData.product_data_sheet_url;
      let topSvgUrl = formData.top_svg_file_url;
      let sideSvgUrl = formData.side_svg_file_url;

      // Upload image if new file selected
      if (imageFile) {
        setUploadProgress(prev => ({ ...prev, image: 25 }));
        imageUrl = await uploadFile(imageFile, 'product-assets', 'images');
        setUploadProgress(prev => ({ ...prev, image: 100 }));
      }

      // Upload document if new file selected
      if (documentFile) {
        setUploadProgress(prev => ({ ...prev, document: 25 }));
        fileUrl = await uploadFile(documentFile, 'product-assets', 'documents');
        fileName = documentFile.name;
        fileType = documentFile.type;
        setUploadProgress(prev => ({ ...prev, document: 100 }));
      }

      // Upload data sheet if new file selected
      if (dataSheetFile) {
        setUploadProgress(prev => ({ ...prev, dataSheet: 25 }));
        dataSheetUrl = await uploadFile(dataSheetFile, 'product-assets', 'data-sheets');
        setUploadProgress(prev => ({ ...prev, dataSheet: 100 }));
      }

      // Upload top SVG if new file selected
      if (topSvgFile) {
        setUploadProgress(prev => ({ ...prev, topSvg: 25 }));
        topSvgUrl = await uploadFile(topSvgFile, 'product-assets', 'svg-files');
        setUploadProgress(prev => ({ ...prev, topSvg: 100 }));
      }

      // Upload side SVG if new file selected
      if (sideSvgFile) {
        setUploadProgress(prev => ({ ...prev, sideSvg: 25 }));
        sideSvgUrl = await uploadFile(sideSvgFile, 'product-assets', 'svg-files');
        setUploadProgress(prev => ({ ...prev, sideSvg: 100 }));
      }

      const productData = {
        product_name: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        image: imageUrl,
        category_id: formData.category_id || null,
        href: formData.href.trim() || null,
        featured: formData.featured,
        active: formData.active,
        file_url: fileUrl || null,
        file_name: fileName || null,
       file_type: fileType || null,
       product_number: formData.product_number.trim(),
       flow_requirement_value: formData.flow_requirement_value,
       flow_requirement_unit: formData.flow_requirement_unit,
       flow_requirement_lpm: formData.flow_requirement_lpm,
       flow_requirement_lpm_unit: formData.flow_requirement_lpm_unit,
       product_data_sheet_url: dataSheetUrl || null,
       top_svg_file_url: topSvgUrl || null,
       side_svg_file_url: sideSvgUrl || null,
       width_in: formData.width_in,
       width_cm: formData.width_cm,
       length_in: formData.length_in,
       length_cm: formData.length_cm,
       height_in: formData.height_in,
       height_cm: formData.height_cm
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
      setUploadProgress({ image: 0, document: 0, dataSheet: 0, topSvg: 0, sideSvg: 0 });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeCurrentFile = (type: 'image' | 'document' | 'dataSheet') => {
    if (type === 'image') {
      setImageFile(null);
      setImagePreview('');
      setFormData(prev => ({ ...prev, image: '' }));
    } else if (type === 'document') {
      setDocumentFile(null);
      setFormData(prev => ({ 
        ...prev, 
        file_url: '', 
        file_name: '', 
        file_type: ''
      }));
    } else if (type === 'dataSheet') {
      setDataSheetFile(null);
      setFormData(prev => ({ 
        ...prev, 
        product_data_sheet_url: ''
      }));
    }
  };

  const removeSvgFile = (type: 'top' | 'side') => {
    if (type === 'top') {
      setTopSvgFile(null);
      setTopSvgPreview('');
      setFormData(prev => ({ ...prev, top_svg_file_url: '' }));
    } else if (type === 'side') {
      setSideSvgFile(null);
      setSideSvgPreview('');
      setFormData(prev => ({ ...prev, side_svg_file_url: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
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
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors`}
                  placeholder="Enter product name"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
              </div>

              {/* Product Number */}
              <div>
                <label htmlFor="product_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Number *
                </label>
                <input
                  type="text"
                  id="product_number"
                  value={formData.product_number}
                  onChange={(e) => handleInputChange('product_number', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm transition-colors ${
                    errors.product_number ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter product number (e.g., WO-2025-0001)"
                />
                {errors.product_number && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product_number}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter a unique product identifier (e.g., WO-2025-0001, PROD-001)
                </p>
              </div>

              {/* Subtitle/Description */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity
                </label>
                <textarea
                  id="subtitle"
                  rows={4}
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Enter product activity type"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors`}
                >
                  <option value="">Select a category</option>
                  {categories.filter(cat => cat.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>}
              </div>

              {/* Link URL */}
              <div>
                <label htmlFor="href" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Link URL
                </label>
                <input
                  type="url"
                  id="href"
                  value={formData.href}
                  onChange={(e) => handleInputChange('href', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://example.com/product-page"
                />
              </div>

              {/* Flow Requirement */}
              <div>
                <label htmlFor="flow_requirement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flow Requirement
                </label>
                <div className="space-y-3">
                  {/* GPM Input */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          id="flow_requirement"
                          step="0.01"
                          min="0"
                          value={formData.flow_requirement_value || ''}
                          onChange={(e) => handleFlowRequirementChange(e.target.value)}
                          className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                            errors.flow_requirement_value ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">GPM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* LPM Display (Auto-calculated) */}
                  {formData.flow_requirement_value && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.flow_requirement_lpm || ''}
                            readOnly
                            className="w-full px-3 py-2 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed transition-colors"
                            placeholder="Auto-calculated"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">LPM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {errors.flow_requirement_value && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.flow_requirement_value}</p>
                )}
                
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter flow requirement in GPM (Gallons per Minute). LPM conversion is automatic.
                </p>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dimensions
                </label>
                <div className="space-y-4">
                  {/* Width */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Width
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.width_in || ''}
                          onChange={(e) => handleDimensionChange('width_in', e.target.value)}
                          className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IN</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.width_cm || ''}
                          readOnly
                          className="w-full px-3 py-2 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed transition-colors"
                          placeholder="Auto-calculated"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">CM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Length
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.length_in || ''}
                          onChange={(e) => handleDimensionChange('length_in', e.target.value)}
                          className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IN</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.length_cm || ''}
                          readOnly
                          className="w-full px-3 py-2 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed transition-colors"
                          placeholder="Auto-calculated"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">CM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Height
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.height_in || ''}
                          onChange={(e) => handleDimensionChange('height_in', e.target.value)}
                          className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">IN</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.height_cm || ''}
                          readOnly
                          className="w-full px-3 py-2 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed transition-colors"
                          placeholder="Auto-calculated"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">CM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Enter dimensions in inches. Centimeter conversion is automatic (1 inch = 2.54 cm).
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active (visible to public)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Featured product
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - File Uploads */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image *
                </label>
                
                {/* Current Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeCurrentFile('image')}
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
                    <Image className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadProgress.image > 0 && uploadProgress.image < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.image}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.image && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>}
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  3D Feature Model File
                </label>
                
                {/* Current File Display */}
                {formData.file_name && !documentFile && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{formData.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCurrentFile('document')}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Document Upload Input */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    id="document-upload"
                    accept=".fbx,.glb,.gltf,.obj"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {documentFile ? documentFile.name : 'Click to upload 3D model'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      FBX, GLB, GLTF, OBJ files up to 50MB
                    </span>
                  </label>
                </div>

                {/* Upload Progress */}
                {uploadProgress.document > 0 && uploadProgress.document < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.document}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.document && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.document}</p>}
              </div>

              {/* Product Data Sheet Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Data Sheet File
                </label>
                
                {/* Current Data Sheet Display */}
                {formData.product_data_sheet_url && !dataSheetFile && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Data Sheet File</span>
                      <a 
                        href={formData.product_data_sheet_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline transition-colors"
                      >
                        View File
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCurrentFile('dataSheet')}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Data Sheet Upload Input */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    id="datasheet-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleDataSheetChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="datasheet-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {dataSheetFile ? dataSheetFile.name : 'Click to upload data sheet'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX, TXT up to 10MB
                    </span>
                  </label>
                </div>

                {/* Upload Progress for Data Sheet */}
                {uploadProgress.dataSheet > 0 && uploadProgress.dataSheet < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.dataSheet}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.dataSheet && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dataSheet}</p>}
              </div>

              {/* Top SVG File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Top SVG File
                </label>
                
                {/* Current Top SVG Preview */}
                {topSvgPreview && (
                  <div className="mb-4 relative">
                    <div className="h-32 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 flex items-center justify-center">
                      <div 
                        className="max-h-full max-w-full"
                        dangerouslySetInnerHTML={{ __html: topSvgPreview.includes('<svg') ? topSvgPreview : '' }}
                      />
                      {!topSvgPreview.includes('<svg') && (
                        <img
                          src={topSvgPreview}
                          alt="Top SVG Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSvgFile('top')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Top SVG Upload Input */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    id="top-svg-upload"
                    accept=".svg,image/svg+xml"
                    onChange={handleTopSvgChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="top-svg-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {topSvgFile ? topSvgFile.name : 'Click to upload top SVG'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      SVG files up to 2MB
                    </span>
                  </label>
                </div>

                {/* Upload Progress for Top SVG */}
                {uploadProgress.topSvg > 0 && uploadProgress.topSvg < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.topSvg}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.topSvg && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.topSvg}</p>}
              </div>

              {/* Side SVG File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Side SVG File
                </label>
                
                {/* Current Side SVG Preview */}
                {sideSvgPreview && (
                  <div className="mb-4 relative">
                    <div className="h-32 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 flex items-center justify-center">
                      <div 
                        className="max-h-full max-w-full"
                        dangerouslySetInnerHTML={{ __html: sideSvgPreview.includes('<svg') ? sideSvgPreview : '' }}
                      />
                      {!sideSvgPreview.includes('<svg') && (
                        <img
                          src={sideSvgPreview}
                          alt="Side SVG Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSvgFile('side')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Side SVG Upload Input */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    id="side-svg-upload"
                    accept=".svg,image/svg+xml"
                    onChange={handleSideSvgChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="side-svg-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {sideSvgFile ? sideSvgFile.name : 'Click to upload side SVG'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      SVG files up to 2MB
                    </span>
                  </label>
                </div>

                {/* Upload Progress for Side SVG */}
                {uploadProgress.sideSvg > 0 && uploadProgress.sideSvg < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.sideSvg}%` }}
                      />
                    </div>
                  </div>
                )}

                {errors.sideSvg && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sideSvg}</p>}
              </div>

              {/* Manual Image URL (Alternative) */}
              {!imageFile && !imagePreview && (
                <div>
                  <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or enter image URL
                  </label>
                  <input
                    type="url"
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => {
                      handleInputChange('image', e.target.value);
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
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
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;