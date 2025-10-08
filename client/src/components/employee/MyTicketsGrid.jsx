// src/components/employee/MyTicketsGrid.jsx
import TicketCard from './TicketCard';

const MyTicketsGrid = ({ tickets, onViewDetails, onReopen, onCreateTicket, backendUrl }) => {
  return (
    <>
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onViewDetails={onViewDetails}
              onReopen={onReopen}
              backendUrl={backendUrl}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't created any tickets yet
          </p>
          <button
            onClick={onCreateTicket}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Your First Ticket
          </button>
        </div>
      )}
    </>
  );
};

export default MyTicketsGrid;