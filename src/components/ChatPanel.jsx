// AI powered chat focused on the user's research
// and generated recommendations
// Guest users: session only (disappears on close)
// Logged in users: saved to database forever!!

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'

function ChatPanel({ results, formData, user, recommendationId }) {

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load saved chat history if user is logged in
  useEffect(() => {
    if (user && recommendationId) {
      loadChatHistory()
    }
  }, [user, recommendationId])

  async function loadChatHistory() {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('recommendation_id', recommendationId)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setMessages(data.map(msg => ({
          role: msg.role,
          content: msg.content
        })))
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  async function saveMessage(role, content) {
    if (!user || !recommendationId) return
    try {
      await supabase
        .from('chat_messages')
        .insert({
          recommendation_id: recommendationId,
          user_id: user.id,
          role,
          content,
        })
    } catch (err) {
      console.error('Failed to save message:', err)
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to chat
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(updatedMessages)

    // Save user message if logged in
    await saveMessage('user', userMessage)

    setLoading(true)

    try {
      // Build context from research details and recommendations
      const context = `
You are Methodica's AI research assistant. You are helping a 
${formData.educationLevel} student with their research.

Their Research Details:
- Topic: ${formData.topic}
- Field: ${formData.field}
- Objectives: ${formData.objectives}
- Hypotheses: ${formData.hypotheses || 'Not provided'}
- Study Nature: ${formData.studyNature}
- Study Direction: ${formData.studyDirection}
- Outcome Variable: ${formData.outcomeVariable}
- Target Population: ${formData.targetPopulation}
- Confidence Level: ${formData.confidenceLevel}%

Generated Recommendations:
- Study Design: ${results.studyDesign.recommendation}
- Sampling Technique: ${results.samplingTechnique.recommendation}
- Sample Size: n = ${results.sampleSize.recommendation}
- Statistical Tests: ${results.statisticalTests.map(t => t.test).join(', ')}

Previous conversation:
${updatedMessages.slice(0, -1).map(m =>
  `${m.role === 'user' ? 'Student' : 'Methodica'}: ${m.content}`
).join('\n')}

Student's new question: ${userMessage}

Instructions:
- Answer specifically based on their research context above
- Keep answers clear and appropriate for ${formData.educationLevel} level
- Be helpful, friendly and encouraging
- If asked about something unrelated to their research politely redirect
- Keep responses concise but thorough
`

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        })
      })

      const data = await response.json()
      const aiResponse = data.candidates[0].content.parts[0].text

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }])

      // Save AI response if logged in
      await saveMessage('assistant', aiResponse)

    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry I could not process that. Please try again!!'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Send on Enter key
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg mb-6
    border border-gray-100 overflow-hidden">

      {/* Chat Header */}
      <div className="bg-slate-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="text-white font-black text-sm">
              Methodica Research Assistant
            </h3>
            <p className="text-slate-400 text-xs">
              Ask me anything about your recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Session warning for guests */}
      {!user && (
        <div className="bg-yellow-50 border-b border-yellow-200
        px-4 py-2">
          <p className="text-xs text-yellow-700">
            ⚠️ <strong>Guest mode:</strong> This chat will disappear
            when you close or refresh the page.
            <button
              className="text-blue-600 font-bold ml-1 underline">
              Sign up free
            </button>
            {' '}to save your chat history forever!!
          </p>
        </div>
      )}

      {/* Saved indicator for logged in users */}
      {user && (
        <div className="bg-green-50 border-b border-green-200
        px-4 py-2">
          <p className="text-xs text-green-700">
            ✅ <strong>Chat is being saved</strong> to your account
            automatically!!
          </p>
        </div>
      )}

      {/* Messages area */}
      <div className="h-80 overflow-y-auto p-4 space-y-4
      bg-gray-50">

        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🔬</p>
            <p className="text-sm font-bold text-slate-700 mb-1">
              Hi!! I'm your Methodica Assistant
            </p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              I know everything about your research and recommendations.
              Ask me anything!!
            </p>
            {/* Suggested questions */}
            <div className="mt-4 space-y-2">
              {[
                'Why was this study design recommended?',
                'Can you explain the sample size formula?',
                'What does the statistical test measure?',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="block w-full text-left text-xs
                  bg-white border border-gray-200 rounded-xl
                  px-3 py-2 hover:border-blue-400
                  hover:bg-blue-50 transition-all duration-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex
          ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl
            px-4 py-3 text-sm leading-relaxed
            ${msg.role === 'user'
              ? 'bg-slate-900 text-white rounded-br-none'
              : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none
            px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full
                animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full
                animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full
                animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your recommendations..."
            rows={1}
            className="flex-1 border-2 border-gray-200
            rounded-xl px-4 py-2 text-sm focus:outline-none
            focus:border-slate-500 transition duration-200
            resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-slate-900 hover:bg-slate-700
            text-white font-bold px-4 py-2 rounded-xl
            transition-all duration-300 disabled:opacity-50
            disabled:cursor-not-allowed text-sm">
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

    </div>
  )
}

export default ChatPanel