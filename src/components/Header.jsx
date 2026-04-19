function Header() {
  return (
    <header className="bg-slate-900 text-white py-4 px-6 
    shadow-xl sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col 
      items-center text-center">
        <h1 className="text-2xl font-black tracking-widest uppercase">
          🔬 Methodica
        </h1>
        <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase">
          Your intelligent research methodology assistant
        </p>
      </div>
    </header>
  )
}

export default Header