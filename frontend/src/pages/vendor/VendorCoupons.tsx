import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import vendorService, { Coupon, CreateCouponData } from '../../services/vendorService';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const VendorCoupons: React.FC = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCouponData>();

  const fetchCoupons = async () => {
    try {
      const data = await vendorService.getCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onSubmit = async (data: CreateCouponData) => {
    try {
      await vendorService.createCoupon(data);
      toast.success('Coupon created successfully');
      setIsModalOpen(false);
      reset();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await vendorService.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No coupons found. Create one to boost sales!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{coupon.discountPercentage}% Off</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Coupon"
        actionButton={
            <button form="create-coupon-form" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create
            </button>
        }
      >
        <form id="create-coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
            <input
              {...register('code', { required: true })}
              type="text"
              placeholder="SUMMER20"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
              <input
                {...register('discountPercentage', { required: true, min: 1, max: 100 })}
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Purchase ($)</label>
              <input
                {...register('minPurchaseAmount')}
                type="number"
                defaultValue={0}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                {...register('startDate')}
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
              <input
                {...register('expiryDate', { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit (Optional)</label>
            <input
              {...register('usageLimit')}
              type="number"
              placeholder="Unlimited"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorCoupons;
