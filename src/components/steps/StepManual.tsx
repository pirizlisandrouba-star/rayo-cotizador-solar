'use client';

import { useState } from 'react';
import { DatosFactura, DatosTecho } from '@/lib/calculadora';

interface Props {
  onComplete: (datos: DatosFactura, techo: DatosTecho) => void;
  onVolver: () => void;
}

export default function StepManual({ onComplete, onVolver }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    localidad: '',
    distribuidora: 'EDESUR' as 'EDENOR' | 'EDESUR' | 'OTRA',
    consumoKwh: '',
    montoFactura: '',
    tipoPropiedad: '' as DatosTecho['tipoPropiedad'] | '',
    materialTecho: '' as DatosTecho['materialTecho'] | '',
    orientacion: 'no_se' as DatosTecho['orientacion'],
  });

  const preciosKwhRef: Record<string, number> = {
    EDENOR: 56,
    EDESUR: 132,
    OTRA: 90,
  };

  const handleSubmit = () => {
    const precioKwh = preciosKwhRef[form.distribuidora];
    let consumo = parseInt(form.consumoKwh) || 0;

    // Si no puso kWh pero sí monto, estimamos
    if (!consumo && form.montoFactura) {
      const monto = parseInt(form.montoFactura);
      consumo = Math.round((monto * 0.65) / precioKwh); // ~65% es cargo variable
    }

    const datosFactura: DatosFactura = {
      distribuidora: form.distribuidora,
      titular: form.nombre || 'Cliente',
      direccion: '',
      localidad: form.localidad,
      partido: '',
      codigoPostal: '',
      cuit: '',
      numeroCliente: '',
      numeroSuministro: '',
      numeroMedidor: '',
      categoriaTarifaria: 'T1-R',
      consumoKwhPeriodo: consumo,
      periodoDias: 30,
      consumoKwhMensual: consumo,
      consumoPromedioMensual: consumo,
      historialKwh: [],
      cargoFijoArs: 1500,
      cargoVariableArs: consumo * precioKwh,
      impuestosArs: consumo * precioKwh * 0.3,
      totalFacturaArs: parseInt(form.montoFactura) || consumo * precioKwh * 1.5,
      precioKwhEfectivoArs: precioKwh,
      tieneSubsidio: false,
    };

    const datosTecho: DatosTecho = {
      tipoPropiedad: (form.tipoPropiedad || 'casa') as DatosTecho['tipoPropiedad'],
      materialTecho: (form.materialTecho || 'losa') as DatosTecho['materialTecho'],
      orientacion: form.orientacion,
    };

    onComplete(datosFactura, datosTecho);
  };

  const puedeContinuar =
    form.localidad &&
    (form.consumoKwh || form.montoFactura) &&
    form.tipoPropiedad &&
    form.materialTecho;

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-rayo-azul-oscuro">
          Ingresá tus datos
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Completá lo que puedas, nosotros estimamos el resto
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        {/* Nombre (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu nombre <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-rayo-amarillo focus:border-rayo-amarillo outline-none"
          />
        </div>

        {/* Localidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localidad / Partido *
          </label>
          <input
            type="text"
            value={form.localidad}
            onChange={e => setForm({ ...form, localidad: e.target.value })}
            placeholder="Ej: Lomas de Zamora, Palermo, etc."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-rayo-amarillo focus:border-rayo-amarillo outline-none"
          />
        </div>

        {/* Distribuidora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distribuidora
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['EDENOR', 'EDESUR'] as const).map(d => (
              <button
                key={d}
                onClick={() => setForm({ ...form, distribuidora: d })}
                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.distribuidora === d
                    ? 'border-rayo-amarillo bg-yellow-50 text-rayo-azul-oscuro'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Consumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumo mensual en kWh *
            <span className="text-gray-400 font-normal"> (aparece en tu factura)</span>
          </label>
          <input
            type="number"
            value={form.consumoKwh}
            onChange={e => setForm({ ...form, consumoKwh: e.target.value })}
            placeholder="Ej: 350"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-rayo-amarillo focus:border-rayo-amarillo outline-none"
          />
        </div>

        <div className="text-center text-xs text-gray-400">— o si no lo sabés —</div>

        {/* Monto factura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto de tu última factura ($)
          </label>
          <input
            type="number"
            value={form.montoFactura}
            onChange={e => setForm({ ...form, montoFactura: e.target.value })}
            placeholder="Ej: 45000"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-rayo-amarillo focus:border-rayo-amarillo outline-none"
          />
        </div>

        {/* Tipo propiedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de propiedad *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'casa', emoji: '🏠', label: 'Casa' },
              { val: 'ph', emoji: '🏢', label: 'PH / Depto' },
              { val: 'otro', emoji: '🏗️', label: 'Otro' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setForm({ ...form, tipoPropiedad: opt.val as any })}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  form.tipoPropiedad === opt.val
                    ? 'border-rayo-amarillo bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Material techo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material del techo *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 'losa', label: 'Losa' },
              { val: 'chapa', label: 'Chapa' },
              { val: 'teja', label: 'Teja' },
              { val: 'otro', label: 'Otro' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setForm({ ...form, materialTecho: opt.val as any })}
                className={`py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                  form.materialTecho === opt.val
                    ? 'border-rayo-amarillo bg-yellow-50 text-rayo-azul-oscuro'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onVolver}
          className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl
                     hover:bg-gray-50 transition-colors text-sm"
        >
          ← Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={!puedeContinuar}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            puedeContinuar
              ? 'bg-rayo-azul-oscuro text-rayo-amarillo shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          ⚡ Ver presupuesto
        </button>
      </div>
    </div>
  );
}
