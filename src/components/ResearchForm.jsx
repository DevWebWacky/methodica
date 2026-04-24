// ResearchForm.jsx
// We import useState from React
// useState lets us store and track what the user types
import { useState } from 'react'

// We import our Gemini service
import { generateRecommendations } from '../services/geminiService'

// We receive two props from App.jsx:
// onResults - a function to send results up to App
// setLoading - a function to show/hide loading screen
function ResearchForm({ onResults, setLoading }) {

  // formData stores everything the user fills in
  // Each field starts empty
  const [formData, setFormData] = useState({
    topic: '',
    objectives: '',
    hypotheses: '',
    field: '',
    educationLevel: '',
    studyNature: '',
    studyDirection: '',
    outcomeVariable: '',
    targetPopulation: '',
    confidenceLevel: '95'
  })

  // error stores any validation error messages
  const [error, setError] = useState('')

  // This function runs every time the user types or selects something
  // It updates the matching field in formData
  function handleChange(e) {
    setFormData({
      ...formData,          // Keep all existing values
      [e.target.name]: e.target.value  // Update only the changed field
    })
  }

  // This function runs when the user clicks Generate Recommendations
  async function handleSubmit() {

    // Check all fields are filled in
    if (!formData.topic || !formData.objectives ||
    !formData.field || !formData.educationLevel ||
    !formData.studyNature || !formData.studyDirection ||
    !formData.outcomeVariable || !formData.targetPopulation) {
  setError('⚠️ Please fill in all fields before generating recommendations.')
  return
}

    // Clear any previous errors
    setError('')

    // Show loading screen
    setLoading(true)

    try {
      // Send form data to Gemini and wait for results
      const results = await generateRecommendations(formData)

      // Send results AND formData up to App.jsx
      onResults(results, formData)


    } catch (err) {
      setError('❌ Methodica could not connect to the AI service. This is usually temporary — please wait a moment and try again.')
    } finally {
      // Hide loading screen whether it succeeded or failed
      setLoading(false)
    }
  }

  return (
    <section id="research-form" className="py-10 md:py-16 px-4 md:px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            Tell Us About Your Research
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Fill in the details below and Methodica will generate 
            recommendations for your study.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 border border-gray-100">

          <div className="flex items-center gap-2 mb-8">
            <div className="h-1 flex-1 bg-slate-700 rounded-full"></div>
<span className="text-xs text-slate-700 font-bold uppercase tracking-widest">
  Research Details
</span>
<div className="h-1 flex-1 bg-slate-700 rounded-full"></div>
          </div>

          {/* ── FIELD 1: Research Topic ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Research Topic / Question 
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. Prevalence of Hepatitis B among blood donors"
              className="w-full border-2 border-gray-200 rounded-xl px-4 
              py-3 text-sm focus:outline-none focus:border-blue-500 
              transition duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* ── FIELD 2: Aims & Objectives ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Study Aims & Objectives 
              <span className="text-red-500"> *</span>
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-xl
            p-3 mb-2 text-xs text-blue-700">
              <strong>Tip:</strong> The more specific your objectives, 
              the more accurate your recommendations. Example: "1. To 
              determine the prevalence of malaria among children under 5. 
              2. To compare infection rates between rural and urban areas."
            </div>
            <textarea
              rows={4}
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="List your study aims and objectives here..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 
              py-3 text-sm focus:outline-none focus:border-blue-500 
              transition duration-200 bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          {/* ── FIELD 3: Hypotheses ── */}
<div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-1">
    Study Hypotheses 
    <span className="text-gray-400 font-normal"> (Optional but recommended)</span>
  </label>
  <div className="bg-purple-50 border border-purple-200 rounded-xl
  p-3 mb-2 text-xs text-purple-700">
    <strong>What is a hypothesis?</strong> A hypothesis is a 
    predictive statement about the expected relationship or difference 
    in your study. It helps determine the most appropriate statistical 
    test. Example: "H₀: There is no significant difference in HBsAg 
    prevalence between voluntary and replacement blood donors. 
    H₁: There is a significant difference in HBsAg prevalence 
    between voluntary and replacement blood donors."
  </div>
  <textarea
    rows={3}
    name="hypotheses"
    value={formData.hypotheses}
    onChange={handleChange}
    placeholder="State your null (H₀) and alternative (H₁) hypotheses here... (optional)"
    className="w-full border-2 border-gray-200 rounded-xl px-4 
    py-3 text-sm focus:outline-none focus:border-purple-500 
    transition duration-200 bg-gray-50 focus:bg-white resize-none"
  />
</div>

          {/* ── FIELD 4: Biomedical Field ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Biomedical Field 
              <span className="text-red-500"> *</span>
            </label>
            <select
              name="field"
              value={formData.field}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-xl 
              px-4 py-3 text-sm focus:outline-none focus:border-blue-500 
              transition duration-200 bg-gray-50 focus:bg-white">
              <option value="">-- Select your field --</option>
              <optgroup label="Clinical Sciences">
                <option>Clinical Medicine</option>
                <option>Surgery</option>
                <option>Paediatrics</option>
                <option>Obstetrics & Gynaecology</option>
                <option>Psychiatry & Mental Health</option>
              </optgroup>
              <optgroup label="Laboratory Sciences">
                <option>Medical Laboratory Science</option>
                <option>Haematology</option>
                <option>Medical Microbiology & Immunology</option>
                <option>Chemical Pathology</option>
                <option>Histopathology & Cytology</option>
                <option>Parasitology</option>
              </optgroup>
              <optgroup label="Public & Community Health">
                <option>Epidemiology</option>
                <option>Public Health</option>
                <option>Community Medicine</option>
                <option>Environmental Health</option>
                <option>Occupational Health</option>
              </optgroup>
              <optgroup label="Pharmacy & Therapeutics">
                <option>Pharmacology</option>
                <option>Pharmacy</option>
                <option>Pharmacognosy</option>
              </optgroup>
              <optgroup label="Biomedical & Basic Sciences">
                <option>Anatomy</option>
                <option>Physiology</option>
                <option>Biochemistry</option>
                <option>Genetics & Molecular Biology</option>
                <option>Neuroscience</option>
                <option>Biomedical Engineering</option>
              </optgroup>
              <optgroup label="Nursing & Allied Health">
                <option>Nursing</option>
                <option>Physiotherapy</option>
                <option>Nutrition & Dietetics</option>
                <option>Radiography & Medical Imaging</option>
              </optgroup>
            </select>
          </div>

          {/* ── FIELD: Education Level ── */}
<div className="mb-6">
  <label className="block text-sm font-bold text-gray-700 mb-2">
    Level of Education
    <span className="text-red-500"> *</span>
  </label>
  <div className="bg-slate-50 border border-slate-200 rounded-xl
  p-3 mb-3 text-xs text-slate-600">
    <strong>Why this matters:</strong> Your level of education
    determines the complexity of statistical analysis, study design,
    and methodology expected in your research. A PhD study is held
    to a higher methodological standard than an undergraduate project.
  </div>
  <div className="grid grid-cols-1 gap-3">
    {[
      {
        value: 'Undergraduate',
        desc: 'Final year projects and dissertations at bachelor degree level. Methodology is expected to be clear, appropriate and well justified but not overly complex.'
      },
      {
        value: 'Masters',
        desc: 'Postgraduate research at masters level. Expected to demonstrate deeper methodological understanding, more rigorous analysis and critical engagement with literature.'
      },
      {
        value: 'PhD / Doctorate',
        desc: 'Doctoral research. Expected to demonstrate the highest level of methodological rigour, originality, and contribution to knowledge in the field.'
      },
      {
        value: 'Researcher / Academic',
        desc: 'Independent or institutional research. Expected to meet the standards of peer reviewed publication and contribute meaningfully to the field.'
      }
    ].map((option) => (
      <div
        key={option.value}
        onClick={() => setFormData({ ...formData, educationLevel: option.value })}
        className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
        ${formData.educationLevel === option.value
          ? 'border-slate-700 bg-slate-50'
          : 'border-gray-200 hover:border-slate-400 hover:bg-gray-50'
        }`}>
        <div className="flex items-start gap-3">
          <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0
          flex items-center justify-center
          ${formData.educationLevel === option.value
            ? 'border-slate-700 bg-slate-700'
            : 'border-gray-400'
          }`}>
            {formData.educationLevel === option.value && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-800">
              {option.value}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {option.desc}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* ── FIELD 5: Study Nature ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Study Nature 
              <span className="text-red-500"> *</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'Experimental', desc: 'You actively intervene — for example, giving a drug to one group and a placebo to another. You control what happens. Best for testing cause and effect.' },
                { value: 'Observational', desc: 'You observe and record what is already happening without interfering. Best when it is unethical or impractical to intervene.' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, studyNature: option.value })}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
                  ${formData.studyNature === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0
                    flex items-center justify-center
                    ${formData.studyNature === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                    }`}>
                      {formData.studyNature === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {option.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FIELD 6: Study Direction ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Study Direction 
              <span className="text-red-500"> *</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'Prospective', desc: 'You follow participants forward in time from now into the future. Example: Recruiting 200 patients today and monitoring them for 6 months.' },
                { value: 'Retrospective', desc: 'You look backward at data that already exists. Example: Reviewing hospital records from the past 5 years.' },
                { value: 'Cross-sectional', desc: 'You collect data at one single point in time — like taking a snapshot. Good for measuring prevalence of a condition in a population.' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, studyDirection: option.value })}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
                  ${formData.studyDirection === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0
                    flex items-center justify-center
                    ${formData.studyDirection === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                    }`}>
                      {formData.studyDirection === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {option.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FIELD 7: Outcome Variable ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Outcome Variable Type 
              <span className="text-red-500"> *</span>
            </label>
            <div className="bg-yellow-50 border border-yellow-300 
            rounded-xl p-3 mb-3 text-xs text-yellow-700">
              <strong>Why this matters:</strong> Your outcome variable 
              type directly determines which sample size formula is used. 
              Selecting the wrong type will give you an inaccurate sample 
              size — affecting the validity of your entire study.
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'Continuous', desc: 'Your measurement can take any numerical value. Examples: blood pressure (120.5 mmHg), weight (68.3 kg), haemoglobin level.' },
                { value: 'Binary (Dichotomous)', desc: 'Your outcome has only two possible results — Yes/No, Positive/Negative, Dead/Alive, Infected/Not infected.' },
                { value: 'Categorical', desc: 'Your outcome falls into more than two groups. Example: Blood groups (A, B, AB, O), Disease severity (Mild, Moderate, Severe).' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, outcomeVariable: option.value })}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer
                  ${formData.outcomeVariable === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0
                    flex items-center justify-center
                    ${formData.outcomeVariable === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                    }`}>
                      {formData.outcomeVariable === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {option.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FIELD 8: Target Population ── */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Target Population 
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              name="targetPopulation"
              value={formData.targetPopulation}
              onChange={handleChange}
              placeholder="e.g. Adults aged 18-45 attending University Hospital"
              className="w-full border-2 border-gray-200 rounded-xl px-4 
              py-3 text-sm focus:outline-none focus:border-blue-500 
              transition duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* ── FIELD 9: Confidence Level ── */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Confidence Level 
              <span className="text-red-500"> *</span>
            </label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              How certain do you want your results to be? 
              <strong> 95% is the standard</strong> in most biomedical 
              research — meaning if you repeated the study 100 times, 
              95 of those results would be correct.
            </p>
            <select
              name="confidenceLevel"
              value={formData.confidenceLevel}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-xl 
              px-4 py-3 text-sm focus:outline-none focus:border-blue-500 
              transition duration-200 bg-gray-50 focus:bg-white">
              <option value="90">90% — Less strict</option>
              <option value="95">95% — Standard (Recommended)</option>
              <option value="99">99% — Very strict</option>
            </select>
          </div>

          {/* ── ERROR MESSAGE ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl 
            p-3 mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── SUBMIT BUTTON ── */}
          <button
  onClick={handleSubmit}
  className="w-full bg-slate-900 hover:bg-slate-700
  text-white font-black py-4 rounded-2xl text-lg shadow-xl
  glow-pulse hover:scale-105 transition-all duration-300 tracking-wide">
  🔬 Generate Recommendations
</button>

        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your data is never stored. Results are generated instantly.
        </p>

      </div>
    </section>
  )
}

export default ResearchForm