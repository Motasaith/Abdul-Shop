import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, HelpCircle, Loader } from 'lucide-react';
import contentService from '../services/contentService';
import { toast } from 'react-hot-toast';

const TermsPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await contentService.getPageContent('terms');
        if (data && data.sections && data.sections.content) {
          setContent(data.sections.content);
        }
      } catch (error) {
        console.error('Failed to load terms content', error);
        // Fallback or toast if needed
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
        <div className="bg-indigo-600 dark:bg-indigo-700 px-8 py-10 text-white">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10 text-indigo-200" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Please read these terms carefully before using our platform. By accessing or using our services, you agree to be bound by these terms.
          </p>
          <p className="mt-4 text-sm text-indigo-200">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="p-8 space-y-8 text-gray-700 dark:text-gray-300">
          {content ? (
             <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            // Fallback Content
            <>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceptance of Terms</h2>
                </div>
                <p>
                  By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Accounts</h2>
                <p className="mb-4">
                  To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password.
                </p>
              </section>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                     <AlertTriangle className="inline w-4 h-4 mr-1" />
                     Note: This is default content. Please update the Terms of Service in the Admin CMS.
                  </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
