import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
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
          <p className="mt-4 text-sm text-blue-200">Last Updated: January 13, 2026</p>
        </div>

        <div className="p-8 space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us. This may include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contact information (name, email, phone number, address)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Account credentials (username, password)</li>
              <li>Communications and correspondence</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            <p className="mb-4">
              We use the collected information for various purposes, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Sending transaction notifications and updates</li>
              <li>Improving our services, products, and user experience</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sharing of Information</h2>
            <p>
              We do not sell your personal information. We may share your information with third-party service providers who assist us in our operations (e.g., payment processors, shipping carriers) provided they agree to keep your information confidential.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
