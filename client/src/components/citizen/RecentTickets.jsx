// src/components/citizen/RecentTickets.jsx
import TicketCard from './TicketCard';

const RecentTickets = ({ tickets, onTicketClick, onCreateComplaint, backendUrl }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Complaints
        </h2>
      </div>
      
      <div className="p-6">
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onClick={() => onTicketClick(ticket.ticketId)}
                backendUrl={backendUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No complaints yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by submitting your first complaint
            </p>
            <button
              onClick={onCreateComplaint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Submit Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTickets;