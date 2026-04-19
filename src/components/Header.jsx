function Header() {
  return (
    <header className="bg-slate-900 text-white py-3 md:py-4
    px-4 md:px-6 shadow-xl sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center
      justify-between">

        {/* Logo */}
        <img
          src="/methodica-logo.png"
          alt="Methodica Logo"
          className="h-20 md:h-40 object-contain"
        />

        {/* Feedback Button */}
        
          <a href="https://forms.gle/27fcoWt1BtHfoDmn9"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-500
          text-white text-xs md:text-sm font-bold
          px-3 md:px-5 py-2 rounded-full
          transition-all duration-300 hover:scale-105
          shadow-lg whitespace-nowrap">
          💬 Give Feedback
        </a>

      </div>
    </header>
  )
}

export default Header