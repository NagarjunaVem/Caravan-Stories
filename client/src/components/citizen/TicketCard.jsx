// src/components/citizen/TicketCard.jsx
import { getStatusColor } from './utils/helpers';

const TicketCard = ({ ticket, onClick, backendUrl }) => {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {ticket.ticketId}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
            {ticket.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {ticket.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {ticket.category}
            </span>
            {ticket.location && (
              <span className="flex items-center gap-1 truncate max-w-xs">
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
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {ticket.image && (
          <img
            src={`${backendUrl}${ticket.image}`}
            alt="Complaint"
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default TicketCard;