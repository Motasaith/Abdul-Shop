import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import contactService, { ContactSubmission } from '../../services/contactService';
import { toast } from 'react-hot-toast';

const SupportTicketDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const { data } = await contactService.getMyContact(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error(t('support.fetchError'));
      navigate('/profile/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket || !window.confirm(t('support.closeConfirm'))) return;

    try {
      setClosing(true);
      await contactService.closeMyContact(ticket._id);
      toast.success(t('support.closeSuccess'));
      fetchTicket(ticket._id); // Refresh
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error(t('support.closeError'));
    } finally {
      setClosing(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket || !window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

    try {
      setDeleting(true);
      await contactService.deleteMyContact(ticket._id);
      toast.success('Ticket deleted successfully');
      navigate('/profile/tickets');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    } finally {
      setDeleting(false);
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

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link to="/profile/tickets" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('support.backToTickets')}
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {ticket.subject === 'order' ? `Order #${ticket.orderNumber}` : ticket.subject}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ticket #{ticket._id.slice(-8).toUpperCase()} • {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-3">
             {ticket.status !== 'closed' && (
              <button
                onClick={handleCloseTicket}
                disabled={closing || deleting}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {closing ? t('common.loading') : t('support.closeTicket')}
              </button>
            )}

            <Link
              to={`/contact?subject=other&message=Ref: Ticket #${ticket._id.toUpperCase()}\n\n`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </Link>
            <button
               onClick={handleDeleteTicket}
               disabled={closing || deleting}
               className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
             >
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
               {deleting ? 'Deleting...' : 'Delete'}
             </button>
          </div>
        </div>
      </div>

      {/* Conversation View */}
      <div className="space-y-6">
        {/* User Message */}
        <div className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 max-w-2xl shadow-md">
                <p className="whitespace-pre-wrap">{ticket.message}</p>
                <p className="text-blue-100 text-xs mt-2 text-right">
                    {new Date(ticket.createdAt).toLocaleString()}
                </p>
            </div>
        </div>

        {/* Admin Response */}
        {ticket.response && (
            <div className="flex justify-start">
               <div className="flex items-end">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-2 text-xs mb-1">
                      Sup
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 max-w-2xl shadow-sm">
                      <p className="font-semibold text-xs text-blue-600 mb-1">Support Team</p>
                      <p className="whitespace-pre-wrap">{ticket.response.message}</p>
                       <p className="text-gray-400 text-xs mt-2">
                          {ticket.response.respondedAt && new Date(ticket.response.respondedAt).toLocaleString()}
                       </p>
                  </div>
               </div>
            </div>
        )}
      </div>

      {/* Status Messages */}
      <div className="mt-8">
        {ticket.status === 'resolved' && !ticket.response && (
             <div className="flex justify-center">
                 <span className="bg-green-100 text-green-800 text-sm px-4 py-1 rounded-full border border-green-200">
                    Ticket marked as Resolved
                 </span>
             </div>
        )}
        {ticket.status === 'closed' && (
             <div className="flex justify-center">
                 <span className="bg-gray-100 text-gray-800 text-sm px-4 py-1 rounded-full border border-gray-200">
                    This ticket is closed
                 </span>
             </div>
        )}
      </div>

    </div>
  );
};

export default SupportTicketDetailPage;
