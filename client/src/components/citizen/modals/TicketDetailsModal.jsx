// src/components/citizen/modals/TicketDetailsModal.jsx
import { getPriorityColor } from '../utils/helpers';
import StatusTimeline from '../StatusTImeline';

const TicketDetailsModal = ({ isOpen, onClose, ticket, onReopen, backendUrl }) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Complaint Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {ticket.ticketId}
              </p>
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
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Timeline */}
          <StatusTimeline currentStatus={ticket.status} />

          {/* Ticket Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.category}</p>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Priority</p>
              <p className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </p>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted On</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assigned To</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {ticket.assignedTo?.department || 'Not assigned yet'}
              </p>
            </div>
          </div>

          {/* Title and Description */}
          <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {ticket.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Location */}
          {ticket.location && (
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          {ticket.image && (
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Attached Image</p>
              <img
                src={`${backendUrl}${ticket.image}`}
                alt="Complaint"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Comments */}
          {ticket.comments && ticket.comments.length > 0 && (
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Updates & Comments
              </h4>
              <div className="space-y-4">
                {ticket.comments.map((comment, index) => (
                  <div key={index} className="border-l-2 border-indigo-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comment.user?.name || 'System'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reopen Button */}
          {['Resolved', 'Closed'].includes(ticket.status) && (
            <div className="border-t border-gray-200 dark:border-zinc-800 pt-4">
              <button
                onClick={() => onReopen(ticket.ticketId)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Reopen Complaint
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                Not satisfied with the resolution? Click to reopen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;