// src/components/citizen/TicketsList.jsx
import { getStatusColor, getPriorityColor } from './utils/helpers';

const TicketsList = ({ tickets, onTicketClick, onCreateComplaint, filterStatus, backendUrl }) => {
  return (
    <div className="space-y-4">
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <div
            key={ticket._id}
            onClick={() => onTicketClick(ticket.ticketId)}
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {ticket.image && (
                <img
                  src={`${backendUrl}${ticket.image}`}
                  alt="Complaint"
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {ticket.ticketId}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {ticket.title}
                    </h3>
                  </div>
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {ticket.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {ticket.category}
                  </span>
                  {ticket.location && (
                    <span className="flex items-center gap-1 max-w-xs truncate">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ticket.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  {ticket.assignedTo && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ticket.assignedTo.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No complaints found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filterStatus === 'all' 
              ? 'Get started by submitting your first complaint'
              : 'No complaints in this category'}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={onCreateComplaint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Submit Complaint
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketsList;