'use client';

import { useState } from 'react';
import { ResultadoCotizacion } from '@/lib/calculadora';
import PaqueteCard from './PaqueteCard';

interface Props {
  resultado: ResultadoCotizacion;
  onNuevaCotizacion: () => void;
}

export default function Resultado({ resultado, onNuevaCotizacion }: Props) {
  const [tipoInstalacion, setTipoInstalacion] = useState<'on_grid' | 'hibrido'>('on_grid');

  const { datosCliente, consumo, paquetes } = resultado;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-5xl mb-3 block">☀️</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-rayo-oscuro">
          {datosCliente.nombre !== 'Cliente'
            ? `${datosCliente.nombre.split(' ')[0]}, tu casa puede generar su propia energía`
            : 'Tu hogar puede generar su propia energía'
          }
        </h2>
        {datosCliente.localidad && (
          <p className="text-gray-500 mt-2">
            📍 {datosCliente.localidad} · {datosCliente.distribuidora}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 max-w-md mx-auto">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Tu situación actual
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-rayo-oscuro">
              {consumo.promedioMensualKwh || consumo.mensualKwh}
              <span className="text-sm font-normal text-gray-400"> kWh/mes</span>
            </p>
            <p className="text-xs text-gray-500">Consumo promedio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rayo-oscuro">
              ${consumo.facturaActualArs.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-500">Tu última factura</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl p-1 shadow-sm inline-flex">
          <button
            onClick={() => setTipoInstalacion('on_grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tipoInstalacion === 'on_grid'
                ? 'bg-rayo-celeste text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚡ On Grid
          </button>
          <button
            onClick={() => setTipoInstalacion('hibrido')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tipoInstalacion === 'hibrido'
                ? 'bg-rayo-celeste text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔋 Híbrido
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mb-4">
        {tipoInstalacion === 'on_grid'
          ? 'Conectado a la red — inyectás el excedente y generás crédito'
          : 'Con baterías — independencia energética + respaldo ante cortes'
        }
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {paquetes.map((paq) => (
          <PaqueteCard
            key={paq.id}
            paquete={paq}
            tipoInstalacion={tipoInstalacion}
            consumoMensual={consumo.promedioMensualKwh || consumo.mensualKwh}
          />
        ))}
      </div>

      <div className="bg-rayo-celeste rounded-2xl p-6 text-white mb-8">
        <h4 className="text-rayo-amarillo font-bold text-center mb-4">
          🤝 Triple Impacto — Cada instalación Rayo genera
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-2xl">💰</span>
            <p className="text-xs mt-1 text-white/70">Económico</p>
            <p className="text-sm font-medium mt-1">Ahorro real en tu factura</p>
          </div>
          <div>
            <span className="text-2xl">🌍</span>
            <p className="text-xs mt-1 text-white/70">Ambiental</p>
            <p className="text-sm font-medium mt-1">Energía limpia, menos CO₂</p>
          </div>
          <div>
            <span className="text-2xl">🤝</span>
            <p className="text-xs mt-1 text-white/70">Social</p>
            <p className="text-sm font-medium mt-1">Trabajo cooperativo local</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
        <h4 className="font-bold text-rayo-oscuro mb-2">
          📈 Protección contra aumentos tarifarios
        </h4>
        <p className="text-sm text-gray-600">
          Las tarifas eléctricas en Argentina han aumentado significativamente.
          Con energía solar, cada aumento de tarifa{' '}
          <strong>mejora tu inversión</strong> porque el kWh que generás
          vale más. Tu sistema produce energía a costo fijo durante 25 años.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h4 className="text-center font-bold text-rayo-oscuro mb-4">
          ¿Te interesa? Contactanos sin compromiso
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://wa.me/5491100000000?text=Hola!%20Quiero%20más%20info%20sobre%20energía%20solar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white
                       rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            💬 WhatsApp
          </a>
          <a
            href="mailto:info@rayo.ar?subject=Consulta%20Cotizador%20Solar"
            className="flex items-center justify-center gap-2 py-3 bg-rayo-celeste text-white
                       rounded-xl font-semibold hover:bg-rayo-celeste-oscuro transition-colors"
          >
            📧 info@rayo.ar
          </a>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Respuesta en menos de 2 horas · Sin compromiso
        </p>
      </div>

      <div className="text-center space-y-4">
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          * Los valores son estimativos y pueden variar según las condiciones
          específicas de cada instalación. Precios en USD al tipo de cambio
          oficial BNA vendedor. IVA incluido. Válido para AMBA.
        </p>
        <button
          onClick={onNuevaCotizacion}
          className="text-sm text-rayo-celeste hover:text-rayo-celeste-oscuro
                     underline transition-colors"
        >
          ← Hacer otra cotización
        </button>
      </div>
    </div>
  );
}
