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

const PASOS_LECTURA = [
  { texto: 'Recibiendo tu factura...', emoji: '📄' },
  { texto: 'Enviando a nuestro lector inteligente...', emoji: '🤖' },
  { texto: 'Identificando distribuidora...', emoji: '🔍' },
  { texto: 'Extrayendo datos de consumo...', emoji: '⚡' },
  { texto: 'Leyendo datos del titular...', emoji: '👤' },
  { texto: 'Analizando importes y cargos...', emoji: '💰' },
  { texto: 'Buscando historial de consumo...', emoji: '📊' },
  { texto: 'Casi listo, preparando resultados...', emoji: '✨' },
];

export default function StepUploadFactura({ onFacturaProcesada, onProcesando, onManual }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [detalleError, setDetalleError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [pasoLectura, setPasoLectura] = useState(0);
  const [progreso, setProgreso] = useState(0);

  const iniciarAnimacion = () => {
    setCargando(true);
    setPasoLectura(0);
    setProgreso(0);

    let paso = 0;
    const interval = setInterval(() => {
      paso++;
      if (paso < PASOS_LECTURA.length) {
        setPasoLectura(paso);
        setProgreso(Math.round((paso / PASOS_LECTURA.length) * 100));
      } else {
        setProgreso(95);
      }
    }, 2500);

    return interval;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setDetalleError(null);

    if (acceptedFiles.length === 0) {
      setError('No se pudo leer el archivo. Intentá con un PDF o imagen.');
      return;
    }

    const animInterval = iniciarAnimacion();

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('factura', file);

      const response = await fetch('/api/procesar-factura', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(animInterval);

      if (!response.ok) {
        setCargando(false);
        setDetalleError(`Status: ${response.status} - ${JSON.stringify(data).substring(0, 300)}`);
        throw new Error(data.error || 'Error al procesar la factura');
      }

      const datosFactura = parsearRespuestaLLM(JSON.stringify(data));

      if (datosFactura) {
        setProgreso(100);
        setPasoLectura(PASOS_LECTURA.length - 1);
        setTimeout(() => {
          setCargando(false);
          onFacturaProcesada(datosFactura);
        }, 500);
      } else {
        setCargando(false);
        setError('Pudimos leer la factura pero no interpretar los datos. Probá con otra imagen o ingresá manualmente.');
      }
    } catch (err: any) {
      clearInterval(animInterval);
      setCargando(false);
      console.error('Error:', err);
      setError(err.message || 'Error al procesar la factura.');
    }
  }, [onFacturaProcesada]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    disabled: cargando,
  });

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <div className="animate-fade-in">
        <div className="max-w-md mx-auto text-center py-8">
          {/* Rayo animado */}
          <div className="relative mb-6">
            <div className="text-6xl animate-bounce">⚡</div>
          </div>

          <h3 className="text-xl font-bold text-rayo-azul-oscuro mb-2">
            Analizando tu factura...
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Nuestro lector inteligente está extrayendo tus datos
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rayo-azul-medio to-rayo-amarillo h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>

          {/* Pasos con animación */}
          <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm">
            {PASOS_LECTURA.map((paso, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  idx <= pasoLectura
                    ? 'opacity-100'
                    : 'opacity-20'
                }`}
              >
                <span className="text-lg w-7 text-center">
                  {idx < pasoLectura ? '✅' : idx === pasoLectura ? paso.emoji : '⬜'}
                </span>
                <span
                  className={`text-sm ${
                    idx < pasoLectura
                      ? 'text-green-600 line-through'
                      : idx === pasoLectura
                      ? 'text-rayo-azul-oscuro font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {paso.texto}
                </span>
                {idx === pasoLectura && (
                  <span className="inline-block w-1.5 h-1.5 bg-rayo-amarillo rounded-full animate-ping" />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Esto puede tomar entre 10 y 30 segundos
          </p>
        </div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL (upload)
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
              onClick={() => { setError(null); setDetalleError(null); }}
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
