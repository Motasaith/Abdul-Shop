import React, { useState } from 'react';
import { Ruler, User, Shirt, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface SizeChart {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
  inseam?: string;
  uk?: string;
  us?: string;
  eu?: string;
}

const SizeGuidePage: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('clothing');

  const clothingSizes: SizeChart[] = [
    { size: 'XS', chest: '86-91', waist: '71-76', hips: '91-96', length: '66', shoulder: '41', sleeve: '59' },
    { size: 'S', chest: '91-96', waist: '76-81', hips: '96-101', length: '68', shoulder: '43', sleeve: '61' },
    { size: 'M', chest: '96-101', waist: '81-86', hips: '101-106', length: '70', shoulder: '45', sleeve: '63' },
    { size: 'L', chest: '101-106', waist: '86-91', hips: '106-111', length: '72', shoulder: '47', sleeve: '65' },
    { size: 'XL', chest: '106-111', waist: '91-96', hips: '111-116', length: '74', shoulder: '49', sleeve: '67' },
    { size: 'XXL', chest: '111-116', waist: '96-101', hips: '116-121', length: '76', shoulder: '51', sleeve: '69' },
  ];

  const pantsSizes: SizeChart[] = [
    { size: '28', waist: '71-74', hips: '86-89', inseam: '81' },
    { size: '30', waist: '76-79', hips: '91-94', inseam: '81' },
    { size: '32', waist: '81-84', hips: '96-99', inseam: '81' },
    { size: '34', waist: '86-89', hips: '101-104', inseam: '81' },
    { size: '36', waist: '91-94', hips: '106-109', inseam: '81' },
    { size: '38', waist: '96-99', hips: '111-114', inseam: '81' },
  ];

  const shoeSizes: SizeChart[] = [
    { size: '6', uk: '6', us: '7', eu: '40' },
    { size: '6.5', uk: '6.5', us: '7.5', eu: '40.5' },
    { size: '7', uk: '7', us: '8', eu: '41' },
    { size: '7.5', uk: '7.5', us: '8.5', eu: '41.5' },
    { size: '8', uk: '8', us: '9', eu: '42' },
    { size: '8.5', uk: '8.5', us: '9.5', eu: '42.5' },
    { size: '9', uk: '9', us: '10', eu: '43' },
    { size: '9.5', uk: '9.5', us: '10.5', eu: '43.5' },
    { size: '10', uk: '10', us: '11', eu: '44' },
    { size: '10.5', uk: '10.5', us: '11.5', eu: '44.5' },
    { size: '11', uk: '11', us: '12', eu: '45' },
    { size: '11.5', uk: '11.5', us: '12.5', eu: '45.5' },
  ];

  const categories = [
    { id: 'clothing', name: t('sizeGuidePage.categories.clothing'), icon: Shirt },
    { id: 'pants', name: t('sizeGuidePage.categories.pants'), icon: User },
    { id: 'shoes', name: t('sizeGuidePage.categories.shoes'), icon: ShoppingBag },
  ];

  const renderSizeChart = () => {
    switch (activeCategory) {
      case 'clothing':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.size')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.chest')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.waist')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.hips')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.length')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.shoulder')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.sleeve')}</th>
                </tr>
              </thead>
              <tbody>
                {clothingSizes.map((size, index) => (
                  <tr key={size.size} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{size.size}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.chest}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.waist}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.hips}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.length}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.shoulder}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'pants':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.size')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.waist')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.hips')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.inseam')}</th>
                </tr>
              </thead>
              <tbody>
                {pantsSizes.map((size, index) => (
                  <tr key={size.size} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{size.size}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.waist}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.hips}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.inseam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'shoes':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.size')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.uk')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.us')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">{t('sizeGuidePage.table.eu')}</th>
                </tr>
              </thead>
              <tbody>
                {shoeSizes.map((size, index) => (
                  <tr key={size.size} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{size.size}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.uk}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.us}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{size.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Ruler className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('sizeGuidePage.title')}</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('sizeGuidePage.subtitle')}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-12 transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {categories.find(c => c.id === activeCategory)?.name} Size Chart
            </h2>
          </div>
          <div className="p-6">
            {renderSizeChart()}
          </div>
        </div>

        {/* How to Measure */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('sizeGuidePage.measure.title')}</h2>
          
          {activeCategory === 'clothing' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('sizeGuidePage.measure.body')}</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>{t('sizeGuidePage.measure.chest')}:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                  <li><strong>{t('sizeGuidePage.measure.waist')}:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                  <li><strong>{t('sizeGuidePage.measure.hips')}:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('sizeGuidePage.measure.garment')}</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>{t('sizeGuidePage.measure.length')}:</strong> Measured from the highest point of the shoulder to the bottom hem.</li>
                  <li><strong>{t('sizeGuidePage.measure.shoulder')}:</strong> Measured from shoulder point to shoulder point across the back.</li>
                  <li><strong>{t('sizeGuidePage.measure.sleeve')}:</strong> Measured from the shoulder seam to the end of the cuff.</li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'pants' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('sizeGuidePage.measure.body')}</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>{t('sizeGuidePage.measure.waist')}:</strong> Measure around your natural waistline where you normally wear your pants.</li>
                  <li><strong>{t('sizeGuidePage.measure.hips')}:</strong> Measure around the fullest part of your hips and seat.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garment Measurements</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>Inseam:</strong> Measured from the crotch seam to the bottom of the leg opening.</li>
                  <li><strong>Rise:</strong> Measured from the crotch seam to the top of the waistband.</li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'shoes' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('sizeGuidePage.measure.foot')}</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>{t('sizeGuidePage.measure.ftLength')}:</strong> Measure from the back of your heel to the tip of your longest toe.</li>
                  <li><strong>{t('sizeGuidePage.measure.width')}:</strong> Measure across the widest part of your foot.</li>
                  <li><strong>Best Time:</strong> Measure your feet in the evening when they're at their largest.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Size Conversion</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>UK:</strong> Standard UK sizing</li>
                  <li><strong>US:</strong> Standard US sizing</li>
                  <li><strong>EU:</strong> European sizing</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-3">{t('sizeGuidePage.tips.title')}</h3>
          <ul className="space-y-2 text-blue-800 dark:text-gray-300">
            {(t('sizeGuidePage.tips.list', { returnObjects: true }) as string[]).map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;
