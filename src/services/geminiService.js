const API_KEY = import.meta.env.VITE_HF_API_KEY

const API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3'

export async function generateRecommendations(formData) {

  const prompt = `<s>[INST]
You are Methodica, an expert research methodology assistant
specializing in biomedical sciences.

STEP 1 — VALIDATION:
First, carefully validate the following inputs:
- Is the research topic genuinely related to biomedical sciences?
- Do the aims and objectives sound like real research objectives?
- Is the target population appropriate for biomedical research?
- Are the inputs coherent and meaningful not random text?

If ANY of these validations fail, return ONLY this JSON:
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
- Undergraduate: clear simple tools like Excel SPSS Jamovi
- Masters: more rigorous SPSS Jamovi R
- PhD: most sophisticated R Python advanced methods
- Researcher: publication ready R Python
- Recommend 3 data collection tools
- Always include 5 data management steps
- Always recommend descriptive statistics first
- Recommend 3 to 4 software tools
- Recommend 3 to 4 visualizations
- Recommend 4 to 5 journals mixing open access and paid
- At least 2 open access journals
- Be consistent and deterministic
- Return ONLY the JSON object nothing else
[/INST]`

  const maxRetries = 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 120000)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 4000,
            temperature: 0.1,
            return_full_text: false,
            do_sample: true,
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      console.log('HF Response:', data)

      // Handle model loading
      if (data.error && data.error.includes('loading')) {
        console.log('Model loading, waiting 20 seconds...')
        await new Promise(resolve => setTimeout(resolve, 20000))
        continue
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`)
      }

      // Extract generated text
      let text = data[0]?.generated_text || ''
      console.log('Raw text:', text)

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      const cleaned = jsonMatch[0].trim()
      const result = JSON.parse(cleaned)

      return result

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`Attempt ${attempt} timed out`)
        lastError = new Error('Request timed out')
      } else {
        console.error(`Attempt ${attempt} failed:`, err)
        lastError = err
      }

      if (attempt < maxRetries) {
        const waitTime = 5000 * attempt
        console.log(`Waiting ${waitTime / 1000}s before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}