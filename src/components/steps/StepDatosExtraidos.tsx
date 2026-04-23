'use client';

import { useState } from 'react';
import { DatosFactura } from '@/lib/calculadora';
import { necesitaMasFacturas } from '@/lib/facturaParser';

interface Props {
  datos: DatosFactura;
  onConfirmar: (datos: DatosFactura) => void;
  onVolver: () => void;
}

export default function StepDatosExtraidos({ datos, onConfirmar, onVolver }: Props) {
  const [editando, setEditando] = useState(false);
  const [datosEditados, setDatosEditados] = useState(datos);
  const pideMasFacturas = necesitaMasFacturas(datos);

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="text-center mb-6">
        <span className="text-4xl">✅</span>
        <h3 className="text-2xl font-bold text-rayo-azul-oscuro mt-2">
          ¡Factura analizada!
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Verificá que los datos sean correctos
        </p>
      </div>

      {/* Datos del cliente */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          👤 Datos del titular
        </h4>
        <div className="space-y-2">
          <DatoRow label="Nombre" value={datosEditados.titular} />
          <DatoRow label="Dirección" value={`${datosEditados.direccion}, ${datosEditados.localidad}`} />
          <DatoRow label="Partido" value={datosEditados.partido} />
          <DatoRow label="Distribuidora" value={datosEditados.distribuidora} highlight />
        </div>
      </div>

      {/* Datos de consumo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          ⚡ Consumo eléctrico
        </h4>
        <div className="space-y-2">
          <DatoRow
            label="Consumo del período"
            value={`${datosEditados.consumoKwhPeriodo} kWh (${datosEditados.periodoDias} días)`}
          />
          <DatoRow
            label="Consumo mensual estimado"
            value={`${datosEditados.consumoKwhMensual} kWh`}
            highlight
          />
          {datosEditados.historialKwh.length > 1 && (
            <DatoRow
              label="Promedio 6 meses"
              value={`${datosEditados.consumoPromedioMensual} kWh`}
              highlight
            />
          )}
          <DatoRow label="Categoría" value={datosEditados.categoriaTarifaria} />
        </div>

        {/* Mini gráfico historial */}
        {datosEditados.historialKwh.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Historial de consumo</p>
            <div className="flex items-end gap-1.5 h-20">
              {datosEditados.historialKwh.map((h, i) => {
                const max = Math.max(...datosEditados.historialKwh.map(x => x.kwh));
                const height = max > 0 ? (h.kwh / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">{h.kwh}</span>
                    <div
                      className="w-full bg-rayo-azul-medio rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <span className="text-[9px] text-gray-400">
                      {h.mes.split('/')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Datos económicos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          💰 Tu factura
        </h4>
        <div className="space-y-2">
          <DatoRow label="Cargo fijo" value={`$${datosEditados.cargoFijoArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Cargo variable (energía)" value={`$${datosEditados.cargoVariableArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Impuestos y tasas" value={`$${datosEditados.impuestosArs.toLocaleString('es-AR')}`} />
          <DatoRow
            label="Total factura"
            value={`$${datosEditados.totalFacturaArs.toLocaleString('es-AR')}`}
            highlight
            big
          />
          <DatoRow
            label="Precio por kWh"
            value={`$${datosEditados.precioKwhEfectivoArs.toLocaleString('es-AR')}`}
          />
          <DatoRow
            label="Subsidio"
            value={datosEditados.tieneSubsidio ? 'Sí' : 'No'}
          />
        </div>
      </div>

      {/* Alerta Edenor: pedir más facturas */}
      {pideMasFacturas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Tu factura de Edenor solo muestra un período.
            Para un presupuesto más preciso, podrías subir 2-3 facturas de meses
            distintos. Pero no te preocupes, ¡podemos avanzar con esta!
          </p>
        </div>
      )}

      {/* Cargo fijo warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>📌 Importante:</strong> El cargo fijo ($
          {datosEditados.cargoFijoArs.toLocaleString('es-AR')}) no se reduce con
          energía solar. El ahorro se calcula sobre el cargo variable.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={onVolver}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-xl
                     hover:bg-gray-50 transition-colors text-sm"
        >
          ← Subir otra factura
        </button>
        <button
          onClick={() => onConfirmar(datosEditados)}
          className="flex-1 py-3 px-4 bg-rayo-azul-oscuro text-rayo-amarillo rounded-xl
                     hover:bg-rayo-azul-medio transition-colors font-semibold text-sm
                     shadow-lg hover:shadow-xl"
        >
          Datos correctos ✓ Continuar
        </button>
      </div>
    </div>
  );
}

function DatoRow({
  label, value, highlight, big
}: {
  label: string; value: string; highlight?: boolean; big?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium ${
          big
            ? 'text-lg font-bold text-rayo-azul-oscuro'
            : highlight
            ? 'text-rayo-azul-oscuro font-semibold'
            : 'text-gray-700'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
