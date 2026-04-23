'use client';

import { useState, useEffect } from 'react';

const pasos = [
  { texto: 'Leyendo tu factura...', emoji: '📄', delay: 0 },
  { texto: 'Identificando distribuidora...', emoji: '🔍', delay: 800 },
  { texto: 'Extrayendo consumo eléctrico...', emoji: '⚡', delay: 1600 },
  { texto: 'Detectando datos del titular...', emoji: '👤', delay: 2400 },
  { texto: 'Analizando historial de consumo...', emoji: '📊', delay: 3200 },
  { texto: 'Calculando tu sistema solar ideal...', emoji: '☀️', delay: 4000 },
];

export default function ProcesamientoAnimation() {
  const [pasoActual, setPasoActual] = useState(0);

  useEffect(() => {
    const timers = pasos.map((_, idx) =>
      setTimeout(() => setPasoActual(idx), pasos[idx].delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
      <div className="text-6xl mb-6 animate-rayo-pulse">⚡</div>

      <h3 className="text-xl font-bold text-rayo-azul-oscuro mb-6">
        Analizando tu factura...
      </h3>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div
          className="bg-rayo-amarillo h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Pasos con animación */}
      <div className="space-y-3 text-left">
        {pasos.map((paso, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-500 ${
              idx <= pasoActual
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-4'
            }`}
          >
            <span className={idx < pasoActual ? 'text-green-500' : ''}>
              {idx < pasoActual ? '✅' : paso.emoji}
            </span>
            <span
              className={`text-sm ${
                idx <= pasoActual
                  ? 'text-rayo-azul-oscuro font-medium'
                  : 'text-gray-400'
              }`}
            >
              {paso.texto}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
