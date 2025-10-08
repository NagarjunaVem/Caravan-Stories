// src/components/employee/modals/TicketDetailsModal.jsx
import { useState } from 'react';
import { getCategoryIcon, getStatusColor, getPriorityColor } from '../utils/helpers';

const TicketDetailsModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  onAddComment, 
  onReopen,
  backendUrl 
}) => {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !ticket) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ticket Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {ticket.ticketId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {ticket.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {ticket.description}
              </p>
              
              {ticket.image && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attached Image
                  </p>
                  <img
                    src={`${backendUrl}${ticket.image}`}
                    alt="Ticket attachment"
                    className="rounded-lg border border-gray-200 dark:border-zinc-800 max-w-full"
                  />
                </div>
              )}
              
              {ticket.location && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📍 {ticket.location}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                  <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {ticket.category}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(ticket.dueDate).toLocaleDateString()}
                  </span>
                </div>
                
                {ticket.assignedTo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Assigned To</span>
                    <span className="text-gray-900 dark:text-white">
                      {ticket.assignedTo.name}
                    </span>
                  </div>
                )}
                
                {ticket.submittedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Submitted By</span>
                    <span className="text-gray-900 dark:text-white">
                      {ticket.submittedBy.name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {['Resolved', 'Closed'].includes(ticket.status) && (
                <button
                  onClick={() => {
                    const reason = prompt('Please provide a reason for reopening:');
                    if (reason) {
                      onReopen(ticket.ticketId, reason);
                    }
                  }}
                  className="w-full px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                >
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments & Updates
            </h3>
            
            {/* Add Comment */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or update..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
            
            {/* Comments List */}
            <div className="space-y-3">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No comments yet. Be the first to add one!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;