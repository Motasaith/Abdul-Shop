import React from 'react';
import { FileText, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
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
          <p className="mt-4 text-sm text-indigo-200">Last Updated: January 13, 2026</p>
        </div>

        <div className="p-8 space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceptance of Terms</h2>
            </div>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these specific services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Accounts</h2>
            <p className="mb-4">
              To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate and complete information.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>We reserve the right to refuse service, terminate accounts, or remove content at our discretion.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Limitation of Liability</h2>
            </div>
            <p>
              In no event shall ShopHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of ShopHub and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Governing Law</h2>
            </div>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which ShopHub operates, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
