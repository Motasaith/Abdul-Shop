import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { 
  PencilSquareIcon, 
  ArrowPathIcon,
  GlobeAltIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  
  // Home Page State
  const [homeContent, setHomeContent] = useState<any>({
    hero: {
      show: true,
      tagline: 'Season 2024',
      headline: 'The Lookbook. Define Your Style.',
      description: 'Discover the latest trends in fashion and explore our new collection.'
    },
    creative: {
      show: true,
      badge: 'Limited Offer',
      title: 'Save 20%',
      subtitle: 'On selected electronics',
      buttonText: 'Grab it now'
    },
    discover: {
      show: true,
      title: 'Discover More.',
      description: 'Browse our latest additions and curated collections just for you.',
      buttonText: 'View Collection'
    },
    brand: {
      show: true,
      badge: 'Our Mission',
      title: 'Crafting Excellence Since 2024.',
      description: 'We believe in quality that speaks for itself. Every product in our collection is handpicked, tested, and curated to ensure it adds genuine value to your life.',
      buttonText: 'Read our Story'
    },
    quality: {
      show: true,
      title: 'Quality Guaranteed',
      subtitle: 'Premium products only.'
    },
    newArrivals: {
      show: true,
      title: 'New Arrivals',
      linkText: 'Check them out'
    },
    testimonials: {
      show: true,
      title: 'Voices of Satisfaction.',
      subtitle: 'Trusted by over 50,000 customers worldwide.',
      items: [
        {
          name: "Sarah Jenkins",
          role: "Fashion Enthusiast",
          text: "Absolutely in love with the quality! The fabric feels premium and the fit is just perfect. Will definitely buy again.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        },
        {
          name: "Michael Chen",
          role: "Tech Reviewer",
          text: "Fastest shipping I've ever experienced. The product arrived in pristine condition and works like a charm. 5 stars!",
          image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        },
        {
          name: "Emma Wilson",
          role: "Interior Designer",
          text: "The customer service team went above and beyond to help me with my order. Truly a brand that cares about its people.",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        }
      ]
    }
  });

  // Contact Page State
  const [contactContent, setContactContent] = useState({
    info: {
      address: '123 Shopping Street, Commerce City, CC 12345',
      phone: '1-800-SHOPHUB',
      email: 'support@shophub.com',
      hours_mon_fri: '9:00 AM - 6:00 PM',
      hours_sat_sun: '10:00 AM - 4:00 PM'
    }
  });

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab]);

  const fetchContent = async (page: string) => {
    setLoading(true);
    try {
      const data = await adminService.getPageContent(page);
      if (data.sections && Object.keys(data.sections).length > 0) {
        if (page === 'home') setHomeContent((prev: any) => ({ ...prev, ...data.sections }));
        if (page === 'contact') setContactContent((prev: any) => ({ ...prev, ...data.sections }));
      }
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      let contentToSave = {};
      if (activeTab === 'home') contentToSave = homeContent;
      if (activeTab === 'contact') contentToSave = contactContent;

      await adminService.updatePageContent(activeTab, contentToSave);
      toast.success('Page content updated successfully');
    } catch (error) {
      toast.error('Failed to update content');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Manager</h1>
        <p className="text-gray-500 dark:text-gray-400">Edit dynamic content for your website pages.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('home')}
            className={`${
              activeTab === 'home'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <GlobeAltIcon className="w-5 h-5" />
            Home Page
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <PhoneIcon className="w-5 h-5" />
            Contact Page
          </button>
        </nav>
      </div>

      {/* Content Editor */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {loading ? (
          <div className="text-center py-10">
            <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'home' && (
                <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Hero Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hero Section</h3>
                       <label className="flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={homeContent.hero.show !== false} 
                             onChange={(e) => setHomeContent({...homeContent, hero: {...homeContent.hero, show: e.target.checked}})}
                             className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Section</span>
                       </label>
                    </div>
                    {homeContent.hero.show !== false && (
                    <div className="grid grid-cols-1 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tagline</label>
                          <input 
                            type="text" 
                            value={homeContent.hero.tagline}
                            onChange={(e) => setHomeContent({...homeContent, hero: {...homeContent.hero, tagline: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Headline</label>
                          <input 
                            type="text" 
                            value={homeContent.hero.headline}
                            onChange={(e) => setHomeContent({...homeContent, hero: {...homeContent.hero, headline: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <textarea 
                            value={homeContent.hero.description}
                            onChange={(e) => setHomeContent({...homeContent, hero: {...homeContent.hero, description: e.target.value}})}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                    </div>
                    )}
                  </div>

                  {/* Creative Tile (Orange) */}
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white">Promotional Tile (Creative)</h3>
                       <label className="flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={homeContent.creative.show !== false} 
                             onChange={(e) => setHomeContent({...homeContent, creative: {...homeContent.creative, show: e.target.checked}})}
                             className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Section</span>
                       </label>
                    </div>
                    {homeContent.creative.show !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Badge</label>
                          <input 
                            type="text" 
                            value={homeContent.creative?.badge || 'Limited Offer'}
                            onChange={(e) => setHomeContent({...homeContent, creative: {...homeContent.creative, badge: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                          <input 
                            type="text" 
                            value={homeContent.creative?.title || 'Save 20%'}
                            onChange={(e) => setHomeContent({...homeContent, creative: {...homeContent.creative, title: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                          <input 
                            type="text" 
                            value={homeContent.creative?.subtitle || 'On selected electronics'}
                            onChange={(e) => setHomeContent({...homeContent, creative: {...homeContent.creative, subtitle: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</label>
                          <input 
                            type="text" 
                            value={homeContent.creative?.buttonText || 'Grab it now'}
                            onChange={(e) => setHomeContent({...homeContent, creative: {...homeContent.creative, buttonText: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                    </div>
                    )}
                  </div>

                  {/* Discover More */}
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white">Discover More Section</h3>
                       <label className="flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={homeContent.discover.show !== false} 
                             onChange={(e) => setHomeContent({...homeContent, discover: {...homeContent.discover, show: e.target.checked}})}
                             className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Section</span>
                       </label>
                    </div>
                    {homeContent.discover.show !== false && (
                    <div className="grid grid-cols-1 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                          <input 
                            type="text" 
                            value={homeContent.discover?.title || 'Discover More.'}
                            onChange={(e) => setHomeContent({...homeContent, discover: {...homeContent.discover, title: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <textarea 
                            value={homeContent.discover?.description || 'Browse our latest additions and curated collections just for you.'}
                            onChange={(e) => setHomeContent({...homeContent, discover: {...homeContent.discover, description: e.target.value}})}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</label>
                          <input 
                            type="text" 
                            value={homeContent.discover?.buttonText || 'View Collection'}
                            onChange={(e) => setHomeContent({...homeContent, discover: {...homeContent.discover, buttonText: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                    </div>
                    )}
                  </div>

                  {/* Brand Story */}
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white">Brand Story Section</h3>
                       <label className="flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={homeContent.brand.show !== false} 
                             onChange={(e) => setHomeContent({...homeContent, brand: {...homeContent.brand, show: e.target.checked}})}
                             className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Section</span>
                       </label>
                    </div>
                    {homeContent.brand.show !== false && (
                    <div className="grid grid-cols-1 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Badge</label>
                          <input 
                            type="text" 
                            value={homeContent.brand?.badge || 'Our Mission'}
                            onChange={(e) => setHomeContent({...homeContent, brand: {...homeContent.brand, badge: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                          <input 
                            type="text" 
                            value={homeContent.brand?.title || 'Crafting Excellence Since 2024.'}
                            onChange={(e) => setHomeContent({...homeContent, brand: {...homeContent.brand, title: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <textarea 
                            value={homeContent.brand?.description || 'We believe in quality that speaks for itself...'}
                            onChange={(e) => setHomeContent({...homeContent, brand: {...homeContent.brand, description: e.target.value}})}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Button Text</label>
                          <input 
                            type="text" 
                            value={homeContent.brand?.buttonText || 'Read our Story'}
                            onChange={(e) => setHomeContent({...homeContent, brand: {...homeContent.brand, buttonText: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                    </div>
                    )}
                  </div>

                  {/* Quality & New Arrivals */}
                  <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Quality Tile */}
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quality Tile (Indigo)</h3>
                           <label className="flex items-center cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={homeContent.quality.show !== false} 
                                 onChange={(e) => setHomeContent({...homeContent, quality: {...homeContent.quality, show: e.target.checked}})}
                                 className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                           </label>
                        </div>
                        {homeContent.quality.show !== false && (
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                              <input 
                                type="text" 
                                value={homeContent.quality?.title || 'Quality Guaranteed'}
                                onChange={(e) => setHomeContent({...homeContent, quality: {...homeContent.quality, title: e.target.value}})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                              <input 
                                type="text" 
                                value={homeContent.quality?.subtitle || 'Premium products only.'}
                                onChange={(e) => setHomeContent({...homeContent, quality: {...homeContent.quality, subtitle: e.target.value}})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                              />
                           </div>
                        </div>
                        )}
                     </div>

                     {/* New Arrivals */}
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Arrivals Tile</h3>
                           <label className="flex items-center cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={homeContent.newArrivals.show !== false} 
                                 onChange={(e) => setHomeContent({...homeContent, newArrivals: {...homeContent.newArrivals, show: e.target.checked}})}
                                 className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                           </label>
                        </div>
                        {homeContent.newArrivals.show !== false && (
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                              <input 
                                type="text" 
                                value={homeContent.newArrivals?.title || 'New Arrivals'}
                                onChange={(e) => setHomeContent({...homeContent, newArrivals: {...homeContent.newArrivals, title: e.target.value}})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Text</label>
                              <input 
                                type="text" 
                                value={homeContent.newArrivals?.linkText || 'Check them out'}
                                onChange={(e) => setHomeContent({...homeContent, newArrivals: {...homeContent.newArrivals, linkText: e.target.value}})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                              />
                           </div>
                        </div>
                        )}
                     </div>
                  </div>

                  {/* Testimonials */}
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-medium text-gray-900 dark:text-white">Testimonials Section</h3>
                       <label className="flex items-center cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={homeContent.testimonials.show !== false} 
                             onChange={(e) => setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, show: e.target.checked}})}
                             className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 relative"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Section</span>
                       </label>
                    </div>
                    {homeContent.testimonials.show !== false && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Section Title</label>
                          <input 
                            type="text" 
                            value={homeContent.testimonials?.title || 'Voices of Satisfaction.'}
                            onChange={(e) => setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, title: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                          <input 
                            type="text" 
                            value={homeContent.testimonials?.subtitle || 'Trusted by over 50,000 customers worldwide.'}
                            onChange={(e) => setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, subtitle: e.target.value}})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                          />
                       </div>
                    </div>

                    <div className="space-y-6">
                        {homeContent.testimonials?.items?.map((item: any, index: number) => (
                           <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Testimonial #{index + 1}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Name</label>
                                    <input 
                                      type="text" 
                                      value={item.name}
                                      onChange={(e) => {
                                         const newItems = [...(homeContent.testimonials.items || [])];
                                         newItems[index] = { ...newItems[index], name: e.target.value };
                                         setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, items: newItems}});
                                      }}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
                                    <input 
                                      type="text" 
                                      value={item.role}
                                      onChange={(e) => {
                                         const newItems = [...(homeContent.testimonials.items || [])];
                                         newItems[index] = { ...newItems[index], role: e.target.value };
                                         setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, items: newItems}});
                                      }}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                    />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Review Text</label>
                                    <textarea 
                                      value={item.text}
                                      onChange={(e) => {
                                         const newItems = [...(homeContent.testimonials.items || [])];
                                         newItems[index] = { ...newItems[index], text: e.target.value };
                                         setHomeContent({...homeContent, testimonials: {...homeContent.testimonials, items: newItems}});
                                      }}
                                      rows={2}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                    </div>
                    </>
                    )}
                  </div>
                </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                      <input 
                        type="text" 
                        value={contactContent.info.address}
                        onChange={(e) => setContactContent({...contactContent, info: {...contactContent.info, address: e.target.value}})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input 
                        type="text" 
                        value={contactContent.info.phone}
                        onChange={(e) => setContactContent({...contactContent, info: {...contactContent.info, phone: e.target.value}})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input 
                        type="text" 
                        value={contactContent.info.email}
                        onChange={(e) => setContactContent({...contactContent, info: {...contactContent.info, email: e.target.value}})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours (Mon-Fri)</label>
                      <input 
                        type="text" 
                        value={contactContent.info.hours_mon_fri}
                        onChange={(e) => setContactContent({...contactContent, info: {...contactContent.info, hours_mon_fri: e.target.value}})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours (Sat-Sun)</label>
                      <input 
                        type="text" 
                        value={contactContent.info.hours_sat_sun}
                        onChange={(e) => setContactContent({...contactContent, info: {...contactContent.info, hours_sat_sun: e.target.value}})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                      />
                   </div>
                </div>
              </div>
            )}

            <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
