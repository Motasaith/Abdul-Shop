import React from 'react';
import { Cookie, Info, Settings, ShieldCheck } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="bg-orange-500 dark:bg-orange-600 px-8 py-10 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Cookie className="w-10 h-10 text-orange-200" />
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-orange-100 max-w-2xl">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
          </p>
          <p className="mt-4 text-sm text-orange-200">Last Updated: January 13, 2026</p>
        </div>

        <div className="p-8 space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Are Cookies?</h2>
            </div>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Cookies</h2>
            </div>
            <p className="mb-4">
              We use different types of cookies for various purposes:
            </p>
            <ul className="list-disc pl-5 space-y-4">
              <li>
                <strong className="text-gray-900 dark:text-white">Essential Cookies:</strong> These are necessary for the website to function properly (e.g., maintaining your shopping cart, secure login).
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Performance Cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Functional Cookies:</strong> These allow the website to remember choices you make (such as your username, language, or the region you are in).
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Marketing Cookies:</strong> These are used to track visitors across websites to display ads that are relevant and engaging.
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Managing Cookies</h2>
            </div>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
