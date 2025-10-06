import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function GlobalSummaryCharts() {
  const { ticketSummary, loadingSummary, error, refreshSummary } = useContext(AppContext);

  if (loadingSummary) {
    return (
      <div className="py-20 text-center text-gray-600 animate-pulse">
        Loading summary…
      </div>
    );
  }

  if (error || !ticketSummary) {
    return (
      <section className="py-30 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Global Ticket Summary</h2>
        <p className="text-gray-500 mb-6">{error || "No data found."}</p>
        <button
          onClick={refreshSummary}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </section>
    );
  }

  const {
    total = 0,
    pending = 0,
    open = 0,
    inProgress = 0,
    resolved = 0,
    closed = 0,
    reopened = 0,
    overdue = 0,
  } = ticketSummary;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Public Ticket Summary</h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Stat label="Total" value={total} color="bg-gray-800" />
          <Stat label="Pending" value={pending} color="bg-gray-400" />
          <Stat label="Open" value={open} color="bg-blue-500" />
          <Stat label="In Progress" value={inProgress} color="bg-yellow-500" />
          <Stat label="Resolved" value={resolved} color="bg-green-500" />
          <Stat label="Closed" value={closed} color="bg-gray-700" />
          <Stat label="Reopened" value={reopened} color="bg-red-500" />
          <Stat label="Overdue" value={overdue} color="bg-orange-600" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-1 mb-2">{value ?? 0}</div>
      <div className={`h-1 w-full rounded-full ${color}`}></div>
    </div>
  );
}
