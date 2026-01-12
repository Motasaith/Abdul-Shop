import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Layers, 
  DollarSign, 
  Package, 
  Check, 
  ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Plus, 
  Video,
  X,
  Trash2,
  Save
} from 'lucide-react';
import productService from '../../services/productService';

const InputField = ({ label, icon: Icon, fullWidth = false, ...props }: any) => (
  <div className={`${fullWidth ? 'col-span-full' : ''}`}>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Icon className="w-4 h-4" />
          </div>
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white dark:placeholder-gray-500 text-sm`}
      />
    </div>
  </div>
);

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
    whatsInBox: [] as { item: string; quantity: number }[],
    deliveryInfo: {
        standardDelivery: { available: true, cost: 135, days: '5-7 days' },
        cashOnDelivery: { available: true },
        freeDelivery: { available: false, minOrder: 0 }
    },
    returnPolicy: { available: true, days: 14, description: '' },
    warranty: { available: false, duration: '', type: 'Seller' as 'Seller' | 'Manufacturer' | 'Brand' }
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
            whatsInBox: product.whatsInBox || [],
            deliveryInfo: {
                standardDelivery: { 
                    available: product.deliveryInfo?.standardDelivery?.available ?? true,
                    cost: product.deliveryInfo?.standardDelivery?.cost ?? 135, 
                    days: product.deliveryInfo?.standardDelivery?.days || '5-7 days' 
                },
                cashOnDelivery: { 
                    available: product.deliveryInfo?.cashOnDelivery?.available ?? true 
                },
                freeDelivery: {
                    available: product.deliveryInfo?.freeDelivery?.available ?? false,
                    minOrder: product.deliveryInfo?.freeDelivery?.minOrder ?? 0
                }
            },
            returnPolicy: { 
                available: product.returnPolicy?.available ?? true, 
                days: product.returnPolicy?.days ?? 14,
                description: product.returnPolicy?.description || '' 
            },
            warranty: { 
                available: product.warranty?.available ?? false, 
                duration: product.warranty?.duration || '', 
                type: product.warranty?.type || 'Seller' 
            }
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
        
        if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
        if (formData.sku) formDataToSend.append('sku', formData.sku);
        if (formData.weight) formDataToSend.append('weight', formData.weight);
        
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

        // Delivery Info
        formDataToSend.append('deliveryInfo[standardDelivery][cost]', formData.deliveryInfo.standardDelivery.cost.toString());
        formDataToSend.append('deliveryInfo[standardDelivery][days]', formData.deliveryInfo.standardDelivery.days);
        formDataToSend.append('deliveryInfo[cashOnDelivery][available]', formData.deliveryInfo.cashOnDelivery.available.toString());
        
        // Return Policy
        formDataToSend.append('returnPolicy[available]', formData.returnPolicy.available.toString());
        formDataToSend.append('returnPolicy[days]', formData.returnPolicy.days.toString());
        
        // Warranty
        formDataToSend.append('warranty[available]', formData.warranty.available.toString());
        formDataToSend.append('warranty[duration]', formData.warranty.duration);
        formDataToSend.append('warranty[type]', formData.warranty.type);

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
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your product information and inventory</p>
        </div>
        <button
          onClick={() => navigate('/vendor/dashboard')}
          className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-xl transition-all font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* General Information */}
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
              <Layers className="w-4 h-4 mr-2 text-blue-500" />
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField fullWidth label="Product Name *" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Wireless Headphones" />
              
              <div className="col-span-full">
                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                    Description *
                 </label>
                 <textarea
                   name="description"
                   value={formData.description}
                   onChange={handleInputChange}
                   rows={4}
                   required
                   className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white dark:placeholder-gray-500 text-sm resize-none"
                   placeholder="Describe your product features, benefits, and specifications..."
                 />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category *</label>
                <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm appearance-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>
              <InputField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g., Sony" />
            </div>
          </section>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50" />

          {/* Pricing & Inventory */}
          <section>
             <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <InputField label="Price *" type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" required icon={DollarSign} />
               <InputField label="Compare Price" type="number" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange} step="0.01" min="0" icon={DollarSign} />
               <InputField label="Stock *" type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} min="0" required icon={Package} />
               <InputField label="SKU" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Stock Keeping Unit" />
               <InputField label="Weight (kg)" type="number" name="weight" value={formData.weight} onChange={handleInputChange} step="0.01" min="0" />
            </div>
          </section>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50" />

          {/* Delivery & Services */}
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
               <Check className="w-4 h-4 mr-2 text-orange-500" />
               Delivery & Services
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                {/* Delivery Info */}
                <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Delivery Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                          label="Cost" 
                          type="number" 
                          value={formData.deliveryInfo.standardDelivery.cost} 
                          onChange={(e: any) => setFormData(p => ({...p, deliveryInfo: {...p.deliveryInfo, standardDelivery: {...p.deliveryInfo.standardDelivery, cost: parseFloat(e.target.value)||0}} }))} 
                        />
                        <InputField 
                          label="Time (e.g. 5-7 days)" 
                          value={formData.deliveryInfo.standardDelivery.days} 
                          onChange={(e: any) => setFormData(p => ({...p, deliveryInfo: {...p.deliveryInfo, standardDelivery: {...p.deliveryInfo.standardDelivery, days: e.target.value}} }))} 
                        />
                    </div>
                    <label className="flex items-center cursor-pointer group p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.deliveryInfo.cashOnDelivery.available} 
                          onChange={(e) => setFormData(p => ({...p, deliveryInfo: {...p.deliveryInfo, cashOnDelivery: { available: e.target.checked }} }))}
                          className="sr-only" 
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.deliveryInfo.cashOnDelivery.available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                           <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.deliveryInfo.cashOnDelivery.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Cash on Delivery Available</span>
                    </label>
                </div>

                {/* Returns & Warranty */}
                <div className="space-y-6 md:border-l border-gray-200 dark:border-gray-700/50 md:pl-8">
                    <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Value Added Services</h4>
                    
                    {/* Return Policy */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={formData.returnPolicy.available} 
                                  onChange={(e) => setFormData(p => ({...p, returnPolicy: {...p.returnPolicy, available: e.target.checked }}))}
                                  className="sr-only" 
                                />
                                <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.returnPolicy.available ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${formData.returnPolicy.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Return Policy</span>
                            </label>
                        </div>
                        
                        {formData.returnPolicy.available && (
                           <InputField 
                             label="Return Period (Days)" 
                             type="number" 
                             fullWidth 
                             value={formData.returnPolicy.days} 
                             onChange={(e: any) => setFormData(p => ({...p, returnPolicy: {...p.returnPolicy, days: parseInt(e.target.value)||0 }}))} 
                           />
                        )}
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700/50" />

                    {/* Warranty */}
                    <div className="space-y-4">
                        <label className="flex items-center cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.warranty.available} 
                              onChange={(e) => setFormData(p => ({...p, warranty: {...p.warranty, available: e.target.checked }}))}
                              className="sr-only" 
                            />
                            <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.warranty.available ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${formData.warranty.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Warranty Protection</span>
                        </label>
                        {formData.warranty.available && (
                           <div className="grid grid-cols-2 gap-3">
                               <InputField 
                                  label="Duration" 
                                  placeholder="e.g. 1 Year"
                                  value={formData.warranty.duration} 
                                  onChange={(e: any) => setFormData(p => ({...p, warranty: {...p.warranty, duration: e.target.value }}))} 
                               />
                               <div>
                                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Type</label>
                                  <div className="relative">
                                      <select 
                                        value={formData.warranty.type} 
                                        onChange={(e) => setFormData(p => ({...p, warranty: {...p.warranty, type: e.target.value as any }}))}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm appearance-none"
                                      >
                                          <option value="Seller">Seller</option>
                                          <option value="Manufacturer">Manufacturer</option>
                                          <option value="Brand">Brand</option>
                                      </select>
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                      </div>
                                  </div>
                               </div>
                           </div>
                        )}
                    </div>
                </div>
            </div>
          </section>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50" />

          {/* Media Section */}
          <section>
              <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 mr-2 text-purple-500" />
                  Product Media
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                  {isEditMode ? (
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-xl">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full text-yellow-600">
                             <Upload className="w-5 h-5" />
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-1">Media-Update Restrictions</h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-600 leading-relaxed">
                                  To ensure data consistency, specialized media updates (images/videos) are disabled in quick-edit mode. 
                                  Please delete and recreate the product to completely overhaul media assets.
                              </p>
                          </div>
                      </div>
                  ) : (
                      <>
                        <div className="flex flex-wrap gap-4 mb-6">
                           <button 
                             type="button" 
                             onClick={() => setUploadMode('file')}
                             className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-lg ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                           >
                             <Upload className="w-4 h-4 mr-2" /> Local Upload
                           </button>
                            <button 
                             type="button" 
                             onClick={() => setUploadMode('url')}
                             className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-lg ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                           >
                             <LinkIcon className="w-4 h-4 mr-2" /> URL Import
                           </button>
                        </div>

                        {uploadMode === 'file' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer relative bg-white dark:bg-gray-800">
                                  <input type="file" multiple accept="image/*" onChange={handleImageFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-fit mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                                     <ImageIcon className="w-8 h-8" />
                                  </div>
                                  <p className="text-base font-bold text-gray-900 dark:text-white mb-1">Click to upload images</p>
                                  <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP</p>
                               </div>
                               <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group cursor-pointer relative bg-white dark:bg-gray-800">
                                  <input type="file" multiple accept="video/*" onChange={handleVideoFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-fit mx-auto mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                                      <Video className="w-8 h-8" />
                                  </div>
                                  <p className="text-base font-bold text-gray-900 dark:text-white mb-1">Click to upload videos</p>
                                  <p className="text-sm text-gray-500">Supports: MP4, WEBM</p>
                               </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                   <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Image URL</label>
                                   <div className="flex gap-2">
                                      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50" />
                                      <button type="button" onClick={addImageUrl} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl transition-colors font-bold"><Plus className="w-5 h-5" /></button>
                                   </div>
                                </div>
                                <div className="space-y-3">
                                   <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Video URL</label>
                                   <div className="flex gap-2">
                                      <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                                      <button type="button" onClick={addVideoUrl} className="bg-purple-600 hover:bg-purple-700 text-white px-5 rounded-xl transition-colors font-bold"><Plus className="w-5 h-5" /></button>
                                   </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Pending Uploads List */}
                        {(imageFiles.length > 0 || videoFiles.length > 0) && (
                            <div className="mt-8">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">Ready to Upload</h4>
                                <div className="flex flex-wrap gap-3">
                                    {imageFiles.map((f, i) => (
                                        <div key={`img-${i}`} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                                            <ImageIcon className="w-4 h-4" />
                                            <span className="truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => removeImage(i, 'file')} className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    {videoFiles.map((f, i) => (
                                        <div key={`vid-${i}`} className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm border border-purple-100 dark:border-purple-800">
                                            <Video className="w-4 h-4" />
                                            <span className="truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => removeVideo(i, 'file')} className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                      </>
                  )}

                  {/* Existing Media Display */}
                  {(formData.images.length > 0 || formData.videos.length > 0) && (
                      <div className="mt-8 border-t border-gray-200 dark:border-gray-700/50 pt-8">
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-wider">Current Gallery</h4>
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
                              {formData.images.map((img, i) => (
                                  <div key={i} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                                      {!isEditMode && (
                                          <button type="button" onClick={() => removeImage(i, 'url')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md transform hover:scale-110">
                                              <X className="w-3 h-3" />
                                          </button>
                                      )}
                                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-[10px] text-white text-center backdrop-blur-sm">Image</div>
                                  </div>
                              ))}
                              {formData.videos.map((vid, i) => (
                                  <div key={i} className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-sm flex items-center justify-center">
                                      <Video className="w-8 h-8 text-white/50" />
                                      {!isEditMode && (
                                          <button type="button" onClick={() => removeVideo(i, 'url')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md transform hover:scale-110">
                                              <X className="w-3 h-3" />
                                          </button>
                                      )}
                                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-purple-600/80 text-[10px] text-white text-center backdrop-blur-sm">Video</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </section>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50" />

          {/* Specifications */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    <Layers className="w-4 h-4 mr-2 text-indigo-500" />
                    Specifications
                </h3>
                <button type="button" onClick={addSpecification} className="flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Spec
                </button>
             </div>
             
             {formData.specifications.length > 0 ? (
                 <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 space-y-3">
                    {formData.specifications.map((spec, index) => (
                       <div key={index} className="flex gap-4 items-start group">
                          <div className="flex-1">
                             <input
                               type="text"
                               placeholder="Specification Name (e.g. Battery Life)"
                               value={spec.name}
                               onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                             />
                          </div>
                          <div className="flex-1">
                             <input
                               type="text"
                               placeholder="Value (e.g. 24 Hours)"
                               value={spec.value}
                               onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                             />
                          </div>
                          <button type="button" onClick={() => removeSpecification(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                    ))}
                 </div>
             ) : (
                 <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                     <p className="text-sm text-gray-500">No specifications added yet.</p>
                 </div>
             )}
          </section>

          {/* What's in the Box */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    <Package className="w-4 h-4 mr-2 text-teal-500" />
                    What's in the Box
                </h3>
                <button type="button" onClick={addWhatsInBox} className="flex items-center px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-xl text-sm font-bold hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Item
                </button>
             </div>

             {formData.whatsInBox.length > 0 ? (
                 <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 space-y-3">
                    {formData.whatsInBox.map((item, index) => (
                       <div key={index} className="flex gap-4 items-start">
                          <div className="flex-[2]">
                             <input
                               type="text"
                               placeholder="Item Name (e.g. Power Cable)"
                               value={item.item}
                               onChange={(e) => updateWhatsInBox(index, 'item', e.target.value)}
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                             />
                          </div>
                          <div className="flex-[1]">
                             <input
                               type="number"
                               min="1"
                               placeholder="Qty"
                               value={item.quantity}
                               onChange={(e) => updateWhatsInBox(index, 'quantity', parseInt(e.target.value)||1)}
                               className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                             />
                          </div>
                          <button type="button" onClick={() => removeWhatsInBox(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                    ))}
                 </div>
             ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <p className="text-sm text-gray-500">List items included in the package.</p>
                </div>
             )}
          </section>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg -mx-8 -mb-8 p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4 z-10">
              <button
                type="button"
                onClick={() => navigate('/vendor/dashboard')}
                className="px-8 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                    <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                       Saving...
                    </>
                ) : (
                    <>
                       <Save className="w-5 h-5 mr-2" />
                       Save Product
                    </>
                )}
              </button>
          </div>
        
        </form>
      </div>
    </div>
  );
};

export default VendorProductForm;
