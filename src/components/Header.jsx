function Header() {
  return (
    <header className="bg-slate-900 text-white py-3 md:py-4
    px-4 md:px-6 shadow-xl sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center 
      justify-center gap-3">
        
        {/* Logo image */}
        <img
          src="/methodica-logo.png"
          alt="Methodica Logo"
          className="h-30 md:h-40 object-contain"
        />

      </div>
    </header>
  )
}

export default Header