export default function Header() {
  return (
    <header className="bg-rayo-celeste text-white py-4 px-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo SVG recreado */}
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sol base (arco) */}
            <path d="M25 65 A30 30 0 0 1 75 65" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"/>
            {/* Rayo (parte derecha, amarillo) */}
            <path d="M65 65 L75 35 L60 50 L70 20" stroke="#F5B731" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Destello superior */}
            <line x1="50" y1="5" x2="50" y2="20" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            {/* Destello izquierdo superior */}
            <line x1="18" y1="25" x2="28" y2="35" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            {/* Destello izquierdo */}
            <line x1="5" y1="55" x2="20" y2="55" stroke="white" strokeWidth="7" strokeLinecap="round"/>
          </svg>
          <div>
            <h1 className="text-xl font-bold tracking-wider">
              RAYO <span className="font-light text-sm ml-1 text-rayo-amarillo">EXPRESS</span>
            </h1>
            <p className="text-xs text-white/70 font-light">
              Energía solar a la velocidad del rayo
            </p>
          </div>
        </div>
        <a
          href="https://www.rayo.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/60 hover:text-rayo-amarillo transition-colors"
        >
          rayo.ar
        </a>
      </div>
    </header>
  );
}
