'use client';

import { useState } from 'react';
import { DatosTecho } from '@/lib/calculadora';

interface Props {
  onComplete: (datos: DatosTecho) => void;
}

export default function StepTecho({ onComplete }: Props) {
  const [tipoPropiedad, setTipoPropiedad] = useState<DatosTecho['tipoPropiedad'] | null>(null);
  const [materialTecho, setMaterialTecho] = useState<DatosTecho['materialTecho'] | null>(null);
  const [orientacion, setOrientacion] = useState<DatosTecho['orientacion'] | null>(null);

  const puedeContinuar = tipoPropiedad && materialTecho && orientacion;

  const handleSubmit = () => {
    if (puedeContinuar) {
      onComplete({ tipoPropiedad, materialTecho, orientacion });
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <span className="text-4xl">🏠</span>
        <h3 className="text-2xl font-bold text-rayo-azul-oscuro mt-2">
          ¡Casi listo!
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Solo 3 preguntas sobre tu techo
        </p>
      </div>

      {/* Pregunta 1: Tipo de propiedad */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-rayo-azul-oscuro mb-3">
          ¿Tipo de propiedad?
        </label>
        <div className="grid grid-cols-3 gap-3">
          <OptionButton
            emoji="🏠"
            label="Casa"
            selected={tipoPropiedad === 'casa'}
            onClick={() => setTipoPropiedad('casa')}
          />
          <OptionButton
            emoji="🏢"
            label="PH / Depto"
            selected={tipoPropiedad === 'ph'}
            onClick={() => setTipoPropiedad('ph')}
          />
          <OptionButton
            emoji="🏗️"
            label="Otro"
            selected={tipoPropiedad === 'otro'}
            onClick={() => setTipoPropiedad('otro')}
          />
        </div>
      </div>

      {/* Pregunta 2: Material del techo */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-rayo-azul-oscuro mb-3">
          ¿Material del techo?
        </label>
        <div className="grid grid-cols-4 gap-3">
          <OptionButton
            emoji="▦"
            label="Losa"
            selected={materialTecho === 'losa'}
            onClick={() => setMaterialTecho('losa')}
          />
          <OptionButton
            emoji="◇"
            label="Chapa"
            selected={materialTecho === 'chapa'}
            onClick={() => setMaterialTecho('chapa')}
          />
          <OptionButton
            emoji="◫"
            label="Teja"
            selected={materialTecho === 'teja'}
            onClick={() => setMaterialTecho('teja')}
          />
          <OptionButton
            emoji="?"
            label="Otro"
            selected={materialTecho === 'otro'}
            onClick={() => setMaterialTecho('otro')}
          />
        </div>
      </div>

      {/* Pregunta 3: Orientación */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-rayo-azul-oscuro mb-3">
          ¿Orientación del techo? <span className="text-gray-400 font-normal">(si sabés)</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          <OptionButton
            emoji="☀️"
            label="Norte"
            sublabel="Ideal"
            selected={orientacion === 'norte'}
            onClick={() => setOrientacion('norte')}
          />
          <OptionButton
            emoji="↗️"
            label="Noreste"
            selected={orientacion === 'noreste'}
            onClick={() => setOrientacion('noreste')}
          />
          <OptionButton
            emoji="↖️"
            label="Noroeste"
            selected={orientacion === 'noroeste'}
            onClick={() => setOrientacion('noroeste')}
          />
          <OptionButton
            emoji="🤷"
            label="No sé"
            selected={orientacion === 'no_se'}
            onClick={() => setOrientacion('no_se')}
          />
        </div>
      </div>

      {/* Botón continuar */}
      <button
        onClick={handleSubmit}
        disabled={!puedeContinuar}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
          puedeContinuar
            ? 'bg-rayo-azul-oscuro text-rayo-amarillo hover:bg-rayo-azul-medio hover:shadow-xl active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        ⚡ Ver mi presupuesto solar
      </button>
    </div>
  );
}

function OptionButton({
  emoji, label, sublabel, selected, onClick,
}: {
  emoji: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-rayo-amarillo bg-yellow-50 shadow-md scale-[1.03]'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className={`text-xs font-medium ${selected ? 'text-rayo-azul-oscuro' : 'text-gray-600'}`}>
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-green-600 font-medium">{sublabel}</span>
      )}
    </button>
  );
}
