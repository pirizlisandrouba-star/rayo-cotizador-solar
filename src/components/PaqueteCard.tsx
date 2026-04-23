'use client';

import { ResultadoPaquete } from '@/lib/calculadora';

interface Props {
  paquete: ResultadoPaquete;
  tipoInstalacion: 'on_grid' | 'hibrido';
  consumoMensual: number;
}

export default function PaqueteCard({ paquete, tipoInstalacion, consumoMensual }: Props) {
  const precio = tipoInstalacion === 'on_grid' ? paquete.precioOnGridUsd : paquete.precioHibridoUsd;
  const precioArs = tipoInstalacion === 'on_grid' ? paquete.precioOnGridArs : paquete.precioHibridoArs;
  const payback = tipoInstalacion === 'on_grid' ? paquete.paybackOnGridAnios : paquete.paybackHibridoAnios;

  const cobertura = paquete.porcentajeConsumoMensual;
  const coberturaColor =
    cobertura >= 100 ? 'text-green-600' :
    cobertura >= 70 ? 'text-blue-600' :
    'text-orange-500';

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 shadow-sm border-2 transition-all hover:shadow-lg ${
        paquete.esRecomendado
          ? 'border-rayo-amarillo ring-2 ring-rayo-amarillo/30 scale-[1.02]'
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      {/* Badge recomendado */}
      {paquete.esRecomendado && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-rayo-amarillo text-rayo-azul-oscuro text-xs font-bold px-3 py-1 rounded-full">
            ⭐ IDEAL PARA VOS
          </span>
        </div>
      )}

      {/* Nombre del paquete */}
      <div className="text-center mb-4 mt-1">
        <h3 className="text-lg font-bold text-rayo-azul-oscuro">{paquete.nombre}</h3>
        <p className="text-sm text-gray-500">
          {paquete.paneles} paneles · {paquete.potenciaKwp} kWp
        </p>
      </div>

      {/* Cobertura visual */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2">
          <span className={`text-3xl font-bold ${coberturaColor}`}>
            {cobertura}%
          </span>
          <span className="text-xs text-gray-400 text-left leading-tight">
            de tu consumo<br />cubierto
          </span>
        </div>
        {/* Mini progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all ${
              cobertura >= 100 ? 'bg-green-500' :
              cobertura >= 70 ? 'bg-blue-500' :
              'bg-orange-400'
            }`}
            style={{ width: `${Math.min(cobertura, 100)}%` }}
          />
        </div>
      </div>

      {/* Generación */}
      <div className="space-y-2 mb-4">
        <InfoRow
          label="Generás"
          value={`${paquete.generacionMensualKwh} kWh/mes`}
          icon="☀️"
        />
        <InfoRow
          label="Ahorrás"
          value={`$${paquete.ahorroMensualArs.toLocaleString('es-AR')}/mes`}
          icon="💰"
          highlight
        />
        <InfoRow
          label="Ahorro anual"
          value={`$${paquete.ahorroAnualArs.toLocaleString('es-AR')}`}
          icon="📊"
        />
        <InfoRow
          label="Payback"
          value={payback < 50 ? `~${payback} años` : 'Largo plazo'}
          icon="⏱️"
        />
        {paquete.excedente && (
          <InfoRow
            label="Excedente"
            value="Inyectás a la red → crédito"
            icon="🔌"
            highlight
          />
        )}
      </div>

      {/* Impacto ambiental */}
      <div className="bg-green-50 rounded-xl p-3 mb-4">
        <p className="text-xs font-medium text-green-800 mb-1">🌍 Tu impacto ambiental</p>
        <div className="flex justify-between text-xs text-green-700">
          <span>🌳 {paquete.arbolesEquivalentes} árboles/año</span>
          <span>{paquete.co2EvitadoAnualKg} kg CO₂</span>
        </div>
      </div>

      {/* Espacio requerido */}
      <p className="text-xs text-gray-400 text-center mb-4">
        Espacio en techo: ~{paquete.espacioTechoM2} m²
      </p>

      {/* Precio */}
      <div className="text-center bg-rayo-azul-oscuro rounded-xl p-4">
        <p className="text-xs text-gray-300 mb-1">
          {tipoInstalacion === 'on_grid' ? 'On Grid' : 'Híbrido'}
        </p>
        <p className="text-2xl font-bold text-rayo-amarillo">
          USD {precio.toLocaleString('en-US')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ~${precioArs.toLocaleString('es-AR')} ARS
        </p>
      </div>

      {/* CTA */}
      <a
        href={`https://wa.me/5491100000000?text=Hola!%20Me%20interesa%20el%20paquete%20${encodeURIComponent(paquete.nombre)}%20${tipoInstalacion === 'hibrido' ? 'Híbrido' : 'On%20Grid'}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center py-3 rounded-xl font-semibold text-sm mt-4 transition-all ${
          paquete.esRecomendado
            ? 'bg-rayo-amarillo text-rayo-azul-oscuro hover:bg-yellow-400 shadow-md'
            : 'bg-gray-100 text-rayo-azul-oscuro hover:bg-gray-200'
        }`}
      >
        {paquete.esRecomendado ? '⚡ ¡Quiero este paquete!' : 'Consultar'}
      </a>
    </div>
  );
}

function InfoRow({
  label, value, icon, highlight
}: {
  label: string; value: string; icon: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-600' : 'text-rayo-azul-oscuro'}`}>
        {value}
      </span>
    </div>
  );
}
