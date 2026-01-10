import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useTranslation } from '../hooks/useTranslation';

const ShippingPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('domestic');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState('');

  const tabs = [
    { id: 'domestic', label: t('shippingPage.tabs.domestic'), icon: MapPinIcon },
    { id: 'international', label: t('shippingPage.tabs.international'), icon: GlobeAltIcon },
    { id: 'calculator', label: t('shippingPage.tabs.calculator'), icon: CalculatorIcon }
  ];

  const shippingOptions = [
    {
      id: 'standard',
      name: t('shippingPage.domestic.options.standard.name'),
      price: 'FREE',
      originalPrice: 'Rs. 150',
      time: t('shippingPage.domestic.options.standard.time'),
      description: 'Free shipping on orders over Rs. 1000',
      icon: TruckIcon,
      features: ['Tracking included', 'Insurance included', 'Signature not required'],
      popular: true
    },
    {
      id: 'express',
      name: t('shippingPage.domestic.options.express.name'),
      price: 'Rs. 300',
      time: t('shippingPage.domestic.options.express.time'),
      description: 'Faster delivery for urgent orders',
      icon: ClockIcon,
      features: ['Priority handling', 'Tracking included', 'Insurance included'],
      popular: false
    },
    {
      id: 'overnight',
      name: t('shippingPage.domestic.options.overnight.name'),
      price: 'Rs. 800',
      time: t('shippingPage.domestic.options.overnight.time'),
      description: 'Next day delivery for major cities',
      icon: CheckCircleIcon,
      features: ['Next day delivery', 'Signature required', 'Full insurance'],
      popular: false
    }
  ];

  const internationalZones = [
    {
      zone: t('shippingPage.international.zones.zone1'),
      countries: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      price: 'Rs. 1,500',
      time: '7-14 business days',
      expressPrice: 'Rs. 3,000',
      expressTime: '3-5 business days'
    },
    {
      zone: t('shippingPage.international.zones.zone2'),
      countries: ['Germany', 'France', 'Japan', 'South Korea'],
      price: 'Rs. 1,800',
      time: '10-16 business days',
      expressPrice: 'Rs. 3,500',
      expressTime: '4-7 business days'
    },
    {
      zone: t('shippingPage.international.zones.zone3'),
      countries: ['Brazil', 'Russia', 'South Africa', 'Middle East'],
      price: 'Rs. 2,200',
      time: '14-21 business days',
      expressPrice: 'Rs. 4,000',
      expressTime: '7-10 business days'
    }
  ];

  const faqs = [
    {
      question: t('shippingPage.faq.q1.q'),
      answer: t('shippingPage.faq.q1.a')
    },
    {
      question: t('shippingPage.faq.q2.q'),
      answer: t('shippingPage.faq.q2.a')
    },
    {
      question: t('shippingPage.faq.q3.q'),
      answer: t('shippingPage.faq.q3.a')
    },
    {
      question: t('shippingPage.faq.q4.q'),
      answer: t('shippingPage.faq.q4.a')
    },
    {
      question: t('shippingPage.faq.q5.q'),
      answer: t('shippingPage.faq.q5.a')
    },
    {
      question: t('shippingPage.faq.q6.q'),
      answer: t('shippingPage.faq.q6.a')
    }
  ];

  const calculateShipping = () => {
    if (!zipCode.trim()) {
      alert('Please enter a valid ZIP code');
      return;
    }
    // This would integrate with a real shipping API
    alert(`Shipping options for ${zipCode} calculated! (This is a demo)`);
  };

  const renderDomesticTab = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl p-8 text-center transition-colors duration-300">
        <TruckIcon className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('shippingPage.domestic.heroTitle')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('shippingPage.hero.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">{t('shippingPage.hero.badges.free')}</span>
          </div>
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">{t('shippingPage.hero.badges.tracking')}</span>
          </div>
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">{t('shippingPage.hero.badges.packaging')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="grid md:grid-cols-3 gap-6">
        {shippingOptions.map((option) => (
          <div
            key={option.id}
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all duration-200 hover:shadow-xl ${
              option.popular ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
            }`}
          >
            {option.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center">
              <option.icon className={`h-12 w-12 mx-auto mb-4 ${option.popular ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{option.name}</h3>
              <div className="mb-2">
                <span className={`text-2xl font-bold ${option.popular ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {option.price}
                </span>
                {option.originalPrice && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">{option.originalPrice}</span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-3">{option.time}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{option.description}</p>
              
              <ul className="space-y-2">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Coverage Map */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          {t('shippingPage.domestic.coverage')}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('shippingPage.domestic.majorCities')} (1-2 Days)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Karachi
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Lahore
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Islamabad
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Rawalpindi
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Faisalabad
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                Multan
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('shippingPage.domestic.otherAreas')} (3-7 Days)</h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                All major towns and cities
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                Rural areas (delivery to nearest hub)
              </div>
              <div className="flex items-center">
                <CheckCircleIconSolid className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                Remote locations (additional charges may apply)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('shippingPage.domestic.services')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
              {t('shippingPage.domestic.fragile')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Special packaging and handling for delicate items. Additional Rs. 200 for extra protection.
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
              {t('shippingPage.domestic.scheduled')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Choose a specific delivery date and time slot. Available for express shipping only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInternationalTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-8 text-center transition-colors duration-300">
        <GlobeAltIcon className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('shippingPage.international.title')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('shippingPage.international.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">150+ Countries</span>
          </div>
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">Customs Support</span>
          </div>
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIconSolid className="h-5 w-5 mr-2" />
            <span className="font-medium">Full Insurance</span>
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div className="space-y-6">
        {internationalZones.map((zone, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{zone.zone}</h3>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{zone.price}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Standard</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{zone.time}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{zone.expressPrice}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Express</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{zone.expressTime}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {zone.countries.map((country, countryIndex) => (
                <span
                  key={countryIndex}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center">
          <InformationCircleIcon className="h-6 w-6 mr-2" />
          {t('shippingPage.international.info')}
        </h3>
        <ul className="space-y-2 text-amber-800 dark:text-amber-200">
          <li>• Customs duties and taxes are the responsibility of the recipient</li>
          <li>• Delivery times may vary due to customs processing</li>
          <li>• Some items may be restricted or prohibited in certain countries</li>
          <li>• We provide customs documentation and support throughout the process</li>
          <li>• Insurance is included for lost or damaged packages</li>
          <li>• Tracking is available for all international shipments</li>
        </ul>
      </div>
    </div>
  );

  const renderCalculatorTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-8 text-center transition-colors duration-300">
        <CalculatorIcon className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('shippingPage.calculator.title')}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('shippingPage.calculator.subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter ZIP/Postal Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder={t('shippingPage.calculator.placeholder')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
              <button
                onClick={calculateShipping}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('shippingPage.calculator.calculate')}
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{t('shippingPage.calculator.estimates')}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Standard Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">FREE (Rs. 1000+)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Express Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">Rs. 300</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Overnight Express</span>
                <span className="font-medium text-gray-900 dark:text-white">Rs. 800</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weight-Based Pricing</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Up to 1 kg</span>
              <span className="font-medium text-gray-900 dark:text-white">Base rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">1-5 kg</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 50/kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">5-10 kg</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 40/kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Over 10 kg</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 30/kg</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Charges</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Fragile items</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Remote areas</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 150</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Scheduled delivery</span>
              <span className="font-medium text-gray-900 dark:text-white">+Rs. 250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Insurance (optional)</span>
              <span className="font-medium text-gray-900 dark:text-white">2% of value</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('shippingPage.hero.title')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('shippingPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors duration-300">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'domestic' && renderDomesticTab()}
          {activeTab === 'international' && renderInternationalTab()}
          {activeTab === 'calculator' && renderCalculatorTab()}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('shippingPage.faq.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('helpPage.subtitle')}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</h4>
                  {expandedFaq === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">{t('shippingPage.contact.title')}</h2>
          <p className="text-blue-100 mb-6">
            {t('shippingPage.contact.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              {t('shippingPage.contact.contact')}
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              {t('shippingPage.contact.track')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
