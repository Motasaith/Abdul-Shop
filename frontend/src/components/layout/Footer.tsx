import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import newsletterService from '../../services/newsletterService';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Send,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  CreditCard
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setNewsletterLoading(true);
    
    try {
      const response = await newsletterService.subscribe({
        email: newsletterEmail,
        source: 'footer'
      });
      
      toast.success(response.message || 'Successfully subscribed to newsletter!');
      setNewsletterEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('footer.newsletter')}</h3>
              <p className="text-blue-100 opacity-90 max-w-md">
                {t('footer.subscribeText')}
              </p>
            </div>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('home.enterEmail')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {newsletterLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t('home.subscribe')}
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                ShopHub
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all transform hover:-translate-y-1">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white transition-all transform hover:-translate-y-1">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4">
              {[
                { name: t('footer.about'), href: '/about' },
                { name: t('footer.contact'), href: '/contact' },
                { name: t('footer.careers'), href: '/careers' },
                { name: t('footer.blog'), href: '/blog' },
                { name: t('footer.press'), href: '/press' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('footer.customerService')}</h4>
            <ul className="space-y-4">
              {[
                { name: t('footer.help'), href: '/help' },
                { name: t('footer.track'), href: '/track' },
                { name: t('footer.returns'), href: '/returns' },
                { name: t('footer.shipping'), href: '/shipping' },
                { name: t('footer.sizeGuide'), href: '/size-guide' },
                { name: 'View Support Tickets', href: '/profile/tickets' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>123 Commerce St, Suite 100<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>support@shophub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} ShopHub. {t('footer.rights')}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/cookies" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t('footer.cookies')}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
             <CreditCard className="h-6 w-6" />
             <div className="flex gap-1">
               <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
               <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
               <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
