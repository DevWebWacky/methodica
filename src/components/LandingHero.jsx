import { useState, useEffect } from 'react'

function LandingHero() {

  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)
  const [count3, setCount3] = useState(0)

  useEffect(() => {
    const timer1 = setInterval(() => {
      setCount1(prev => {
        if (prev >= 3) { clearInterval(timer1); return 3 }
        return prev + 1
      })
    }, 300)

    const timer2 = setInterval(() => {
      setCount2(prev => {
        if (prev >= 20) { clearInterval(timer2); return 20 }
        return prev + 1
      })
    }, 80)

    const timer3 = setInterval(() => {
      setCount3(prev => {
        if (prev >= 100) { clearInterval(timer3); return 100 }
        return prev + 2
      })
    }, 30)

    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
      clearInterval(timer3)
    }
  }, [])

  return (
    <section className="relative bg-slate-900 text-white 
    py-16 md:py-24 px-4 md:px-6 overflow-hidden">

      {/* Background circles */}
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96
      bg-slate-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72
      bg-blue-900 rounded-full opacity-20 animate-pulse"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center z-10">

        {/* Badge */}
        <div className="fade-slide-up inline-block bg-slate-800
        border border-slate-600 text-slate-300 text-xs font-semibold
        px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
          AI-Powered Research Assistant
        </div>

        {/* Headline — typewriter on desktop, static on mobile */}
        <div className="mb-6">
          {/* Mobile version — no typewriter */}
          <h2 className="block md:hidden text-2xl font-black 
          leading-tight text-white px-2">
            Design Your Research With Confidence
          </h2>
          {/* Desktop version — typewriter effect */}
          <div className="hidden md:flex justify-center">
            <h2 className="typewriter text-4xl font-black 
            leading-tight text-white">
              Design Your Research With Confidence
            </h2>
          </div>
        </div>

        {/* Subheadline */}
        <p className="fade-slide-up-delay-1 text-sm md:text-lg 
        text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed px-2">
          Not sure which study design, sampling technique, or sample
          size is right for your research? Methodica analyses your
          topic and gives you accurate, justified recommendations
          instantly.
        </p>

        {/* Who it's for */}
        <p className="fade-slide-up-delay-2 text-xs md:text-sm 
        text-slate-400 mb-8 md:mb-10 tracking-wide px-2">
          Built for undergraduate students, postgraduate researchers
          and biomedical scientists
        </p>

        {/* Animated Stats */}
        <div className="fade-slide-up-delay-3 flex justify-center
        gap-4 md:gap-10 mb-8 md:mb-10">
          <div className="text-center">
            <p className="text-2xl md:text-4xl font-black text-white">
              {count1}
            </p>
            <p className="text-xs text-slate-400 uppercase 
            tracking-wider mt-1">
              Key Outputs
            </p>
          </div>
          <div className="w-px bg-slate-700"></div>
          <div className="text-center">
            <p className="text-2xl md:text-4xl font-black text-white">
              {count2}+
            </p>
            <p className="text-xs text-slate-400 uppercase 
            tracking-wider mt-1">
              Fields
            </p>
          </div>
          <div className="w-px bg-slate-700"></div>
          <div className="text-center">
            <p className="text-2xl md:text-4xl font-black text-white">
              {count3}%
            </p>
            <p className="text-xs text-slate-400 uppercase 
            tracking-wider mt-1">
              Free
            </p>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="fade-slide-up-delay-4">
          
            <a href="#research-form"
            className="glow-pulse inline-block bg-blue-600
            hover:bg-blue-500 text-white font-black px-8 md:px-10
            py-3 md:py-4 rounded-full shadow-2xl text-base md:text-lg
            hover:scale-105 transition-all duration-300">
            Get Started
          </a>
        </div>

      </div>
    </section>
  )
}

export default LandingHero