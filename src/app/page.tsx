'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StepUploadFactura from '@/components/steps/StepUploadFactura';
import StepDatosExtraidos from '@/components/steps/StepDatosExtraidos';
import StepTecho from '@/components/steps/StepTecho';
import StepManual from '@/components/steps/StepManual';
import Resultado from '@/components/Resultado';
import ProcesamientoAnimation from '@/components/ProcesamientoAnimation';
import { DatosFactura, DatosTecho, ResultadoCotizacion, calcularCotizacion } from '@/lib/calculadora';

type Paso = 'upload' | 'procesando' | 'datos_extraidos' | 'techo' | 'resultado' | 'manual';

export default function Home() {
  const [paso, setPaso] = useState<Paso>('upload');
  const [datosFactura, setDatosFactura] = useState<DatosFactura | null>(null);
  const [datosTecho, setDatosTecho] = useState<DatosTecho | null>(null);
  const [resultado, setResultado] = useState<ResultadoCotizacion | null>(null);
  const [facturasAdicionales, setFacturasAdicionales] = useState(false);

  // Cuando la factura fue procesada por la IA
  const handleFacturaProcesada = (datos: DatosFactura) => {
    setDatosFactura(datos);
    setPaso('datos_extraidos');
  };

  // Confirmación de datos extraídos → pasar a preguntas de techo
  const handleDatosConfirmados = (datos: DatosFactura) => {
    setDatosFactura(datos);
    setPaso('techo');
  };

  // Cuando completa datos del techo → calcular y mostrar resultado
  const handleTechoCompleto = (techo: DatosTecho) => {
    setDatosTecho(techo);
    if (datosFactura) {
      const res = calcularCotizacion(datosFactura, techo);
      setResultado(res);
      setPaso('resultado');
    }
  };

  // Flujo manual (sin factura)
  const handleManualCompleto = (datos: DatosFactura, techo: DatosTecho) => {
    setDatosFactura(datos);
    setDatosTecho(techo);
    const res = calcularCotizacion(datos, techo);
    setResultado(res);
    setPaso('resultado');
  };

  // Volver al inicio
  const handleReset = () => {
    setPaso('upload');
    setDatosFactura(null);
    setDatosTecho(null);
    setResultado(null);
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress indicator */}
        {paso !== 'resultado' && paso !== 'manual' && (
          <ProgressIndicator paso={paso} />
        )}

        {paso === 'upload' && (
          <StepUploadFactura
            onFacturaProcesada={handleFacturaProcesada}
            onProcesando={() => setPaso('procesando')}
            onManual={() => setPaso('manual')}
          />
        )}

        {paso === 'procesando' && (
          <ProcesamientoAnimation />
        )}

        {paso === 'datos_extraidos' && datosFactura && (
          <StepDatosExtraidos
            datos={datosFactura}
            onConfirmar={handleDatosConfirmados}
            onVolver={handleReset}
          />
        )}

        {paso === 'techo' && (
          <StepTecho onComplete={handleTechoCompleto} />
        )}

        {paso === 'manual' && (
          <StepManual
            onComplete={handleManualCompleto}
            onVolver={handleReset}
          />
        )}

        {paso === 'resultado' && resultado && (
          <Resultado
            resultado={resultado}
            onNuevaCotizacion={handleReset}
          />
        )}
      </div>
    </main>
  );
}

// Indicador de progreso visual
function ProgressIndicator({ paso }: { paso: Paso }) {
  const pasos = [
    { id: 'upload', label: 'Factura', icon: '📄' },
    { id: 'datos_extraidos', label: 'Datos', icon: '✅' },
    { id: 'techo', label: 'Techo', icon: '🏠' },
    { id: 'resultado', label: 'Presupuesto', icon: '⚡' },
  ];

  const pasoActualIdx = pasos.findIndex(p =>
    p.id === paso || (paso === 'procesando' && p.id === 'upload')
  );

  return (
    <div className="flex items-center justify-center mb-8 gap-1">
      {pasos.map((p, idx) => (
        <div key={p.id} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              idx <= pasoActualIdx
                ? 'bg-rayo-azul-oscuro text-rayo-amarillo'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </div>
          {idx < pasos.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                idx < pasoActualIdx ? 'bg-rayo-amarillo' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
