import { useState } from 'react'
import AuthModal from './AuthModal'

function Header({ user, onSignOut, onDashboard }) {

  const [showAuth, setShowAuth] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <header className="bg-slate-900 text-white py-3 md:py-4
      px-4 md:px-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center
        justify-between">

          {/* Logo */}
          <a href="https://methodica-beta.vercel.app/">
            <img
              src="/methodica-logo.png"
              alt="Methodica Logo"
              className="h-12 md:h-16 object-contain"
            />
          </a>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">

            {/* Feedback button */}
            
              <a href="https://forms.gle/27fcoWt1BtHfoDmn9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600
              text-white text-xs font-bold px-3 py-2
              rounded-full transition-all duration-300">
              💬 Feedback
            </a>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onDashboard}
                  className="bg-slate-700 hover:bg-slate-600
                  text-white text-xs font-bold px-3 py-2
                  rounded-full transition-all duration-300">
                  📂 My Research
                </button>
                <span className="text-xs text-slate-300">
                  👋 {user.username || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  className="bg-slate-700 hover:bg-slate-600
                  text-white text-xs font-bold px-3 py-2
                  rounded-full transition-all duration-300">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 hover:bg-blue-500
                text-white text-sm font-bold px-5 py-2
                rounded-full transition-all duration-300
                hover:scale-105">
                Sign In / Register
              </button>
            )}

          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex flex-col gap-1.5
            p-2 rounded-lg hover:bg-slate-700
            transition-all duration-200">
            <span className={`block w-6 h-0.5 bg-white
            transition-all duration-300
            ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}>
            </span>
            <span className={`block w-6 h-0.5 bg-white
            transition-all duration-300
            ${showMobileMenu ? 'opacity-0' : ''}`}>
            </span>
            <span className={`block w-6 h-0.5 bg-white
            transition-all duration-300
            ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}>
            </span>
          </button>

        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden mt-3 pb-3 border-t
          border-slate-700 pt-3 space-y-2">

            {/* User greeting */}
            {user && (
              <p className="text-xs text-slate-300 px-2 pb-1">
                👋 {user.username || user.email?.split('@')[0]}
              </p>
            )}

            {/* My Research */}
            {user && (
              <button
                onClick={() => {
                  onDashboard()
                  setShowMobileMenu(false)
                }}
                className="w-full text-left bg-slate-700
                hover:bg-slate-600 text-white text-sm
                font-bold px-4 py-3 rounded-xl
                transition-all duration-200">
                📂 My Research
              </button>
            )}

            {/* Feedback */}
            
              <a href="https://forms.gle/27fcoWt1BtHfoDmn9"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMobileMenu(false)}
              className="block bg-slate-700 hover:bg-slate-600
              text-white text-sm font-bold px-4 py-3
              rounded-xl transition-all duration-200">
              💬 Give Feedback
            </a>

            {/* Sign In or Sign Out */}
            {user ? (
              <button
                onClick={() => {
                  onSignOut()
                  setShowMobileMenu(false)
                }}
                className="w-full text-left bg-red-900
                hover:bg-red-800 text-white text-sm
                font-bold px-4 py-3 rounded-xl
                transition-all duration-200">
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAuth(true)
                  setShowMobileMenu(false)
                }}
                className="w-full text-left bg-blue-600
                hover:bg-blue-500 text-white text-sm
                font-bold px-4 py-3 rounded-xl
                transition-all duration-200">
                Sign In / Register
              </button>
            )}

          </div>
        )}

      </header>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(user) => {
            setShowAuth(false)
          }}
        />
      )}
    </>
  )
}

export default Header