import React from 'react';
import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';

const CareersPage: React.FC = () => {
  const { t } = useTranslation();

  const jobOpenings = [
    { key: 'frontend', color: 'blue', location: 'San Francisco, CA', type: 'Full-time', salary: '$120,000 - $160,000', experience: 'Senior' },
    { key: 'marketing', color: 'green', location: 'New York, NY', type: 'Full-time', salary: '$90,000 - $120,000', experience: 'Mid-level' },
    { key: 'design', color: 'purple', location: 'Remote', type: 'Full-time', salary: '$80,000 - $110,000', experience: 'Mid-level' },
    { key: 'devops', color: 'orange', location: 'Austin, TX', type: 'Full-time', salary: '$110,000 - $140,000', experience: 'Senior' },
    { key: 'cs', color: 'teal', location: 'Chicago, IL', type: 'Full-time', salary: '$70,000 - $90,000', experience: 'Entry-level' },
    { key: 'data', color: 'indigo', location: 'Seattle, WA', type: 'Full-time', salary: '$130,000 - $170,000', experience: 'Senior' }
  ].map(job => ({
    ...job,
    title: t(`careersPage.jobs.${job.key}.title`),
    department: t(`careersPage.jobs.${job.key}.dept`),
    description: t(`careersPage.jobs.${job.key}.desc`),
    requirements: t(`careersPage.jobs.${job.key}.reqs`, { returnObjects: true }) as string[]
  }));

  const benefits = [
    { key: 'health', icon: HeartIcon, color: 'red' },
    { key: 'schedule', icon: ClockIcon, color: 'blue' },
    { key: 'learning', icon: AcademicCapIcon, color: 'green' },
    { key: 'remote', icon: GlobeAltIcon, color: 'purple' },
    { key: 'pay', icon: CurrencyDollarIcon, color: 'yellow' },
    { key: 'innovation', icon: RocketLaunchIcon, color: 'orange' }
  ].map(benefit => ({
    ...benefit,
    title: t(`careersPage.benefits.${benefit.key}.title`),
    description: t(`careersPage.benefits.${benefit.key}.desc`)
  }));

  const values = [
    { key: 'customer', emoji: '🎯' },
    { key: 'innovation', emoji: '💡' },
    { key: 'collaboration', emoji: '🤝' },
    { key: 'excellence', emoji: '⭐' }
  ].map(value => ({
    ...value,
    title: t(`careersPage.values.${value.key}.title`),
    description: t(`careersPage.values.${value.key}.desc`)
  }));

  const testimonials = [
    { key: 'sarah', name: 'Sarah Chen', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', rating: 5 },
    { key: 'marcus', name: 'Marcus Johnson', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', rating: 5 },
    { key: 'emily', name: 'Emily Rodriguez', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', rating: 5 }
  ].map(test => ({
    ...test,
    role: t(`careersPage.testimonials.${test.key}.role`),
    quote: t(`careersPage.testimonials.${test.key}.quote`)
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <BriefcaseIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('careersPage.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('careersPage.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg">
                {t('careersPage.hero.viewPositions')}
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition duration-300">
                {t('careersPage.hero.learnCulture')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">150+</div>
              <div className="text-gray-600 dark:text-gray-300">{t('careersPage.stats.members')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">12</div>
              <div className="text-gray-600 dark:text-gray-300">{t('careersPage.stats.positions')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">25+</div>
              <div className="text-gray-600 dark:text-gray-300">{t('careersPage.stats.countries')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">4.8★</div>
              <div className="text-gray-600 dark:text-gray-300">{t('careersPage.stats.rating')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('careersPage.values.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('careersPage.values.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-6xl mb-4">{value.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('careersPage.benefits.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('careersPage.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const colorClasses = {
                red: 'from-red-500 to-red-600',
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                yellow: 'from-yellow-500 to-yellow-600',
                orange: 'from-orange-500 to-orange-600'
              };
              
              return (
                <div key={index} className="group">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 border border-gray-100 dark:border-gray-600">
                    <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[benefit.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('careersPage.jobs.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('careersPage.jobs.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobOpenings.map((job, index) => {
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
                teal: 'from-teal-500 to-teal-600',
                indigo: 'from-indigo-500 to-indigo-600'
              };
              
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`bg-gradient-to-r ${colorClasses[job.color as keyof typeof colorClasses]} text-white px-3 py-1 rounded-full text-sm font-medium mr-3`}>
                            {job.department}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{job.experience}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                        <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-300 text-sm space-x-4 mb-4">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{job.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('careersPage.jobs.requirements')}</h4>
                      <ul className="space-y-2">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                            <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button className={`flex-1 bg-gradient-to-r ${colorClasses[job.color as keyof typeof colorClasses]} text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transform hover:scale-105 transition duration-300`}>
                        {t('careersPage.jobs.apply')}
                      </button>
                      <button className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-300">
                        {t('careersPage.jobs.learnMore')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Employee Testimonials */}
      <div className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('careersPage.testimonials.title')}
            </h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('careersPage.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('careersPage.process.title')}
            </h2>
            <div className="w-24 h-1 bg-yellow-300 mx-auto mb-8"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
              {t('careersPage.process.subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('careersPage.process.step1.title')}</h3>
                <p className="text-gray-200">{t('careersPage.process.step1.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('careersPage.process.step2.title')}</h3>
                <p className="text-gray-200">{t('careersPage.process.step2.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('careersPage.process.step3.title')}</h3>
                <p className="text-gray-200">{t('careersPage.process.step3.desc')}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg">
                {t('careersPage.process.browse')}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition duration-300">
                {t('careersPage.process.contact')}
              </button>
            </div>
          </div>
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

export default CareersPage;
