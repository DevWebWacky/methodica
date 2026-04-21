const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

export async function generateRecommendations(formData) {

  const prompt = `
You are Methodica, an expert research methodology assistant
specializing in biomedical sciences.

STEP 1 — VALIDATION:
First, carefully validate the following inputs:
- Is the research topic genuinely related to biomedical sciences?
- Do the aims and objectives sound like real research objectives?
- Is the target population appropriate for biomedical research?
- Are the inputs coherent and meaningful (not random text)?

If ANY of these validations fail, you MUST return ONLY this JSON:
{
  "valid": false,
  "validationError": "Clear explanation of why the input is invalid",
  "suggestion": "Specific advice on how to improve the input"
}

STEP 2 — RECOMMENDATIONS:
If all validations pass, return ONLY this JSON with no extra text
and no markdown backticks:
{
  "valid": true,
  "studyDesign": {
    "recommendation": "Name of recommended study design",
    "justification": "Detailed explanation appropriate for education level"
  },
  "samplingTechnique": {
    "recommendation": "Name of recommended sampling technique",
    "justification": "Detailed explanation appropriate for education level"
  },
  "sampleSize": {
    "recommendation": "Calculated sample size as a number only",
    "formula": "The specific formula used with values substituted",
    "justification": "Step by step explanation of the calculation"
  },
  "statisticalTests": [
    {
      "objective": "The specific aim or objective this test addresses",
      "test": "Name of the recommended statistical test",
      "justification": "Explanation appropriate for the education level"
    }
  ],
  "dataCollection": {
    "recommendedTools": [
      {
        "tool": "Tool name",
        "reason": "Why this tool is best for this study",
        "free": true
      }
    ],
    "dataManagementSteps": [
      {
        "step": 1,
        "title": "Step title",
        "description": "What to do in this step"
      }
    ]
  },
  "descriptiveStatistics": {
    "explanation": "Why descriptive statistics are important for this study",
    "recommended": [
      {
        "measure": "Name of descriptive measure",
        "reason": "Why this measure is appropriate"
      }
    ]
  },
  "softwareRecommendations": [
    {
      "software": "Software name",
      "purpose": "What to use it for in this study",
      "free": true,
      "levelSuitability": "Why it suits this education level"
    }
  ],
  "visualizations": [
    {
      "plot": "Name of plot or chart",
      "variable": "Which variable or objective it visualizes",
      "reason": "Why this is the best visualization"
    }
  ],
  "journals": [
    {
      "name": "Full journal name",
      "type": "Open Access or Paid",
      "impactFactor": "Impact factor or N/A",
      "relevance": "Why this journal suits this study"
    }
  ],
  "additionalRecommendations": "Methodological advice tailored to education level"
}

Research Details:
Topic: ${formData.topic}
Objectives: ${formData.objectives}
Hypotheses: ${formData.hypotheses || 'Not provided'}
Field: ${formData.field}
Education Level: ${formData.educationLevel}
Study Nature: ${formData.studyNature}
Study Direction: ${formData.studyDirection}
Outcome Variable: ${formData.outcomeVariable}
Target Population: ${formData.targetPopulation}
Confidence Level: ${formData.confidenceLevel}%

Important rules:
- Tailor ALL recommendations to the education level
- Undergraduate: clear, simple, practical tools like Excel, SPSS, Jamovi
- Masters: more rigorous, SPSS, Jamovi, R
- PhD: most sophisticated, R, Python, advanced methods
- Researcher: publication ready, R, Python
- Recommend 3 data collection tools appropriate for the study
- Always include 5 data management steps
- Always recommend descriptive statistics as default first step
- Recommend 3 to 4 software tools mixing free and paid
- Recommend 3 to 4 visualizations matching the data types
- Recommend 4 to 5 journals mixing open access and paid
- Include at least 2 open access journals
- Be consistent and deterministic
`

  const maxRetries = 4
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`)

      // ── INCREASED TIMEOUT ──
      // We use AbortController to set a 120 second timeout
      // This gives Gemini enough time to process large inputs
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 180000) // 120 seconds timeout

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal, // Attach timeout signal
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 65536,
          }
        })
      })

      // Clear timeout once response arrives
      clearTimeout(timeoutId)

      const data = await response.json()
      console.log('Response status:', response.status)

      // Handle overload — wait longer each retry
      if (response.status === 503 || response.status === 429) {
        const waitTime = 5000 * attempt
        console.log(`Overloaded, waiting ${waitTime/1000}s before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const text = data.candidates[0].content.parts[0].text
      const cleaned = text.replace(/```json|```/g, '').trim()
      const result = JSON.parse(cleaned)

      return result

    } catch (err) {
      // Handle timeout specifically
      if (err.name === 'AbortError') {
        console.log(`Attempt ${attempt} timed out — retrying...`)
        lastError = new Error('Request timed out — retrying')
      } else {
        console.error(`Attempt ${attempt} failed:`, err)
        lastError = err
      }

      // Wait before retrying — longer each time
      if (attempt < maxRetries) {
        const waitTime = 5000 * attempt
        console.log(`Waiting ${waitTime/1000}s before next attempt...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}