import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import contactService, { ContactSubmission } from '../../services/contactService';
import { toast } from 'react-hot-toast';

const SupportTicketListPage: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await contactService.getMyContacts();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error(t('support.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('support.myTickets')}</h1>
        <Link 
          to="/contact" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {t('support.newTicket')}
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('support.noTickets')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('support.noTicketsDesc')}</p>
          <div className="mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('support.createFirst')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket._id}>
                <Link to={`/profile/tickets/${ticket._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {ticket.subject === 'order' ? `Order #${ticket.orderNumber || 'N/A'}` : ticket.subject}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          #{ticket._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                      {ticket.message}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupportTicketListPage;
