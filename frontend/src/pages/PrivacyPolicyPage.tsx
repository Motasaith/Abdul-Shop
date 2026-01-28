import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, FileText, Loader, AlertTriangle } from 'lucide-react';
import contentService from '../services/contentService';

const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await contentService.getPageContent('privacy');
        if (data && data.sections && data.sections.content) {
          setContent(data.sections.content);
        }
      } catch (error) {
        console.error('Failed to load privacy content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
         <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="bg-blue-600 dark:bg-blue-700 px-8 py-10 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10 text-blue-200" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="mt-4 text-sm text-blue-200">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="p-8 space-y-8 text-gray-700 dark:text-gray-300">
          {content ? (
             <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            // Fallback Content
            <>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Information We Collect</h2>
                </div>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Your Information</h2>
                </div>
                <p className="mb-4">
                   We use the collected information for various purposes, including processing orders, providing support, and improving our services.
                </p>
              </section>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                     <AlertTriangle className="inline w-4 h-4 mr-1" />
                     Note: This is default content. Please update the Privacy Policy in the Admin CMS.
                  </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
