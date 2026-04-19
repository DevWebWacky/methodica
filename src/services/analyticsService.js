// analyticsService.js
// Simple session analytics using localStorage
// No backend needed — stores data in the browser

const ANALYTICS_KEY = 'methodica_analytics'

// Get existing analytics data or start fresh
function getAnalytics() {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY)
    return data ? JSON.parse(data) : {
      totalAnalyses: 0,
      fields: {},
      studyDesigns: {},
      educationLevels: {},
      sessions: 0,
      lastVisit: null
    }
  } catch {
    return {
      totalAnalyses: 0,
      fields: {},
      studyDesigns: {},
      educationLevels: {},
      sessions: 0,
      lastVisit: null
    }
  }
}

// Save analytics data
function saveAnalytics(data) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Analytics save failed:', err)
  }
}

// Track a new session visit
export function trackSession() {
  const analytics = getAnalytics()
  analytics.sessions += 1
  analytics.lastVisit = new Date().toISOString()
  saveAnalytics(analytics)
}

// Track a completed analysis
export function trackAnalysis(formData, studyDesign) {
  const analytics = getAnalytics()

  // Increment total
  analytics.totalAnalyses += 1

  // Track fields
  const field = formData.field
  analytics.fields[field] = (analytics.fields[field] || 0) + 1

  // Track study designs
  const design = studyDesign
  analytics.studyDesigns[design] = (analytics.studyDesigns[design] || 0) + 1

  // Track education levels
  const level = formData.educationLevel
  analytics.educationLevels[level] = (analytics.educationLevels[level] || 0) + 1

  saveAnalytics(analytics)
}

// Get analytics summary
export function getAnalyticsSummary() {
  const analytics = getAnalytics()

  // Find most popular field
  const topField = Object.entries(analytics.fields)
    .sort((a, b) => b[1] - a[1])[0]

  // Find most popular design
  const topDesign = Object.entries(analytics.studyDesigns)
    .sort((a, b) => b[1] - a[1])[0]

  // Find most popular education level
  const topLevel = Object.entries(analytics.educationLevels)
    .sort((a, b) => b[1] - a[1])[0]

  return {
    totalAnalyses: analytics.totalAnalyses,
    sessions: analytics.sessions,
    topField: topField ? topField[0] : 'N/A',
    topDesign: topDesign ? topDesign[0] : 'N/A',
    topLevel: topLevel ? topLevel[0] : 'N/A',
    lastVisit: analytics.lastVisit
  }
}

// Reset analytics
export function resetAnalytics() {
  localStorage.removeItem(ANALYTICS_KEY)
}