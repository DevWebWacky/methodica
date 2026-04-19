import { useState, useEffect } from 'react'
import Header from './components/Header'
import LandingHero from './components/LandingHero'
import ResearchForm from './components/ResearchForm'
import SimilarStudies from './components/SimilarStudies'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ExportButton from './components/ExportButton'
import { searchSimilarStudies } from './services/pubmedService'
import { trackSession, trackAnalysis } from './services/analyticsService'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [studies, setStudies] = useState([])
  const [studiesLoading, setStudiesLoading] = useState(false)
  const [formData, setFormData] = useState(null)
  const [validationError, setValidationError] = useState(null)

  // Track session on first load
  useEffect(() => {
    trackSession()
  }, [])

  async function handleResults(data, submittedFormData) {

    // Handle invalid input
    if (!data.valid) {
      setValidationError(data)
      setResults(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Clear any previous validation error
    setValidationError(null)
    setResults(data)
    setFormData(submittedFormData)

    // Track this analysis
    trackAnalysis(submittedFormData, data.studyDesign.recommendation)

    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Fetch PubMed studies
    setStudiesLoading(true)
    try {
      const similarStudies = await searchSimilarStudies(
        submittedFormData.topic,
        submittedFormData.field
      )
      setStudies(similarStudies)
    } catch (err) {
      console.error('PubMed search failed:', err)
      setStudies([])
    } finally {
      setStudiesLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <Header />

      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-95
        z-50 flex flex-col items-center justify-center">
          <div className="text-6xl mb-6 animate-bounce">🔬</div>
          <h2 className="text-white text-2xl font-black mb-2">
            Analysing Your Research...
          </h2>
          <p className="text-slate-300 text-sm mb-6">
            Methodica is generating your recommendations
          </p>
          <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* Validation Error Screen */}
      {validationError && (
        <div className="max-w-3xl mx-auto py-16 px-6">
          <div className="bg-white rounded-3xl shadow-xl p-8
          border-l-4 border-red-500 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              Invalid Research Input
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {validationError.validationError}
            </p>
            <div className="bg-blue-50 border border-blue-200
            rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-blue-700 mb-1">
                💡 Suggestion:
              </p>
              <p className="text-sm text-blue-600">
                {validationError.suggestion}
              </p>
            </div>
            <button
              onClick={() => {
                setValidationError(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-slate-900 hover:bg-slate-700
              text-white font-black py-3 px-8 rounded-2xl
              transition-all duration-300 hover:scale-105">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !validationError && (
        <div className="max-w-3xl mx-auto py-16 px-6">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-2">
              Your Methodica Results
            </h2>
            <p className="text-gray-500 text-sm">
              Personalised recommendations based on your research details
            </p>
            {formData && (
              <span className="inline-block mt-2 bg-slate-100
              text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                {formData.educationLevel} Level
              </span>
            )}
          </div>

          {/* Study Design */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
          border-l-4 border-slate-700 card-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-black text-slate-800">
                Recommended Study Design
              </h3>
            </div>
            <p className="text-slate-700 font-bold text-xl mb-3">
              {results.studyDesign.recommendation}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {results.studyDesign.justification}
            </p>
          </div>

          {/* Sampling Technique */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
          border-l-4 border-teal-500 card-fade-in-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎲</span>
              <h3 className="text-lg font-black text-slate-800">
                Recommended Sampling Technique
              </h3>
            </div>
            <p className="text-teal-700 font-bold text-xl mb-3">
              {results.samplingTechnique.recommendation}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {results.samplingTechnique.justification}
            </p>
          </div>

          {/* Sample Size */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
          border-l-4 border-blue-500 card-fade-in-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔢</span>
              <h3 className="text-lg font-black text-slate-800">
                Recommended Sample Size
              </h3>
            </div>
            <p className="text-blue-700 font-bold text-xl mb-2">
              n = {results.sampleSize.recommendation}
            </p>
            <div className="bg-blue-50 rounded-xl p-3 mb-3">
              <p className="text-xs font-bold text-blue-700 mb-1">
                Formula Used:
              </p>
              <p className="text-sm text-blue-800 font-mono">
                {results.sampleSize.formula}
              </p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {results.sampleSize.justification}
            </p>
          </div>

          {/* Statistical Tests */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
          border-l-4 border-pink-500 card-fade-in-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📐</span>
              <h3 className="text-lg font-black text-slate-800">
                Recommended Statistical Tests
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Based on your objectives and hypotheses:
            </p>
            <div className="space-y-4">
              {results.statisticalTests.map((item, index) => (
                <div key={index} className="bg-pink-50 rounded-2xl p-4
                border border-pink-100">
                  <p className="text-xs font-bold text-pink-400
                  uppercase tracking-wider mb-1">
                    Objective {index + 1}
                  </p>
                  <p className="text-xs text-gray-500 mb-2 italic">
                    {item.objective}
                  </p>
                  <p className="text-pink-700 font-black text-lg mb-2">
                    {item.test}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {item.justification}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Collection */}
          {results.dataCollection && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
            border-l-4 border-orange-500 card-fade-in-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📋</span>
                <h3 className="text-lg font-black text-slate-800">
                  Data Collection Tools
                </h3>
              </div>

              {/* Collection Tools */}
              <div className="space-y-3 mb-6">
                {results.dataCollection.recommendedTools.map((tool, index) => (
                  <div key={index} className="flex items-start gap-3
                  p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <span className="text-lg">
                      {tool.free ? '🆓' : '💰'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {tool.tool}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tool.reason}
                      </p>
                    </div>
                    <span className={`ml-auto text-xs font-bold
                    px-2 py-1 rounded-full flex-shrink-0
                    ${tool.free
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                      {tool.free ? 'Free' : 'Paid'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Data Management Steps */}
              <h4 className="text-sm font-black text-slate-700 mb-3">
                Data Management Steps
              </h4>
              <div className="space-y-3">
                {results.dataCollection.dataManagementSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-900
                    text-white text-xs font-black flex items-center
                    justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descriptive Statistics */}
          {results.descriptiveStatistics && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
            border-l-4 border-cyan-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-black text-slate-800">
                  Descriptive Statistics
                </h3>
              </div>
              <div className="bg-cyan-50 rounded-xl p-3 mb-4
              border border-cyan-100">
                <p className="text-xs text-cyan-700 leading-relaxed">
                  {results.descriptiveStatistics.explanation}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {results.descriptiveStatistics.recommended.map((item, index) => (
                  <div key={index} className="flex items-start gap-3
                  p-3 bg-gray-50 rounded-xl">
                    <span className="text-cyan-500 font-black
                    text-sm flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.measure}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Software Recommendations */}
          {results.softwareRecommendations && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
            border-l-4 border-violet-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💻</span>
                <h3 className="text-lg font-black text-slate-800">
                  Recommended Software
                </h3>
              </div>
              <div className="space-y-3">
                {results.softwareRecommendations.map((item, index) => (
                  <div key={index} className="p-4 border-2
                  border-gray-100 rounded-xl hover:border-violet-300
                  hover:bg-violet-50 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-slate-800">
                        {item.software}
                      </p>
                      <span className={`text-xs font-bold px-2 py-1
                      rounded-full
                      ${item.free
                        ? 'bg-green-100 text-green-700'
                        : 'bg-violet-100 text-violet-700'
                      }`}>
                        {item.free ? 'Free' : 'Paid'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.purpose}
                    </p>
                    <p className="text-xs text-violet-600 font-semibold">
                      {item.levelSuitability}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualizations */}
          {results.visualizations && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
            border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-lg font-black text-slate-800">
                  Recommended Visualizations
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {results.visualizations.map((item, index) => (
                  <div key={index} className="p-4 bg-yellow-50
                  rounded-xl border border-yellow-100">
                    <p className="text-sm font-black text-yellow-700 mb-1">
                      {item.plot}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      For: {item.variable}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journals */}
          {results.journals && results.journals.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
            border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📰</span>
                <h3 className="text-lg font-black text-slate-800">
                  Recommended Journals
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Suitable journals for publishing this research:
              </p>
              <div className="space-y-3">
                {results.journals.map((journal, index) => (
                  <div key={index} className="p-4 border-2
                  border-gray-100 rounded-xl hover:border-blue-300
                  hover:bg-blue-50 transition-all duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-slate-800">
                        {journal.name}
                      </p>
                      <span className={`text-xs font-bold px-2 py-1
                      rounded-full flex-shrink-0
                      ${journal.type === 'Open Access'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {journal.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Impact Factor: {journal.impactFactor}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {journal.relevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Recommendations */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6
          border-l-4 border-teal-400">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg font-black text-slate-800">
                Additional Recommendations
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {results.additionalRecommendations}
            </p>
          </div>

          {/* Similar Studies */}
          <SimilarStudies
            studies={studies}
            loading={studiesLoading}
          />

          {/* Export Button */}
          <ExportButton
            results={results}
            studies={studies}
            formData={formData}
          />

          {/* Start New Research */}
          <button
            onClick={() => {
              setResults(null)
              setStudies([])
              setValidationError(null)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="w-full bg-slate-900 hover:bg-slate-700
            text-white font-black py-4 rounded-2xl text-lg shadow-xl
            hover:scale-105 transition-all duration-300">
            Start New Research
          </button>

        </div>
      )}

      {/* Landing page */}
      {!results && !validationError && (
        <>
          <LandingHero />
          <ResearchForm
            onResults={handleResults}
            setLoading={setLoading}
          />
          <AnalyticsDashboard />
        </>
      )}

    </div>
  )
}

export default App