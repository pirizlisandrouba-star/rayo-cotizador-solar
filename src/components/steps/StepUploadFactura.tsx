'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DatosFactura } from '@/lib/calculadora';
import { parsearRespuestaLLM } from '@/lib/facturaParser';

interface Props {
  onFacturaProcesada: (datos: DatosFactura) => void;
  onProcesando: () => void;
  onManual: () => void;
}

export default function StepUploadFactura({ onFacturaProcesada, onProcesando, onManual }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setDetalleError(null);

    if (acceptedFiles.length === 0) {
      setError('No se pudo leer el archivo. Intentá con un PDF o imagen.');
      return;
    }

    setArchivos(acceptedFiles);
    onProcesando();

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('factura', file);

      const response = await fetch('/api/procesar-factura', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setDetalleError(`Status: ${response.status} - ${JSON.stringify(data).substring(0, 300)}`);
        throw new Error(data.error || 'Error al procesar la factura');
      }

      const datosFactura = parsearRespuestaLLM(JSON.stringify(data));

      if (datosFactura) {
        onFacturaProcesada(datosFactura);
      } else {
        setError('Pudimos leer la factura pero no interpretar los datos. Probá con otra imagen o ingresá manualmente.');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al procesar la factura.');
    }
  }, [onFacturaProcesada, onProcesando]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="animate-fade-in">
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
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
        <span>Soportamos:</span>
        <span className="font-medium text-gray-600">EDENOR</span>
        <span className="text-gray-300">|</span>
        <span className="font-medium text-gray-600">EDESUR</span>
      </div>

      {error && (
        <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto">
          <div className="text-center mb-3">
            <span className="text-3xl">😕</span>
            <h4 className="text-red-700 font-semibold mt-1">No pudimos leer tu factura</h4>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>

          {detalleError && (
            <details className="mt-3 mb-3">
              <summary className="text-xs text-gray-400 cursor-pointer">Ver detalle técnico</summary>
              <pre className="text-xs text-gray-500 mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                {detalleError}
              </pre>
            </details>
          )}

          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={() => { setError(null); setDetalleError(null); setArchivos([]); }}
              className="text-sm bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              🔄 Intentar de nuevo
            </button>
            <button
              onClick={onManual}
              className="text-sm bg-rayo-azul-oscuro text-rayo-amarillo px-4 py-2 rounded-lg hover:bg-rayo-azul-medio transition-colors"
            >
              ✏️ Ingresar manualmente
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            💡 Tip: Probá subir una captura de pantalla (JPG/PNG) en vez de PDF
          </p>
        </div>
      )}

      {!error && (
        <div className="text-center mt-8">
          <button
            onClick={onManual}
            className="text-sm text-rayo-azul-medio hover:text-rayo-azul-oscuro underline transition-colors"
          >
            No tengo la factura → Ingresar datos manualmente
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-400">
        <span>🔒 Tus datos son privados</span>
        <span>🤝 Cooperativa con Triple Impacto</span>
        <span>⚡ Sin compromiso</span>
      </div>
    </div>
  );
}
