import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Shield, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw,
  Mail,
  Phone,
  Power,
  Filter
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verificationStatus?: {
    emailVerified: boolean;
    phoneVerified: boolean;
    isFullyVerified: boolean;
  };
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const roles = ['all', 'user', 'vendor', 'admin'];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUsers({
          search: debouncedSearchTerm,
          role: selectedRole === 'all' ? '' : selectedRole
        });
        setUsers(data.users || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm, selectedRole]);

  // Process users data to include verification status
  const filteredUsers = users.map(user => ({
    ...user,
    verificationStatus: user.verificationStatus || {
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.phoneVerified,
      isFullyVerified: (!!user.emailVerified && !!user.phoneVerified)
    }
  }));

  /* Delete Modal State */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

  const confirmDelete = (user: User) => {
    setUserToDelete({ id: user._id, name: user.name });
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    const user = users.find(u => u._id === id);
    if (!user) return;
    
    try {
      await adminService.updateUserStatus(id, !user.isActive);
      setUsers(users.map(u =>
        u._id === id ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await adminService.deleteUser(userToDelete.id);
      setUsers(users.filter(u => u._id !== userToDelete.id));
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'vendor': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="space-y-6 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards (Derived from current view) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: UserIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Verified Emails', value: users.filter(u => u.verificationStatus?.emailVerified).length, icon: Mail, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: Power, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{loading ? '-' : stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 rounded-2xl shadow-lg space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            {/* Using standard tbody to avoid potential framer-motion visibility issues seen in Orders */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>
                   </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No users found.
                   </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user._id}
                    className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getRandomColor(user.name)} flex items-center justify-center text-white font-bold shadow-md`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          <span className={user.verificationStatus?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                             {user.verificationStatus?.emailVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          <span className={user.verificationStatus?.phoneVerified ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                             {user.verificationStatus?.phoneVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${
                         user.isActive 
                           ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                           : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         {user.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                           <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(user)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete User"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
         isOpen={deleteModalOpen}
         onClose={() => setDeleteModalOpen(false)}
         onConfirm={handleDeleteUser}
         title="Delete User"
         message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone and will remove all their data.`}
         confirmText="Delete User"
         cancelText="Cancel"
         variant="danger"
      />
    </div>
  );
};

export default AdminUsers;

