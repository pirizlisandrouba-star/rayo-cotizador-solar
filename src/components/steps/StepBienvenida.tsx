'use client';

import { useState } from 'react';

interface Props {
  onComplete: (nombre: string, email: string, telefono: string) => void;
  onSkip: () => void;
}

export default function StepBienvenida({ onComplete, onSkip }: Props) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarEmail = (value: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errorEmail && validarEmail(value)) {
      setErrorEmail('');
    }
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) return;

    if (!validarEmail(email)) {
      setErrorEmail('Por favor ingresá un email válido');
      return;
    }

    setEnviando(true);
    onComplete(nombre.trim(), email.trim().toLowerCase(), telefono.trim());
  };

  const puedeContinuar = nombre.trim().length > 0 && email.trim().length > 0;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-5xl mb-3 block">☀️</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-rayo-oscuro mb-3">
          Descubrí cuánto podés <br />
          <span className="text-rayo-celeste">ahorrar con energía solar</span>
        </h2>
        <p className="text-rayo-gris-medio max-w-md mx-auto">
          En 60 segundos te mostramos un presupuesto personalizado.
          Dejanos tus datos para enviarte los resultados.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rayo-oscuro mb-1">Tu nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rayo-celeste focus:border-rayo-celeste outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rayo-oscuro mb-1">Tu email *</label>
            <input
              type="email"
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              placeholder="Ej: juan@gmail.com"
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                errorEmail
                  ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                  : 'border-gray-200 focus:ring-2 focus:ring-rayo-celeste focus:border-rayo-celeste'
              }`}
            />
            {errorEmail && <p className="text-red-500 text-xs mt-1">{errorEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-rayo-oscuro mb-1">
              Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: 11 2345-6789"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rayo-celeste focus:border-rayo-celeste outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!puedeContinuar || enviando}
          className={`w-full py-4 rounded-xl font-bold text-lg mt-6 transition-all shadow-lg ${
            puedeContinuar && !enviando
              ? 'bg-rayo-celeste text-white hover:bg-rayo-celeste-oscuro hover:shadow-xl active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {enviando ? '⏳ Un momento...' : '⚡ Comenzar cotización'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          🔒 Tus datos son privados. No enviamos spam.
        </p>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onSkip}
          className="text-xs text-gray-400 hover:text-gray-500 underline transition-colors"
        >
          Prefiero cotizar sin dejar mis datos
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-gray-400">
        <span>🤝 Cooperativa con Triple Impacto</span>
        <span>⚡ Cotización en 60 segundos</span>
        <span>📋 Sin compromiso</span>
      </div>
    </div>
  );
}
