import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { Coupon } from '../../services/vendorService'; // Reuse type
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';

interface CreateCouponData {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number;
  isGlobal?: boolean;
}

const AdminCoupons: React.FC = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCouponData>();

  const fetchCoupons = async () => {
      try {
          const data = await adminService.getAllCoupons();
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
      // Ensure global flag is set if indicated (admins usually create global coupons)
      const submitData = { ...data, isGlobal: true }; 
      await adminService.createCoupon(submitData);
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
        await adminService.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage platform-wide discount codes</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Global Coupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No coupons found. Create a global coupon to boost sales!</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {coupon.code}
                        {coupon.isGlobal && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-300">Global</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {coupon.isGlobal ? 'Store-wide' : 'Vendor Specific'}
                    </td>
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
                        title="Delete Coupon"
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
        title="Create Global Coupon"
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
              placeholder="SALE2024"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
              <input
                {...register('discountPercentage', { required: true, min: 1, max: 100 })}
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Purchase ($)</label>
              <input
                {...register('minPurchaseAmount')}
                type="number"
                defaultValue={0}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
              <input
                {...register('expiryDate', { required: true })}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit (Optional)</label>
            <input
              {...register('usageLimit')}
              type="number"
              placeholder="Unlimited"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
            />
          </div>
          <p className="text-xs text-blue-500">Note: Admin created coupons are "Global" by default and apply to all products.</p>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
