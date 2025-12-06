import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import {
  ArrowPathIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftEllipsisIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  CubeIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const ReturnsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policy');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const tabs = [
    { id: 'policy', label: t('returnsPage.tabs.policy'), icon: ArrowPathIcon },
    { id: 'process', label: t('returnsPage.tabs.process'), icon: ClockIcon },
    { id: 'tracking', label: t('returnsPage.tabs.tracking'), icon: MagnifyingGlassIcon },
    { id: 'faq', label: t('returnsPage.tabs.faq'), icon: QuestionMarkCircleIcon }
  ];

  const returnReasons = [
    { id: 'defective', label: 'Defective/Damaged', icon: ExclamationTriangleIcon, color: 'red' },
    { id: 'size', label: 'Wrong Size', icon: CubeIcon, color: 'blue' },
    { id: 'not-expected', label: 'Not as Expected', icon: XCircleIcon, color: 'yellow' },
    { id: 'changed-mind', label: 'Changed Mind', icon: ArrowPathIcon, color: 'green' }
  ];

  const processSteps = [
    {
      step: 1,
      title: t('returnsPage.process.steps.initiate.title'),
      description: t('returnsPage.process.steps.initiate.desc'),
      icon: DocumentTextIcon,
      status: 'complete'
    },
    {
      step: 2,
      title: t('returnsPage.process.steps.pack.title'),
      description: t('returnsPage.process.steps.pack.desc'),
      icon: CubeIcon,
      status: 'active'
    },
    {
      step: 3,
      title: t('returnsPage.process.steps.processing.title'),
      description: t('returnsPage.process.steps.processing.desc'),
      icon: ClockIcon,
      status: 'pending'
    },
    {
      step: 4,
      title: t('returnsPage.process.steps.refund.title'),
      description: t('returnsPage.process.steps.refund.desc'),
      icon: CreditCardIcon,
      status: 'pending'
    }
  ];

  const faqs = [
    {
      question: t('returnsPage.faq.q1.q'),
      answer: t('returnsPage.faq.q1.a')
    },
    {
      question: t('returnsPage.faq.q2.q'),
      answer: t('returnsPage.faq.q2.a')
    },
    {
      question: t('returnsPage.faq.q3.q'),
      answer: t('returnsPage.faq.q3.a')
    },
    {
      question: t('returnsPage.faq.q4.q'),
      answer: t('returnsPage.faq.q4.a')
    },
    {
      question: t('returnsPage.faq.q5.q'),
      answer: t('returnsPage.faq.q5.a')
    },
    {
      question: t('returnsPage.faq.q6.q'),
      answer: t('returnsPage.faq.q6.a')
    }
  ];

  const handleTrackReturn = () => {
    if (trackingNumber.trim()) {
      // In a real app, this would navigate to a tracking page
      alert(`Tracking return with number: ${trackingNumber}`);
    }
  };

  const renderPolicyTab = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <ArrowPathIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('returnsPage.hero.title')}</h2>
          <p className="text-lg text-gray-600 mb-6">{t('returnsPage.hero.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center text-green-600">
              <CheckCircleIconSolid className="h-5 w-5 mr-2" />
              <span className="font-medium">{t('returnsPage.hero.badges.thirtyDay')}</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleIconSolid className="h-5 w-5 mr-2" />
              <span className="font-medium">{t('returnsPage.hero.badges.freeShipping')}</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleIconSolid className="h-5 w-5 mr-2" />
              <span className="font-medium">{t('returnsPage.hero.badges.fastRefunds')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Requirements */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">{t('returnsPage.policy.canReturn')}</h3>
          </div>
          <ul className="space-y-3">
            {(t('returnsPage.policy.canReturnList', { returnObjects: true }) as string[]).map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIconSolid className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">{t('returnsPage.policy.cannotReturn')}</h3>
          </div>
          <ul className="space-y-3">
             {(t('returnsPage.policy.cannotReturnList', { returnObjects: true }) as string[]).map((item, index) => (
              <li key={index} className="flex items-start">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Return Timeframes */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
          {t('returnsPage.policy.timeframes.title')}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">{t('returnsPage.policy.timeframes.most')}</h4>
            <p className="text-green-700 text-sm">{t('returnsPage.faq.q1.a')}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('returnsPage.policy.timeframes.electronics')}</h4>
            <p className="text-yellow-700 text-sm">15 days</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{t('returnsPage.policy.timeframes.beauty')}</h4>
            <p className="text-blue-700 text-sm">30 days, unopened</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessTab = () => (
    <div className="space-y-8">
      {/* Process Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">{t('returnsPage.process.title')}</h3>
        <div className="relative">
          {processSteps.map((step, index) => (
            <div key={step.step} className="flex items-center mb-8 last:mb-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-4 border-blue-600 relative z-10">
                <step.icon className="h-6 w-6 text-blue-600" />
              </div>
              {index < processSteps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300 -z-10"></div>
              )}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">{t('about.mission.title')}: {step.title}</h4>
                </div>
                <p className="text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">{t('returnsPage.process.startReturn')}</h3>
          <p className="text-blue-700 mb-6">{t('returnsPage.process.startDesc')}</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            {t('returnsPage.process.viewOrders')}
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-green-900 mb-4">{t('returnsPage.process.needHelp')}</h3>
          <p className="text-green-700 mb-6">{t('helpPage.stillNeedHelp.desc')}</p>
          <Link
            to="/contact"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" />
            {t('returnsPage.process.contactSupport')}
          </Link>
        </div>
      </div>

      {/* Return Reasons */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Common Return Reasons</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {returnReasons.map((reason) => {
            const colorClasses = {
              red: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-900' },
              blue: { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-900' },
              yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-900' },
              green: { border: 'border-green-200', bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-900' }
            };
            const colors = colorClasses[reason.color as keyof typeof colorClasses];
            
            return (
              <div key={reason.id} className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
                <reason.icon className={`h-8 w-8 ${colors.icon} mb-2`} />
                <h4 className={`font-semibold ${colors.text}`}>{reason.label}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrackingTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <TruckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('returnsPage.tracking.title')}</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('returnsPage.tracking.desc')}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('returnsPage.tracking.placeholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTrackReturn}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              {t('returnsPage.tracking.track')}
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">{t('returnsPage.tracking.tips')}:</h4>
           <ul className="space-y-2 text-gray-600">
             {(t('returnsPage.tracking.tipsList', { returnObjects: true }) as string[]).map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('shippingPage.domestic.options.standard.name')}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
          >
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">{t('returnsPage.process.viewOrders')}</h4>
            <p className="text-sm text-gray-600">{t('returnsPage.process.startDesc')}</p>
          </Link>
          <Link
            to="/contact"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
          >
            <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">{t('returnsPage.process.contactSupport')}</h4>
            <p className="text-sm text-gray-600">{t('helpPage.stillNeedHelp.desc')}</p>
          </Link>
          <a
            href="tel:1-800-746-7482"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
          >
            <PhoneIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">{t('returnsPage.footer.phone')}</h4>
            <p className="text-sm text-gray-600">1-800-SHOPHUB</p>
          </a>
        </div>
      </div>
    </div>
  );

  const renderFaqTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <QuestionMarkCircleIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{t('returnsPage.faq.title')}</h3>
        <p className="text-gray-600">{t('helpPage.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 pr-4">{faq.question}</h4>
              {expandedFaq === index ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            {expandedFaq === index && (
              <div className="px-6 pb-6">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('helpPage.stillNeedHelp.title')}</h4>
        <p className="text-gray-600 mb-6">{t('helpPage.stillNeedHelp.desc')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            {t('returnsPage.process.contactSupport')}
          </Link>
          <a
            href="tel:1-800-746-7482"
            className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <PhoneIcon className="h-5 w-5 mr-2" />
            Call 1-800-SHOPHUB
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('returnsPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
          {activeTab === 'policy' && renderPolicyTab()}
          {activeTab === 'process' && renderProcessTab()}
          {activeTab === 'tracking' && renderTrackingTab()}
          {activeTab === 'faq' && renderFaqTab()}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t('returnsPage.footer.guarantee')}</h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('returnsPage.footer.desc')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <EnvelopeIcon className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('returnsPage.footer.email')}</h3>
                <p className="text-blue-200 text-sm">returns@shophub.com</p>
              </div>
              <div>
                <PhoneIcon className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('returnsPage.footer.phone')}</h3>
                <p className="text-blue-200 text-sm">1-800-SHOPHUB</p>
              </div>
              <div>
                <ClockIcon className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{t('returnsPage.footer.hours')}</h3>
                <p className="text-blue-200 text-sm">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
