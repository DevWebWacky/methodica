// AuthModal.jsx
// Handles user signup and login
// Appears as a popup modal over the main app

import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

function AuthModal({ onClose, onSuccess }) {

  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  })

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Check username is provided
        if (!formData.username) {
          setError('Please enter a username')
          setLoading(false)
          return
        }

        // Sign up with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (signUpError) throw signUpError

        // Get user IP address
        let ipAddress = 'Unknown'
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json')
          const ipData = await ipRes.json()
          ipAddress = ipData.ip
        } catch { }

        // Create profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: formData.username,
            email: formData.email,
            ip_address: ipAddress,
            is_pro: false,
          })

        if (profileError) throw profileError

        onSuccess(data.user)

      } else {
        // Login with Supabase Auth
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (loginError) throw loginError
        onSuccess(data.user)
      }

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Modal overlay
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80
    z-50 flex items-center justify-center px-4">

      {/* Modal card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8
      w-full max-w-md relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400
          hover:text-gray-600 text-2xl font-bold">
          x
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/auth-logo.png"
            alt="Methodica"
            className="h-10 object-contain mx-auto mb-3"
          />
          <h2 className="text-xl font-black text-slate-800">
            {mode === 'login' ? 'Welcome Back!!' : 'Join Methodica'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login'
              ? 'Sign in to access your saved recommendations'
              : 'Save your recommendations and chat history forever'
            }
          </p>
        </div>

        {/* Benefits banner for signup */}
        {mode === 'signup' && (
          <div className="bg-blue-50 border border-blue-200
          rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-blue-700 mb-2">
              Why create an account?
            </p>
            <div className="space-y-1">
              {[
                'Save all your recommendations forever',
                'Continue chat history anytime',
                'Access past analyses from any device',
                'completely free!!'
              ].map((benefit, i) => (
                <p key={i} className="text-xs text-blue-600">
                  ✅ {benefit}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Username field - signup only */}
        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-sm font-bold
            text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. paul_researcher"
              className="w-full border-2 border-gray-200
              rounded-xl px-4 py-3 text-sm focus:outline-none
              focus:border-blue-500 transition duration-200"
            />
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label className="block text-sm font-bold
          text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full border-2 border-gray-200
            rounded-xl px-4 py-3 text-sm focus:outline-none
            focus:border-blue-500 transition duration-200"
          />
        </div>

        {/* Password field */}
        <div className="mb-5">
          <label className="block text-sm font-bold
          text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="minimum 6 characters"
            className="w-full border-2 border-gray-200
            rounded-xl px-4 py-3 text-sm focus:outline-none
            focus:border-blue-500 transition duration-200"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200
          rounded-xl p-3 mb-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-700
          text-white font-black py-3 rounded-2xl text-sm
          transition-all duration-300 hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed mb-4">
          {loading
            ? 'Please wait...'
            : mode === 'login' ? 'Sign In' : 'Create Free Account'
          }
        </button>

        {/* Toggle mode */}
        <p className="text-center text-xs text-gray-500">
          {mode === 'login'
            ? "Don't have an account? "
            : "Already have an account? "
          }
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="text-blue-600 font-bold hover:underline">
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        {/* Guest note */}
        <p className="text-center text-xs text-gray-400 mt-3">
          Or{' '}
          <button
            onClick={onClose}
            className="underline hover:text-gray-600">
            continue as guest
          </button>
          {' '}— recommendations won't be saved
        </p>

      </div>
    </div>
  )
}

export default AuthModal