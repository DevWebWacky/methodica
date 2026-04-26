// Shows all saved recommendations for logged in users
// They can view past analyses and continue chats

import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

function UserDashboard({ user, onViewRecommendation, onClose }) {

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  async function fetchRecommendations() {
    try {
      const { data } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRecommendations(data || [])
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteRecommendation(id) {
    try {
      await supabase
        .from('recommendations')
        .delete()
        .eq('id', id)
      setRecommendations(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80
    z-50 flex items-center justify-center px-4">

      <div className="bg-white rounded-3xl shadow-2xl
      w-full max-w-2xl max-h-[80vh] overflow-hidden relative">

        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center
        justify-between">
          <div>
            <h2 className="text-white font-black text-lg">
              My Research History
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              All your saved recommendations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white
            text-2xl font-bold transition-colors">
            x
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">

          {loading && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3 animate-bounce">🔬</div>
              <p className="text-gray-500 text-sm">
                Loading your research history...
              </p>
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 text-sm font-bold mb-1">
                No saved recommendations yet!!
              </p>
              <p className="text-gray-400 text-xs">
                Generate your first recommendation and
                it will appear here!!
              </p>
            </div>
          )}

          {!loading && recommendations.length > 0 && (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id}
                className="border-2 border-gray-100 rounded-2xl
                p-4 hover:border-slate-300 transition-all duration-200">

                  {/* Topic and date */}
                  <div className="flex items-start
                  justify-between gap-2 mb-2">
                    <p className="text-sm font-black text-slate-800
                    leading-snug flex-1">
                      {rec.topic}
                    </p>
                    <p className="text-xs text-gray-400
                    flex-shrink-0">
                      {new Date(rec.created_at)
                        .toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-slate-100
                    text-slate-600 px-2 py-1 rounded-full font-semibold">
                      {rec.field}
                    </span>
                    <span className="text-xs bg-blue-100
                    text-blue-600 px-2 py-1 rounded-full font-semibold">
                      {rec.education_level}
                    </span>
                    {rec.results?.studyDesign?.recommendation && (
                      <span className="text-xs bg-green-100
                      text-green-600 px-2 py-1 rounded-full font-semibold">
                        {rec.results.studyDesign.recommendation}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onViewRecommendation(rec)
                        onClose()
                      }}
                      className="flex-1 bg-slate-900
                      hover:bg-slate-700 text-white text-xs
                      font-bold py-2 rounded-xl
                      transition-all duration-200">
                      View & Continue Chat
                    </button>
                    <button
                      onClick={() => deleteRecommendation(rec.id)}
                      className="bg-red-50 hover:bg-red-100
                      text-red-500 text-xs font-bold px-3 py-2
                      rounded-xl transition-all duration-200">
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default UserDashboard