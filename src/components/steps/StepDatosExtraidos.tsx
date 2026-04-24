'use client';

import { useState } from 'react';
import { DatosFactura } from '@/lib/calculadora';

interface Props {
  datos: DatosFactura;
  onConfirmar: (datos: DatosFactura) => void;
  onVolver: () => void;
}

function necesitaMasFacturas(datos: DatosFactura): boolean {
  return datos.distribuidora === 'EDENOR' && datos.historialKwh.length <= 1;
}

export default function StepDatosExtraidos({ datos, onConfirmar, onVolver }: Props) {
  const [datosEditados] = useState(datos);
  const pideMasFacturas = necesitaMasFacturas(datos);

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="text-center mb-6">
        <span className="text-4xl">✅</span>
        <h3 className="text-2xl font-bold text-rayo-oscuro mt-2">
          ¡Factura analizada!
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Verificá que los datos sean correctos
        </p>
      </div>

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

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          ⚡ Consumo eléctrico
        </h4>
        <div className="space-y-2">
          <DatoRow label="Consumo del período" value={`${datosEditados.consumoKwhPeriodo} kWh (${datosEditados.periodoDias} días)`} />
          <DatoRow label="Consumo mensual estimado" value={`${datosEditados.consumoKwhMensual} kWh`} highlight />
          {datosEditados.historialKwh.length > 1 && (
            <DatoRow label="Promedio últimos meses" value={`${datosEditados.consumoPromedioMensual} kWh`} highlight />
          )}
          <DatoRow label="Categoría" value={datosEditados.categoriaTarifaria} />
        </div>

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
                    <div className="w-full bg-rayo-celeste rounded-t transition-all" style={{ height: `${height}%`, minHeight: '4px' }} />
                    <span className="text-[9px] text-gray-400">{h.mes.split('/')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          💰 Tu factura
        </h4>
        <div className="space-y-2">
          <DatoRow label="Cargo fijo" value={`$${datosEditados.cargoFijoArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Cargo variable" value={`$${datosEditados.cargoVariableArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Impuestos y tasas" value={`$${datosEditados.impuestosArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Total factura" value={`$${datosEditados.totalFacturaArs.toLocaleString('es-AR')}`} highlight big />
          <DatoRow label="Precio por kWh" value={`$${datosEditados.precioKwhEfectivoArs.toLocaleString('es-AR')}`} />
          <DatoRow label="Subsidio" value={datosEditados.tieneSubsidio ? 'Sí' : 'No'} />
        </div>
      </div>

      {pideMasFacturas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>💡 Tip:</strong> Tu factura de Edenor solo muestra un período.
            Para un presupuesto más preciso, podrías subir 2-3 facturas de meses distintos.
          </p>
        </div>
      )}

      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-sky-800">
          <strong>📌 Importante:</strong> El cargo fijo (${datosEditados.cargoFijoArs.toLocaleString('es-AR')}) no se reduce con energía solar. El ahorro se calcula sobre el cargo variable.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onVolver} className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          ← Subir otra factura
        </button>
        <button onClick={() => onConfirmar(datosEditados)} className="flex-1 py-3 px-4 bg-rayo-celeste text-white rounded-xl hover:bg-rayo-celeste-oscuro transition-colors font-semibold text-sm shadow-lg hover:shadow-xl">
          Datos correctos ✓ Continuar
        </button>
      </div>
    </div>
  );
}

function DatoRow({ label, value, highlight, big }: { label: string; value: string; highlight?: boolean; big?: boolean; }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${big ? 'text-lg font-bold text-rayo-oscuro' : highlight ? 'text-rayo-oscuro font-semibold' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}
