// SimilarStudies.jsx
// This component displays real published studies from PubMed
// that are similar to the user's research topic

function SimilarStudies({ studies, loading }) {

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
      border-l-4 border-teal-500">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-black text-blue-900">
            Similar Published Studies
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // Show message if no studies found
  if (!studies || studies.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
      border-l-4 border-teal-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📚</span>
          <h3 className="text-lg font-black text-blue-900">
            Similar Published Studies
          </h3>
        </div>
        <p className="text-gray-500 text-sm">
          No similar studies found for this topic on PubMed. 
          Try refining your research topic for better results.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
    border-l-4 border-teal-500">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📚</span>
        <h3 className="text-lg font-black text-blue-900">
          Similar Published Studies
        </h3>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Real studies from PubMed related to your research topic. 
        Click any title to read the full paper.
      </p>

      {/* Studies list */}
      <div className="space-y-3">
        {studies.map((study, index) => (
          <a
            key={study.id}
            href={study.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border-2 border-gray-100 rounded-xl
            hover:border-teal-400 hover:bg-teal-50
            transition-all duration-200 group"
          >
            {/* Study number and title */}
            <div className="flex items-start gap-3">
              <span className="text-teal-600 font-black text-sm 
              flex-shrink-0">
                #{index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 
                group-hover:text-teal-700 transition-colors leading-snug">
                  {study.title}
                </p>
                {/* Authors and journal */}
                <p className="text-xs text-gray-500 mt-1">
                  {study.authors}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-teal-600 font-semibold">
                    {study.journal}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">
                    {study.year}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-teal-500 
                  group-hover:underline">
                    View on PubMed →
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
        📌 These studies are retrieved from PubMed — a free database 
        of biomedical literature maintained by the US National Library 
        of Medicine. Study designs shown are extracted from abstracts.
      </p>

    </div>
  )
}

export default SimilarStudies