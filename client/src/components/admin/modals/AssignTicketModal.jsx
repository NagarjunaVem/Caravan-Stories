// src/components/admin/modals/AssignTicketModal.jsx
import { DEPARTMENTS } from '../utils/constants';

const AssignTicketModal = ({ isOpen, onClose, ticket, onAssign }) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assign Ticket
            </h2>
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
          <div className="mb-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ticket ID</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.ticketId}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{ticket.title}</p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select a department to assign this ticket:
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => onAssign(dept)}
                className="w-full text-left p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dept}
                  </span>
                  {ticket.category === dept && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                      Current Category
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;