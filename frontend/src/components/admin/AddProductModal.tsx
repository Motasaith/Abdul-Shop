import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Save, 
  Loader,
  Check,
  AlertCircle,
  Package,
  Layers,
  DollarSign,
  Tag
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  product?: Product | null;
  service: any; // Allow injecting adminService or productService
}

// Helper Input Component defined outside to prevent focus loss
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

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded, product, service }) => {
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
    whatsInBox: [] as { item: string; quantity: number }[],
    deliveryInfo: {
        standardDelivery: { cost: 135, days: '5-7 days' },
        cashOnDelivery: { available: true }
    },
    returnPolicy: { available: true, days: 14 },
    warranty: { available: false, duration: '', type: 'Seller' }
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Beauty', 'Health', 'Toys', 'Automotive', 'Other'
  ];

  // Reset or populate form when product changes
  useEffect(() => {
    if (product && isOpen) {
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
                cost: product.deliveryInfo?.standardDelivery?.cost ?? 135, 
                days: product.deliveryInfo?.standardDelivery?.days || '5-7 days' 
            },
            cashOnDelivery: { 
                available: product.deliveryInfo?.cashOnDelivery?.available ?? true 
            }
        },
        returnPolicy: { 
            available: product.returnPolicy?.available ?? true, 
            days: product.returnPolicy?.days ?? 14 
        },
        warranty: { 
            available: product.warranty?.available ?? false, 
            duration: product.warranty?.duration || '', 
            type: product.warranty?.type || 'Seller' 
        }
      });
    } else if (!product && isOpen) {
        resetForm();
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Basic info
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
      
      // Files
      imageFiles.forEach((file) => formDataToSend.append(`images`, file));
      videoFiles.forEach((file) => formDataToSend.append(`videos`, file));
      
      // URLs (Logic to handle existing vs new URLs varies by backend, 
      // but assuming consistent handling with previous version)
      formData.images.forEach((image, index) => {
         formDataToSend.append(`imageUrls[${index}][url]`, image.url);
         formDataToSend.append(`imageUrls[${index}][public_id]`, image.public_id);
      });
      
      formData.videos.forEach((video, index) => {
        formDataToSend.append(`videoUrls[${index}][url]`, video.url);
        formDataToSend.append(`videoUrls[${index}][public_id]`, video.public_id);
      });

      
      // Complex objects
      formData.specifications.forEach((spec, index) => {
        if (spec.name && spec.value) {
          formDataToSend.append(`specifications[${index}][name]`, spec.name);
          formDataToSend.append(`specifications[${index}][value]`, spec.value);
        }
      });

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

      if (product) {
         // Update Logic
         const updateData = {
            ...formData,
            price: parseFloat(formData.price),
            comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
            countInStock: parseInt(formData.countInStock),
            weight: formData.weight ? parseFloat(formData.weight) : undefined
         };
         
         await service.updateProduct(product._id, updateData);
         
         if(imageFiles.length > 0) {
             toast('Note: New file uploads during quick-update are strictly text/url based in this version.', { icon: 'ℹ️'});
         }
         toast.success('Product updated successfully!');
      } else {
        // Create Logic
        if (imageFiles.length === 0 && videoFiles.length === 0) {
            await service.createProduct({
                ...formData,
                price: parseFloat(formData.price),
                comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
                countInStock: parseInt(formData.countInStock),
                weight: formData.weight ? parseFloat(formData.weight) : undefined
            });
        } else {
            await service.createProductWithFiles(formDataToSend);
        }
        toast.success('Product created successfully!');
      }

      onProductAdded();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${product ? 'update' : 'create'} product`);
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
      images: [],
      videos: [],
      specifications: [],
      whatsInBox: [],
      deliveryInfo: {
          standardDelivery: { cost: 135, days: '5-7 days' },
          cashOnDelivery: { available: true }
      },
      returnPolicy: { available: true, days: 14 },
      warranty: { available: false, duration: '', type: 'Seller' }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (type === 'image') setImageFiles(prev => [...prev, ...files]);
    else setVideoFiles(prev => [...prev, ...files]);
  };

  const addUrl = (type: 'image' | 'video') => {
    const val = type === 'image' ? imageUrl : videoUrl;
    if (val.trim()) {
       const newItem = { url: val.trim(), public_id: `url-${Date.now()}` };
       setFormData(prev => ({
         ...prev,
         [type === 'image' ? 'images' : 'videos']: [...prev[type === 'image' ? 'images' : 'videos'], newItem]
       }));
       if (type === 'image') setImageUrl('');
       else setVideoUrl('');
    }
  };

  const removeMedia = (index: number, type: 'image' | 'video', source: 'file' | 'url') => {
    if (source === 'file') {
       if (type === 'image') setImageFiles(prev => prev.filter((_, i) => i !== index));
       else setVideoFiles(prev => prev.filter((_, i) => i !== index));
    } else {
       setFormData(prev => ({
         ...prev,
         [type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].filter((_, i) => i !== index)
       }));
    }
  };

  const updateArrayItem = (index: number, field: string, value: any, arrayName: 'specifications' | 'whatsInBox') => {
     setFormData(prev => ({
       ...prev,
       [arrayName]: prev[arrayName].map((item: any, i) => i === index ? { ...item, [field]: value } : item)
     }));
  };

  const removeArrayItem = (index: number, arrayName: 'specifications' | 'whatsInBox') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as any[]).filter((_: any, i: number) => i !== index)
    }));
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                   <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                     {product ? 'Edit Product' : 'Add New Product'}
                   </h2>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the details below</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* General Information */}
                  <section>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      <Layers className="w-4 h-4 mr-2 text-blue-500" />
                      General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField fullWidth label="Product Name *" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Wireless Headphones" maxLength={100} />
                      
                      <div className="col-span-full">
                         <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Description * (Max 2000 chars)
                         </label>
                         <textarea
                           name="description"
                           value={formData.description}
                           onChange={handleInputChange}
                           rows={4}
                           required
                           maxLength={2000}
                           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:text-white dark:placeholder-gray-500 text-sm resize-none"
                           placeholder="Describe your product..."
                         />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm appearance-none cursor-pointer"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <InputField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g., Sony" />
                    </div>
                  </section>

                  {/* Pricing & Inventory */}
                  <section>
                     <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Pricing & Inventory
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                       <InputField label="Price *" type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" min="0" required icon={DollarSign} />
                       <InputField label="Compare Price" type="number" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange} step="0.01" min="0" />
                       <InputField label="Stock *" type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} min="0" required icon={Package} />
                       <InputField label="SKU" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Stock Keeping Unit" />
                       <InputField label="Weight (kg)" type="number" name="weight" value={formData.weight} onChange={handleInputChange} step="0.01" min="0" />
                    </div>
                  </section>

                  {/* Delivery & Warranty */}
                  <section>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                       <Check className="w-4 h-4 mr-2 text-orange-500" />
                       Delivery & Services
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        {/* Delivery Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Delivery</h4>
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
                            <label className="flex items-center cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={formData.deliveryInfo.cashOnDelivery.available} 
                                  onChange={(e) => setFormData(p => ({...p, deliveryInfo: {...p.deliveryInfo, cashOnDelivery: { available: e.target.checked }} }))}
                                  className="sr-only" 
                                />
                                <div className={`w-9 h-5 rounded-full transition-colors ${formData.deliveryInfo.cashOnDelivery.available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`absolute ml-1 mt-1 bg-white w-3 h-3 rounded-full transition-transform ${formData.deliveryInfo.cashOnDelivery.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Cash on Delivery</span>
                            </label>
                        </div>

                        {/* Returns & Warranty */}
                        <div className="space-y-4 border-l border-gray-200 dark:border-gray-700/50 pl-0 md:pl-6">
                            <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Services</h4>
                            
                            {/* Return Policy */}
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer group">
                                    <input 
                                      type="checkbox" 
                                      checked={formData.returnPolicy.available} 
                                      onChange={(e) => setFormData(p => ({...p, returnPolicy: {...p.returnPolicy, available: e.target.checked }}))}
                                      className="sr-only" 
                                    />
                                    <div className={`w-9 h-5 rounded-full transition-colors ${formData.returnPolicy.available ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className={`absolute ml-1 mt-1 bg-white w-3 h-3 rounded-full transition-transform ${formData.returnPolicy.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Return Policy</span>
                                </label>
                                {formData.returnPolicy.available && (
                                   <InputField 
                                     label="Return Days" 
                                     type="number" 
                                     fullWidth 
                                     value={formData.returnPolicy.days} 
                                     onChange={(e: any) => setFormData(p => ({...p, returnPolicy: {...p.returnPolicy, days: parseInt(e.target.value)||0 }}))} 
                                   />
                                )}
                            </div>

                            {/* Warranty */}
                            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                                <label className="flex items-center cursor-pointer group">
                                    <input 
                                      type="checkbox" 
                                      checked={formData.warranty.available} 
                                      onChange={(e) => setFormData(p => ({...p, warranty: {...p.warranty, available: e.target.checked }}))}
                                      className="sr-only" 
                                    />
                                    <div className={`w-9 h-5 rounded-full transition-colors ${formData.warranty.available ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className={`absolute ml-1 mt-1 bg-white w-3 h-3 rounded-full transition-transform ${formData.warranty.available ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Warranty</span>
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
                                          <select 
                                            value={formData.warranty.type} 
                                            onChange={(e) => setFormData(p => ({...p, warranty: {...p.warranty, type: e.target.value }}))}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white text-sm"
                                          >
                                              <option value="Seller">Seller</option>
                                              <option value="Manufacturer">Manufacturer</option>
                                              <option value="Brand">Brand</option>
                                          </select>
                                       </div>
                                   </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </section>

                  {/* Media */}
                  <section>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      <ImageIcon className="w-4 h-4 mr-2 text-purple-500" />
                      Media
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex gap-4 mb-4">
                           <button 
                             type="button" 
                             onClick={() => setUploadMode('file')}
                             className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                           >
                             <Upload className="w-4 h-4 mr-2" /> Upload Files
                           </button>
                            <button 
                             type="button" 
                             onClick={() => setUploadMode('url')}
                             className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                           >
                             <LinkIcon className="w-4 h-4 mr-2" /> Add by URL
                           </button>
                        </div>

                        {uploadMode === 'file' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer relative">
                                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform">
                                     <ImageIcon className="w-6 h-6" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop images here or click</p>
                                  <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, WEBP</p>
                               </div>
                               <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors group cursor-pointer relative">
                                  <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform">
                                      <Video className="w-6 h-6" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop videos here or click</p>
                                  <p className="text-xs text-gray-400 mt-1">Supports: MP4, WEBM</p>
                               </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                   <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL..." className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500" />
                                   <button type="button" onClick={() => addUrl('image')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                                </div>
                                <div className="flex gap-2">
                                   <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL..." className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500" />
                                   <button type="button" onClick={() => addUrl('video')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )}

                        {/* File Preview List */}
                        {(imageFiles.length > 0 || videoFiles.length > 0 || formData.images.length > 0 || formData.videos.length > 0) && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[...formData.images.map((img, i) => ({ type: 'url', src: img, idx: i, isVideo: false })), 
                                  ...imageFiles.map((file, i) => ({ type: 'file', src: file, idx: i, isVideo: false })),
                                  ...formData.videos.map((vid, i) => ({ type: 'url', src: vid, idx: i, isVideo: true })),
                                  ...videoFiles.map((file, i) => ({ type: 'file', src: file, idx: i, isVideo: true }))
                                ].map((item: any, i) => (
                                    <div key={i} className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                              type="button" 
                                              onClick={() => item.type === 'file' 
                                                ? (item.isVideo ? setVideoFiles(prev => prev.filter((_, idx) => idx !== item.idx)) : setImageFiles(prev => prev.filter((_, idx) => idx !== item.idx)))
                                                : removeMedia(item.idx, item.isVideo ? 'video' : 'image', 'url')
                                              }
                                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 break-all p-2">
                                            {item.type === 'file' ? (
                                                <div className="text-center">
                                                    {item.isVideo ? <Video className="w-6 h-6 mx-auto mb-1" /> : <ImageIcon className="w-6 h-6 mx-auto mb-1" />}
                                                    <span className="line-clamp-2">{item.src.name}</span>
                                                </div>
                                            ) : (
                                                <span className="line-clamp-3">{item.src.url}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  </section>

                  {/* Specifications & Box Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Specifications</h3>
                             <button type="button" onClick={() => setFormData(p => ({...p, specifications: [...p.specifications, { name: '', value: '' }]}))} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                 + Add Spec
                             </button>
                         </div>
                         <div className="space-y-3">
                             {formData.specifications.map((spec, i) => (
                                 <div key={i} className="flex gap-2">
                                     <input placeholder="Name" value={spec.name} onChange={(e) => updateArrayItem(i, 'name', e.target.value, 'specifications')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                     <input placeholder="Value" value={spec.value} onChange={(e) => updateArrayItem(i, 'value', e.target.value, 'specifications')} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                     <button type="button" onClick={() => removeArrayItem(i, 'specifications')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             ))}
                             {formData.specifications.length === 0 && <p className="text-xs text-gray-400 italic">No specifications added.</p>}
                         </div>
                      </section>

                       <section>
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white">What's in the Box</h3>
                             <button type="button" onClick={() => setFormData(p => ({...p, whatsInBox: [...p.whatsInBox, { item: '', quantity: 1 }]}))} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                 + Add Item
                             </button>
                         </div>
                         <div className="space-y-3">
                             {formData.whatsInBox.map((box, i) => (
                                 <div key={i} className="flex gap-2">
                                     <input placeholder="Item" value={box.item} onChange={(e) => updateArrayItem(i, 'item', e.target.value, 'whatsInBox')} className="flex-[2] px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                      <input type="number" placeholder="Qty" value={box.quantity} onChange={(e) => updateArrayItem(i, 'quantity', parseInt(e.target.value)||1, 'whatsInBox')} className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                     <button type="button" onClick={() => removeArrayItem(i, 'whatsInBox')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             ))}
                             {formData.whatsInBox.length === 0 && <p className="text-xs text-gray-400 italic">No items added.</p>}
                         </div>
                      </section>
                  </div>

                  {/* Toggles */}
                  <section className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl flex flex-wrap gap-6">
                      {[
                        { name: 'featured', label: 'Featured Product', color: 'blue' },
                        { name: 'isNewArrival', label: 'New Arrival', color: 'purple' },
                        { name: 'onSale', label: 'On Sale', color: 'amber' }
                      ].map((toggle) => (
                          <label key={toggle.name} className="flex items-center cursor-pointer group">
                             <div className="relative">
                                <input 
                                  type="checkbox" 
                                  name={toggle.name} 
                                  checked={(formData as any)[toggle.name]} 
                                  onChange={handleInputChange} 
                                  className="sr-only" 
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${(formData as any)[toggle.name] ? `bg-${toggle.color}-500` : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${(formData as any)[toggle.name] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                             </div>
                             <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{toggle.label}</span>
                          </label>
                      ))}
                  </section>

                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky bottom-0 z-10 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={onClose}
                   className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => (document.getElementById('product-form') as HTMLFormElement)?.requestSubmit()}
                   disabled={loading}
                   className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                   {product ? 'Update Product' : 'Create Product'}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
