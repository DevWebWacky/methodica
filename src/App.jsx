import { useState, useEffect } from 'react'
import Header from './components/Header'
import LandingHero from './components/LandingHero'
import ResearchForm from './components/ResearchForm'
import SimilarStudies from './components/SimilarStudies'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ExportButton from './components/ExportButton'
import UserDashboard from './components/UserDashboard'
import { searchSimilarStudies } from './services/pubmedService'
import { trackSession, trackAnalysis } from './services/analyticsService'
import { supabase } from './services/supabaseClient'
import ChatPanel from './components/ChatPanel'


function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [studies, setStudies] = useState([])
  const [studiesLoading, setStudiesLoading] = useState(false)
  const [formData, setFormData] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [savedRecommendationId, setSavedRecommendationId] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  // Track session on first load
  useEffect(() => {
    trackSession()
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from database
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setUserProfile(data)
  }

  // Sign out function
  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  function handleDashboard() {
    setShowDashboard(true)
  }

  function handleCloseDashboard() {
    setShowDashboard(false)
  }

  function handleViewSavedRecommendation(rec) {
    setResults(rec.results)
    setFormData(rec.form_data)
    setSavedRecommendationId(rec.id)
    setStudies([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

    // Save to database if user is logged in
    if (user) {
      try {
        const { data: saved } = await supabase
          .from('recommendations')
          .insert({
            user_id: user.id,
            topic: submittedFormData.topic,
            field: submittedFormData.field,
            education_level: submittedFormData.educationLevel,
            form_data: submittedFormData,
            results: data,
          })
          .select()
          .single()

        if (saved) setSavedRecommendationId(saved.id)
      } catch (err) {
        console.error('Failed to save recommendation:', err)
      }
    }

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

    setTimeout(() => setShowFeedback(true), 30000)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <Header
        user={userProfile}
        onSignOut={handleSignOut}
        onDashboard={() => setShowDashboard(true)}
      />

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
          <p className="text-slate-400 text-xs mb-6">
  Complex research may take up to 60 seconds
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

          {/* Statistical Tests Card */}
<div className="bg-white rounded-3xl shadow-lg p-6 mb-6
border-l-4 border-pink-500 card-fade-in-4">
  <div className="flex items-center gap-2 mb-3">
    <span className="text-2xl">📐</span>
    <h3 className="text-lg font-black text-slate-800">
      Recommended Statistical Tests
    </h3>
  </div>
  <p className="text-xs text-gray-400 mb-4">
    Based on your objectives and hypotheses. Descriptive
    statistics are always included as the essential first step:
  </p>
  <div className="space-y-4">
    {results.statisticalTests.map((item, index) => (
      <div key={index} className={`rounded-2xl p-4 border
      ${item.isDescriptive
        ? 'bg-cyan-50 border-cyan-200'
        : 'bg-pink-50 border-pink-100'
      }`}>
        {item.isDescriptive && (
          <span className="text-xs font-bold text-cyan-600
          uppercase tracking-wider bg-cyan-100 px-2 py-1
          rounded-full mb-2 inline-block">
            Default First Step
          </span>
        )}
        <p className="text-xs font-bold uppercase tracking-wider
        mb-1 mt-1
        ${item.isDescriptive ? 'text-cyan-400' : 'text-pink-400'}">
          {item.isDescriptive ? 'Descriptive Statistics' : `Objective ${index}`}
        </p>
        <p className="text-xs text-gray-500 mb-2 italic">
          {item.objective}
        </p>
        <p className={`font-black text-lg mb-2
        ${item.isDescriptive ? 'text-cyan-700' : 'text-pink-700'}`}>
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
          {results.journals && 
results.journals.length > 0 && 
['PhD / Doctorate', 'Researcher / Academic']
.includes(formData?.educationLevel) && (
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

          {/* Chat Panel */}
          <ChatPanel
            results={results}
            formData={formData}
            user={user}
            recommendationId={savedRecommendationId}
          />

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

      {/* Feedback Popup */}
{showFeedback && (
  <div className="fixed bottom-6 right-6 z-50 max-w-sm
  bg-white rounded-3xl shadow-2xl border border-gray-100
  p-6 animate-bounce-once">

    {/* Close button */}
    <button
      onClick={() => setShowFeedback(false)}
      className="absolute top-3 right-4 text-gray-400
      hover:text-gray-600 text-xl font-bold">
      x
    </button>

    {/* Icon */}
    <div className="text-4xl mb-3">💬</div>

    {/* Message */}
    <h3 className="text-base font-black text-slate-800 mb-2">
      Enjoying Methodica?
    </h3>
    <p className="text-xs text-gray-500 leading-relaxed mb-4">
      Your feedback helps us improve Methodica for
      biomedical students and researchers worldwide.
      It takes less than 2 minutes! 🙏
    </p>

    {/* Buttons */}
    <div className="flex gap-3">
      
        <a href="https://forms.gle/27fcoWt1BtHfoDmn9"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowFeedback(false)}
        className="flex-1 bg-blue-600 hover:bg-blue-500
        text-white text-xs font-black py-2 rounded-xl
        text-center transition-all duration-300">
        Give Feedback
      </a>
      <button
        onClick={() => setShowFeedback(false)}
        className="flex-1 bg-gray-100 hover:bg-gray-200
        text-gray-600 text-xs font-bold py-2 rounded-xl
        transition-all duration-300">
        Maybe Later
      </button>
    </div>

  </div>
)}

      {/* User Dashboard */}
      {showDashboard && (
        <UserDashboard
          user={user}
          onViewRecommendation={handleViewSavedRecommendation}
          onClose={() => setShowDashboard(false)}
        />
      )}

    </div>

  )
}

export default App