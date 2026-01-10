import React from 'react';
import { 
  NewspaperIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CameraIcon,
  UserGroupIcon,
  TrophyIcon

} from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';

const PressPage: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { key: 'users', number: '2M+', color: 'blue' },
    { key: 'products', number: '50K+', color: 'green' },
    { key: 'uptime', number: '99.9%', color: 'purple' },
    { key: 'countries', number: '150+', color: 'orange' }
  ].map(stat => ({
    ...stat,
    label: t(`pressPage.stats.${stat.key}`)
  }));

  const pressReleases = [
    { key: 'q4growth', color: 'blue' },
    { key: 'sustainable', color: 'green' },
    { key: 'award', color: 'purple' },
    { key: 'expansion', color: 'orange' }
  ].map(release => ({
    ...release,
    title: t(`pressPage.releases.items.${release.key}.title`),
    date: t(`pressPage.releases.items.${release.key}.date`),
    category: t(`pressPage.releases.items.${release.key}.category`),
    excerpt: t(`pressPage.releases.items.${release.key}.excerpt`)
  }));

  const mediaKit = [
    { key: 'logos', icon: CameraIcon, items: ['PNG', 'SVG', 'EPS formats', 'Light & dark versions'] },
    { key: 'brand', icon: DocumentTextIcon, items: ['Color palette', 'Typography', 'Logo usage', 'Brand voice'] },
    { key: 'images', icon: CameraIcon, items: ['App screenshots', 'Product photos', 'Interface mockups', 'Lifestyle images'] },
    { key: 'team', icon: UserGroupIcon, items: ['CEO headshot', 'Leadership team', 'Board members', 'Various resolutions'] }
  ].map(item => ({
    ...item,
    title: t(`pressPage.mediaKit.items.${item.key}.title`),
    description: t(`pressPage.mediaKit.items.${item.key}.desc`)
  }));

  const awards = [
    { key: 'ecommerce', icon: TrophyIcon },
    { key: 'cx', icon: TrophyIcon },
    { key: 'sustainable', icon: TrophyIcon }
  ].map(award => ({
    ...award,
    title: t(`pressPage.awards.items.${award.key}.title`),
    organization: t(`pressPage.awards.items.${award.key}.org`),
    year: t(`pressPage.awards.items.${award.key}.year`)
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <NewspaperIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('pressPage.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('pressPage.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg">
                {t('pressPage.hero.download')}
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition duration-300">
                {t('pressPage.hero.contact')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('pressPage.stats.title')}</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: 'text-blue-600',
                green: 'text-green-600',
                purple: 'text-purple-600',
                orange: 'text-orange-600'
              };
              return (
                <div key={index} className="text-center group">
                  <div className={`text-4xl md:text-5xl font-bold ${colorClasses[stat.color as keyof typeof colorClasses]} mb-2 group-hover:scale-110 transform transition duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Press Releases Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('pressPage.releases.title')}
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('pressPage.releases.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pressReleases.map((release, index) => {
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600'
              };
              
              return (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-block px-3 py-1 bg-gradient-to-r ${colorClasses[release.color as keyof typeof colorClasses]} text-white text-sm font-medium rounded-full`}>
                        {release.category}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <CalendarDaysIcon className="w-4 h-4 mr-2" />
                        {release.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-300">
                      {release.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{release.excerpt}</p>
                    <button className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition duration-300">
                      {t('pressPage.releases.readFull')}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Media Kit Section */}
      <div className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('pressPage.mediaKit.title')}
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('pressPage.mediaKit.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mediaKit.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-gray-700/50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 border border-gray-100 dark:border-gray-600 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-600 transition duration-300">
                      <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{item.description}</p>
                    <ul className="text-gray-500 dark:text-gray-400 text-sm space-y-1 mb-6">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex}>• {subItem}</li>
                      ))}
                    </ul>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition duration-300">
                      {t('pressPage.mediaKit.download')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Awards Section */}
      <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('pressPage.awards.title')}
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('pressPage.awards.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {awards.map((award, index) => {
              const IconComponent = award.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 text-center border border-transparent dark:border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-yellow-600 dark:text-yellow-500 font-bold text-lg mb-2">{award.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{award.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{award.organization}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <MegaphoneIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Press <span className="text-yellow-300">Inquiries</span>
          </h2>
          <div className="w-24 h-1 bg-yellow-300 mx-auto mb-8"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            For media inquiries, interview requests, or additional information, please contact our press team. 
            We're here to help with your story.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="font-semibold mb-2">{t('pressPage.contact.pressContact')}</div>
              <div className="text-yellow-300 text-lg font-bold">press@shophub.com</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="font-semibold mb-2">{t('pressPage.contact.mediaRel')}</div>
              <div className="text-yellow-300 text-lg font-bold">1-800-PRESS-HUB</div>
            </div>
          </div>
          
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-xl">
            {t('pressPage.contact.cta')}
          </button>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default PressPage;
