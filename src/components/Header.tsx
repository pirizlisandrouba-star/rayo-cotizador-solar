export default function Header() {
  return (
    <header className="bg-rayo-azul-oscuro text-white py-4 px-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-rayo-amarillo">RAYO</span> EXPRESS
            </h1>
            <p className="text-xs text-gray-300 font-light">
              Energía solar a la velocidad del rayo
            </p>
          </div>
        </div>
        <a
          href="https://www.rayo.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-rayo-amarillo transition-colors"
        >
          rayo.ar
        </a>
      </div>
    </header>
  );
}
