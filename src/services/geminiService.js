const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

export async function generateRecommendations(formData) {

  // Only include journals for Masters, PhD and Researchers
  const includeJournals = ['PhD / Doctorate', 'Researcher / Academic']
    .includes(formData.educationLevel)

  const journalInstruction = includeJournals ? `
  "journals": [
    {
      "name": "Full journal name",
      "type": "Open Access or Paid",
      "impactFactor": "Impact factor or N/A",
      "relevance": "Why this journal suits this study"
    }
  ],` : ''

  const prompt = `You are Methodica, an expert biomedical research methodology assistant.

VALIDATION: Check if the topic is genuinely biomedical research related.
If invalid return ONLY:
{"valid":false,"validationError":"reason","suggestion":"advice"}

If valid return ONLY this JSON:
{
  "valid": true,
  "studyDesign": {
    "recommendation": "study design name",
    "justification": "explanation for ${formData.educationLevel} level"
  },
  "samplingTechnique": {
    "recommendation": "sampling technique name",
    "justification": "explanation for ${formData.educationLevel} level"
  },
  "sampleSize": {
    "recommendation": "number only",
    "formula": "formula with values",
    "justification": "step by step calculation"
  },
  "statisticalTests": [
    {
      "objective": "objective this test addresses",
      "test": "statistical test name",
      "justification": "why this test is appropriate",
      "isDescriptive": false
    }
  ],
  "dataCollection": {
    "recommendedTools": [
      {"tool": "name", "reason": "why", "free": true}
    ],
    "dataManagementSteps": [
      {"step": 1, "title": "title", "description": "description"}
    ]
  },
  "softwareRecommendations": [
    {
      "software": "name",
      "purpose": "what for",
      "free": true,
      "levelSuitability": "why for this level"
    }
  ],
  "visualizations": [
    {
      "plot": "chart name",
      "variable": "what it shows",
      "reason": "why best"
    }
  ],
  ${journalInstruction}
  "additionalRecommendations": "tailored advice"
}

INPUT:
Topic: ${formData.topic}
Objectives: ${formData.objectives}
Hypotheses: ${formData.hypotheses || 'None'}
Field: ${formData.field}
Level: ${formData.educationLevel}
Nature: ${formData.studyNature}
Direction: ${formData.studyDirection}
Outcome: ${formData.outcomeVariable}
Population: ${formData.targetPopulation}
Confidence: ${formData.confidenceLevel}%

RULES:
- Always add descriptive statistics as the FIRST item in statisticalTests with isDescriptive:true
- Recommend 3 data collection tools
- Always include 5 data management steps
- Recommend 3 software tools
- Recommend 3 visualizations
${includeJournals ? '- Recommend 4 journals mixing open access and paid' : ''}
- Undergraduate and Masters: Excel SPSS Jamovi
- PhD Researcher: R Python
- Return ONLY the JSON nothing else`

  const maxRetries = 4
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 16384,
          }
        })
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (response.status === 503 || response.status === 429) {
        const wait = 5000 * attempt
        console.log(`Overloaded, waiting ${wait/1000}s...`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }

      if (!response.ok) throw new Error(`API Error: ${response.status}`)

      const text = data.candidates[0].content.parts[0].text
      const cleaned = text.replace(/```json|```/g, '').trim()
      return JSON.parse(cleaned)

    } catch (err) {
      if (err.name === 'AbortError') {
        lastError = new Error('Request timed out')
      } else {
        lastError = err
      }
      console.error(`Attempt ${attempt} failed:`, err)
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 5000 * attempt))
      }
    }
  }
  throw lastError
}