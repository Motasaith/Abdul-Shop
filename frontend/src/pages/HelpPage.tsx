import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const faqs = [
    {
      question: t('helpPage.faq.q1.q'),
      answer: t('helpPage.faq.q1.a')
    },
    {
      question: t('helpPage.faq.q2.q'),
      answer: t('helpPage.faq.q2.a')
    },
    {
      question: t('helpPage.faq.q3.q'),
      answer: t('helpPage.faq.q3.a')
    },
    {
      question: t('helpPage.faq.q4.q'),
      answer: t('helpPage.faq.q4.a')
    },
    {
      question: t('helpPage.faq.q5.q'),
      answer: t('helpPage.faq.q5.a')
    },
    {
      question: t('helpPage.faq.q6.q'),
      answer: t('helpPage.faq.q6.a')
    }
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">{t('helpPage.title')}</h1>
            
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{t('helpPage.subtitle')}</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('helpPage.searchPlaceholder')}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center transition-colors duration-300">
                <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('helpPage.categories.orders.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('helpPage.categories.orders.desc')}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg text-center transition-colors duration-300">
                <div className="bg-green-100 dark:bg-green-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('helpPage.categories.returns.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('helpPage.categories.returns.desc')}</p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg text-center transition-colors duration-300">
                <div className="bg-purple-100 dark:bg-purple-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('helpPage.categories.account.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('helpPage.categories.account.desc')}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{t('helpPage.faq.title')}</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {faq.question}
                        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 text-gray-700 dark:text-gray-300">
                        {faq.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('helpPage.stillNeedHelp.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('helpPage.stillNeedHelp.desc')}</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('helpPage.stillNeedHelp.cta')}
                </button>
                <button 
                  onClick={() => navigate('/track-ticket')}
                  className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('support.trackButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
