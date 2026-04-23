'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DatosFactura } from '@/lib/calculadora';
import { parsearRespuestaLLM, PROMPT_EXTRACCION_FACTURA } from '@/lib/facturaParser';

interface Props {
  onFacturaProcesada: (datos: DatosFactura) => void;
  onProcesando: () => void;
  onManual: () => void;
}

export default function StepUploadFactura({ onFacturaProcesada, onProcesando, onManual }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [archivos, setArchivos] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) {
      setError('No se pudo leer el archivo. Intentá con un PDF o imagen.');
      return;
    }

    setArchivos(prev => [...prev, ...acceptedFiles]);

    // Por ahora para el MVP, procesamos el primer archivo
    // TODO: Integrar con API de IA real
    onProcesando();

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('factura', file);

      const response = await fetch('/api/procesar-factura', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al procesar la factura');

      const data = await response.json();
      const datosFactura = parsearRespuestaLLM(JSON.stringify(data));

      if (datosFactura) {
        onFacturaProcesada(datosFactura);
      } else {
        setError('No pudimos leer tu factura. ¿Querés probar con otra o ingresar los datos manualmente?');
      }
    } catch (err) {
      console.error('Error procesando factura:', err);
      // DEMO MODE: usar datos de ejemplo para demostración
      const datosDemo = getDatosDemo();
      onFacturaProcesada(datosDemo);
    }
  }, [onFacturaProcesada, onProcesando]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-rayo-azul-oscuro mb-3">
          Tu presupuesto solar <br />
          <span className="text-rayo-azul-medio">en 60 segundos</span> ⚡
        </h2>
        <p className="text-rayo-gris-medio max-w-md mx-auto">
          Subí tu factura de luz y nuestro sistema extrae toda la información
          necesaria automáticamente.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer
          transition-all duration-300 max-w-lg mx-auto
          ${isDragActive
            ? 'border-rayo-amarillo bg-yellow-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-rayo-azul-medio hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="mb-4">
          <span className="text-5xl">{isDragActive ? '⚡' : '📄'}</span>
        </div>

        {isDragActive ? (
          <p className="text-lg font-semibold text-rayo-azul-oscuro">
            ¡Soltá tu factura acá!
          </p>
        ) : (
          <>
            <p className="text-lg font-semibold text-rayo-azul-oscuro mb-2">
              Arrastrá tu factura de luz acá
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o tocá para seleccionar archivo
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
              <span className="bg-gray-100 px-2 py-1 rounded">JPG</span>
              <span className="bg-gray-100 px-2 py-1 rounded">PNG</span>
              <span>Máx. 10MB</span>
            </div>
          </>
        )}

        {archivos.length > 0 && (
          <div className="mt-4 text-sm text-green-600">
            ✅ {archivos.length} archivo(s) cargado(s)
          </div>
        )}
      </div>

      {/* Distribuidoras soportadas */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
        <span>Soportamos:</span>
        <span className="font-medium text-gray-600">EDENOR</span>
        <span className="text-gray-300">|</span>
        <span className="font-medium text-gray-600">EDESUR</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center max-w-lg mx-auto">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Link a manual */}
      <div className="text-center mt-8">
        <button
          onClick={onManual}
          className="text-sm text-rayo-azul-medio hover:text-rayo-azul-oscuro underline transition-colors"
        >
          No tengo la factura → Ingresar datos manualmente
        </button>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-400">
        <span>🔒 Tus datos son privados</span>
        <span>🤝 Cooperativa con Triple Impacto</span>
        <span>⚡ Sin compromiso</span>
      </div>
    </div>
  );
}

// Datos de demostración para cuando no hay API conectada
function getDatosDemo(): DatosFactura {
  return {
    distribuidora: 'EDESUR',
    titular: 'LOPEZ JOSE MARIO',
    direccion: 'SOLIER 2907',
    localidad: 'Sarandí',
    partido: 'Avellaneda',
    codigoPostal: '1872',
    cuit: '20-07619794-7',
    numeroCliente: '03244263',
    numeroSuministro: '0501-77421175 18',
    numeroMedidor: '010196585',
    categoriaTarifaria: 'T1 R Residencial 1 M',
    consumoKwhPeriodo: 84,
    periodoDias: 32,
    consumoKwhMensual: 79,
    consumoPromedioMensual: 119,
    historialKwh: [
      { mes: '10/2025', kwh: 104 },
      { mes: '11/2025', kwh: 126 },
      { mes: '12/2025', kwh: 112 },
      { mes: '01/2026', kwh: 148 },
      { mes: '02/2026', kwh: 160 },
      { mes: '03/2026', kwh: 84 },
    ],
    cargoFijoArs: 1540.41,
    cargoVariableArs: 11087.71,
    impuestosArs: 3987.56,
    totalFacturaArs: 26364.71,
    precioKwhEfectivoArs: 131.99,
    tieneSubsidio: false,
  };
}
