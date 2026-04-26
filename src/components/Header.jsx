import { useState } from 'react'
import AuthModal from './AuthModal'

function Header({ user, onSignOut }) {

  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <header className="bg-slate-900 text-white py-3 md:py-4
      px-4 md:px-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center
        justify-between">

          {/* Logo */}
          <img
            src="/methodica-logo.png"
            alt="Methodica Logo"
            className="h-12 md:h-16 object-contain"
          />

          {/* Right side buttons */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Feedback button */}
            
              <a href="https://forms.gle/27fcoWt1BtHfoDmn9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600
              text-white text-xs font-bold px-3 py-2
              rounded-full transition-all duration-300
              hidden md:block">
              💬 Feedback
            </a>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300
                hidden md:block">
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
                text-white text-xs md:text-sm font-bold
                px-3 md:px-5 py-2 rounded-full
                transition-all duration-300 hover:scale-105">
                Sign In / Register
              </button>
            )}

          </div>
        </div>
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