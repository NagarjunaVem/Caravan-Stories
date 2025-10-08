// src/components/citizen/StatusTimeline.jsx
import { getStatusSteps } from './utils/helpers';

const StatusTimeline = ({ currentStatus }) => {
  const steps = getStatusSteps(currentStatus);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Complaint Status
      </h3>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-zinc-700"></div>
        
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-start gap-4">
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-xl ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-400'
              }`}>
                {step.completed ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 pt-2">
                <h4 className={`font-semibold ${
                  step.current 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : step.completed 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.name}
                </h4>
                {step.current && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Currently at this stage
                  </p>
                )}
                {step.completed && !step.current && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Completed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;