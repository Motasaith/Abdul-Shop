import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  interface Media {
    url: string;
    public_id: string;
  }

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: 'Electronics',
    brand: '',
    countInStock: '',
    sku: '',
    weight: '',
    featured: false,
    isNewArrival: false,
    onSale: false,
    images: [] as Media[],
    videos: [] as Media[],
    specifications: [] as { name: string; value: string }[],
    whatsInBox: [] as { item: string; quantity: number }[]
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Beauty', 'Health', 'Toys', 'Automotive', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic form data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('countInStock', formData.countInStock);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('isNewArrival', formData.isNewArrival.toString());
      formDataToSend.append('onSale', formData.onSale.toString());
      
      if (formData.comparePrice) {
        formDataToSend.append('comparePrice', formData.comparePrice);
      }
      if (formData.sku) {
        formDataToSend.append('sku', formData.sku);
      }
      if (formData.weight) {
        formDataToSend.append('weight', formData.weight);
      }
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file);
      });
      
      // Add video files
      videoFiles.forEach((file, index) => {
        formDataToSend.append(`videos`, file);
      });
      
      // Add image URLs
      formData.images.forEach((image, index) => {
        formDataToSend.append(`imageUrls[${index}][url]`, image.url);
        formDataToSend.append(`imageUrls[${index}][public_id]`, image.public_id);
      });
      
      // Add video URLs
      formData.videos.forEach((video, index) => {
        formDataToSend.append(`videoUrls[${index}][url]`, video.url);
        formDataToSend.append(`videoUrls[${index}][public_id]`, video.public_id);
      });

      // Add specifications
      formData.specifications.forEach((spec, index) => {
        if (spec.name && spec.value) {
          formDataToSend.append(`specifications[${index}][name]`, spec.name);
          formDataToSend.append(`specifications[${index}][value]`, spec.value);
        }
      });

      // Add whatsInBox
      formData.whatsInBox.forEach((item, index) => {
        if (item.item) {
          formDataToSend.append(`whatsInBox[${index}][item]`, item.item);
          formDataToSend.append(`whatsInBox[${index}][quantity]`, item.quantity.toString());
        }
      });

      // For now, let's use the simple approach to test
      if (imageFiles.length === 0 && videoFiles.length === 0) {
        // Use simple JSON approach if no files
        await adminService.createProduct({
          ...formData,
          price: parseFloat(formData.price),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
          countInStock: parseInt(formData.countInStock),
          weight: formData.weight ? parseFloat(formData.weight) : undefined
        });
      } else {
        // Use file upload approach
        await adminService.createProductWithFiles(formDataToSend);
      }

      toast.success('Product created successfully!');
      onProductAdded();
      onClose();
      
      // Reset form
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: 'Electronics',
      brand: '',
      countInStock: '',
      sku: '',
      weight: '',
      featured: false,
      isNewArrival: false,
      onSale: false,
      images: [] as Media[],
      videos: [] as Media[],
      specifications: [] as { name: string; value: string }[],
      whatsInBox: [] as { item: string; quantity: number }[]
    });
    setImageFiles([]);
    setVideoFiles([]);
    setImageUrl('');
    setVideoUrl('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles(prev => [...prev, ...files]);
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: imageUrl.trim(), public_id: `url-${Date.now()}` }]
      }));
      setImageUrl('');
    }
  };

  const addVideoUrl = () => {
    if (videoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, { url: videoUrl.trim(), public_id: `url-${Date.now()}` }]
      }));
      setVideoUrl('');
    }
  };

  const removeImage = (index: number, type: 'file' | 'url') => {
    if (type === 'file') {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const removeVideo = (index: number, type: 'file' | 'url') => {
    if (type === 'file') {
      setVideoFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index)
      }));
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addWhatsInBox = () => {
    setFormData(prev => ({
      ...prev,
      whatsInBox: [...prev.whatsInBox, { item: '', quantity: 1 }]
    }));
  };

  const removeWhatsInBox = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatsInBox: prev.whatsInBox.filter((_, i) => i !== index)
    }));
  };

  const updateWhatsInBox = (index: number, field: 'item' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      whatsInBox: prev.whatsInBox.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Media Upload Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Media</h3>
              
              {/* Upload Mode Toggle */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    uploadMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    uploadMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Add by URL
                </button>
              </div>

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imageFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(index, 'file')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Videos
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {videoFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {videoFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeVideo(index, 'file')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Mode */}
              {uploadMode === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Image URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Video URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addVideoUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display added URLs */}
              {(formData.images.length > 0 || formData.videos.length > 0) && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Added Media:</h4>
                  
                  {formData.images.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Images:</h5>
                      {formData.images.map((image, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded mb-1">
                          <span className="text-xs text-gray-600 truncate">{image.url}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index, 'url')}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.videos.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">Videos:</h5>
                      {formData.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded mb-1">
                          <span className="text-xs text-gray-600 truncate">{video.url}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(index, 'url')}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Specifications (Optional)</h3>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add Spec
                </button>
              </div>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <input
                    type="text"
                    placeholder="Name (e.g., Color)"
                    value={spec.name}
                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Red)"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* What's in the Box Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">What's in the Box (Optional)</h3>
                <button
                  type="button"
                  onClick={addWhatsInBox}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  + Add Item
                </button>
              </div>
              {formData.whatsInBox.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-start">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={item.item}
                    onChange={(e) => updateWhatsInBox(index, 'item', e.target.value)}
                    className="flex-[2] px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateWhatsInBox(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeWhatsInBox(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Manual New Arrival</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={formData.onSale}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Manual On Sale</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
