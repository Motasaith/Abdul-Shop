import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import contactService, { ContactSubmission } from '../../services/contactService';
import { toast } from 'react-hot-toast';

const AdminSupportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const { data } = await contactService.getContact(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket');
      navigate('/admin/support');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      setStatusUpdating(true);
      await contactService.updateContactStatus(ticket._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchTicket(ticket._id);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyMessage.trim()) return;

    try {
      setSubmitting(true);
      await contactService.respondToContact(ticket._id, replyMessage);
      toast.success('Reply sent successfully');
      setReplyMessage('');
      fetchTicket(ticket._id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/support" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </Link>

        {/* Header Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ticket.subject === 'order' ? `Order #${ticket.orderNumber}` : ticket.subject}
                </h1>
                <span className={`uppercase px-2 py-0.5 rounded text-xs font-bold ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Ticket #{ticket._id} • Created {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="border border-gray-300 rounded-md shadow-sm h-9 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Info & Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 transition-colors duration-200">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Query</h3>
          </div>
          <div className="p-6">
             <div className="flex items-start mb-6">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                   {ticket.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{ticket.email} {ticket.phone && `• ${ticket.phone}`}</div>
                </div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
               {ticket.message}
             </div>
          </div>
        </div>

        {/* Admin Response Section */}
        {ticket.response ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-l-4 border-blue-500 mb-6 transition-colors duration-200">
            <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300">Admin Response</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">Responded at {new Date(ticket.response.respondedAt).toLocaleString()}</p>
            </div>
            <div className="p-6">
              <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{ticket.response.message}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send Reply</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleReply}>
                <div className="mb-4">
                  <label htmlFor="reply" className="sr-only">Reply</label>
                  <textarea
                    id="reply"
                    rows={6}
                    className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Type your response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Reply & Resolve'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportDetailPage;
