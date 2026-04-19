// AnalyticsDashboard.jsx
// Shows simple session analytics at the bottom of the page
// Data is stored locally in the browser

import { getAnalyticsSummary } from '../services/analyticsService'

function AnalyticsDashboard() {
  const stats = getAnalyticsSummary()

  // Don't show if no analyses yet
  if (stats.totalAnalyses === 0) return null

  return (
    <section className="bg-slate-900 py-10 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            Session Analytics
          </p>
          <h3 className="text-lg font-black text-white mt-1">
            Your Methodica Usage
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue-400">
              {stats.totalAnalyses}
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
              Analyses Run
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-teal-400">
              {stats.sessions}
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
              Sessions
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 text-center col-span-2">
            <p className="text-sm font-black text-green-400 truncate">
              {stats.topField !== 'N/A' ? stats.topField : 'No data yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
              Top Field
            </p>
          </div>

        </div>

        {/* Extra stats */}
        {stats.topDesign !== 'N/A' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <p className="text-sm font-black text-purple-400 truncate">
                {stats.topDesign}
              </p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                Top Study Design
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <p className="text-sm font-black text-orange-400 truncate">
                {stats.topLevel}
              </p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                Top Education Level
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-4">
          Analytics are stored locally on your device only
        </p>

      </div>
    </section>
  )
}

export default AnalyticsDashboard