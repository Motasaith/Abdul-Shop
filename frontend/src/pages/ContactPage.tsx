import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import contactService, { ContactFormData } from '../services/contactService';
import { useTranslation } from '../hooks/useTranslation';
import { Link, useSearchParams } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams(); // Needs import
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: (searchParams.get('subject') as any) || 'general',
    message: searchParams.get('message') || '',
    phone: '',
    orderNumber: searchParams.get('orderNumber') || ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare form data, removing empty optional fields
      const submitData: ContactFormData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject as ContactFormData['subject'],
        message: formData.message
      };

      if (formData.phone?.trim()) {
        submitData.phone = formData.phone.trim();
      }

      if (formData.orderNumber?.trim()) {
        submitData.orderNumber = formData.orderNumber.trim();
      }

      const response = await contactService.submitContactForm(submitData);
      
      if (response.data.success) {
        setSubmitted(true);
        setTicketId(response.data.ticketId);
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: 'general',
          message: '',
          phone: '',
          orderNumber: ''
        });
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                     error.response?.data?.message || 
                     'Failed to send message. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Success message component
  if (submitted && ticketId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('contactPage.success.title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t('contactPage.success.message')}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transition-colors duration-300">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('contactPage.success.ticketId')}</p>
              <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                #{ticketId.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 mb-4">
                You can view this ticket in your profile.
              </p>
              <Link
                to={`/profile/tickets/${ticketId}`}
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                View Ticket
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setTicketId('');
              }}
              className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('contactPage.success.sendAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-900 dark:to-purple-900 text-white py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              💬 {t('contactPage.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              {t('contactPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('contactPage.info.title')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('contactPage.info.address')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">123 Shopping Street<br />Commerce City, CC 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('contactPage.info.phone')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">1-800-SHOPHUB<br />(1-800-746-7482)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('contactPage.info.email')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">support@shophub.com<br />info@shophub.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 dark:bg-orange-900/40 p-3 rounded-lg flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('contactPage.info.hours')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('contactPage.info.days.monFri')}: 9:00 AM - 6:00 PM<br />{t('contactPage.info.days.satSun')}: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⏰ {t('contactPage.responseTimes.title')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('contactPage.responseTimes.general')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('contactPage.responseTimes.support')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">12-24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('contactPage.responseTimes.order')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">4-8 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('contactPage.responseTimes.urgent')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">2-4 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('contactPage.form.title')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.name')} *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contactPage.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.email')} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contactPage.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.phone')} (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contactPage.form.phonePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.subject')} *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="general">{t('contactPage.form.subjects.general')}</option>
                      <option value="support">{t('contactPage.form.subjects.support')}</option>
                      <option value="order">{t('contactPage.form.subjects.order')}</option>
                      <option value="return">{t('contactPage.form.subjects.return')}</option>
                      <option value="feedback">{t('contactPage.form.subjects.feedback')}</option>
                      <option value="other">{t('contactPage.form.subjects.other')}</option>
                    </select>
                  </div>
                </div>

                {(formData.subject === 'order' || formData.subject === 'return') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.orderNumber')} (Optional)</label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder={t('contactPage.form.orderPlaceholder')}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      💡 {t('contactPage.form.orderHint')}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contactPage.form.message')} *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                    placeholder={t('contactPage.form.messagePlaceholder')}
                    maxLength={1000}
                  />
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500">
                      {formData.message.length}/1000 characters
                    </span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('contactPage.form.sending')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {t('contactPage.form.send')}
                    </div>
                  )}
                </button>
              </form>

              {/* Additional Help */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Quick Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/track"
                    className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <div className="bg-blue-500 p-2 rounded-lg mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('footer.track')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('footer.track')} updates</p>
                    </div>
                  </a>
                  
                  <a
                    href="/help"
                    className="flex items-center p-4 bg-green-50 dark:bg-green-900/40 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors"
                  >
                    <div className="bg-green-500 p-2 rounded-lg mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t('footer.help')}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('footer.help')} answers</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
