import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '../../services/productService';

const VendorProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  interface Media {
    url: string;
    public_id: string;
  }

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
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

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProduct = async () => {
        setFetching(true);
        try {
          const response = await productService.getProduct(id);
          const product = response.data;
          
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            comparePrice: product.comparePrice?.toString() || '',
            category: product.category || 'Electronics',
            brand: product.brand || '',
            countInStock: product.countInStock?.toString() || '',
            sku: product.sku || '',
            weight: product.weight?.toString() || '',
            featured: product.featured || false,
            isNewArrival: product.isNewArrival || false,
            onSale: product.onSale || false,
            images: product.images || [],
            videos: product.videos || [],
            specifications: product.specifications || [],
            whatsInBox: product.whatsInBox || []
          });
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product details');
          navigate('/vendor/dashboard');
        } finally {
          setFetching(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        // Edit Mode - Text Only (JSON)
        await productService.updateProduct(id, {
          ...formData,
           // @ts-ignore
          price: parseFloat(formData.price),
           // @ts-ignore
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
           // @ts-ignore
          countInStock: parseInt(formData.countInStock),
           // @ts-ignore
          weight: formData.weight ? parseFloat(formData.weight) : undefined
        });
        toast.success('Product updated successfully!');
      } else {
        // Create Mode - Multipart Form (Files supported)
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

        // Use file upload approach via ProductService
        if (imageFiles.length === 0 && videoFiles.length === 0) {
           await productService.createProduct({
            ...formData,
             // @ts-ignore
            price: parseFloat(formData.price),
             // @ts-ignore
            comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
             // @ts-ignore
            countInStock: parseInt(formData.countInStock),
             // @ts-ignore
            weight: formData.weight ? parseFloat(formData.weight) : undefined
          });
        } else {
          await productService.createProductWithFiles(formDataToSend);
        }
        toast.success('Product created successfully!');
      }

      navigate('/vendor/dashboard');
      
    } catch (error: any) {
      toast.error(error.response?.data?.msg || error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
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
  
  if (fetching) {
     return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <button
          onClick={() => navigate('/vendor/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Media Upload Section - Only allow adding/removing if supported or just show list */}
          {/* For now, we will show the media list but disable new uploads or hide the upload inputs in edit mode to avoid confusion */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Media</h3>
            {isEditMode && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-sm text-yellow-700">
                        Note: Updating images/videos is currently not supported in Edit mode. 
                        To change media, please delete this product and create a new one.
                    </p>
                </div>
            )}
            
            {!isEditMode && (
                <>
                <div className="flex space-x-4 mb-4">
                <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                    uploadMode === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    Add by URL
                </button>
                </div>

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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {imageFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                        {imageFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{file.name}</span>
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {videoFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                        {videoFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{file.name}</span>
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

                {uploadMode === 'url' && (
                <div className="space-y-4">
                    <div>
                    <div className="flex space-x-2">
                        <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    <div className="flex space-x-2">
                        <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Video URL"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                </>
            )}

            {(formData.images.length > 0 || formData.videos.length > 0) && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Media:</h4>
                <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                        <img src={image.url} alt="Product" className="h-16 w-16 object-cover rounded border" />
                        {!isEditMode && <button type="button" onClick={() => removeImage(index, 'url')} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">×</button>}
                    </div>
                    ))}
                </div>
                 {/* Video listing intentionally simple for now */}
                 {formData.videos.length > 0 && <p className="text-xs text-gray-500">{formData.videos.length} videos attached</p>}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Specifications</h3>
              <button type="button" onClick={addSpecification} className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                + Add Spec
              </button>
            </div>
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex gap-2 mb-2 items-start">
                <input
                  type="text"
                  placeholder="Name"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button type="button" onClick={() => removeSpecification(index)} className="p-2 text-red-500">×</button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">What's in the Box</h3>
              <button type="button" onClick={addWhatsInBox} className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                + Add Item
              </button>
            </div>
            {formData.whatsInBox.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-start">
                <input
                  type="text"
                  placeholder="Item"
                  value={item.item}
                  onChange={(e) => updateWhatsInBox(index, 'item', e.target.value)}
                  className="flex-[2] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateWhatsInBox(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button type="button" onClick={() => removeWhatsInBox(index)} className="p-2 text-red-500">×</button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
             <button
              type="button"
              onClick={() => navigate('/vendor/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductForm;
