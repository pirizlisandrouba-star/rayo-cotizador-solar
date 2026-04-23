// Motor de cálculo solar — CORE del cotizador
import preciosConfig from '@/config/precios.json';

const { parametros_solares } = preciosConfig;

export interface DatosFactura {
  distribuidora: 'EDENOR' | 'EDESUR' | 'OTRA';
  titular: string;
  direccion: string;
  localidad: string;
  partido: string;
  codigoPostal: string;
  cuit: string;
  numeroCliente: string;
  numeroSuministro: string;
  numeroMedidor: string;
  categoriaTarifaria: string;
  consumoKwhPeriodo: number;
  periodoDias: number;
  consumoKwhMensual: number;
  consumoPromedioMensual: number;
  historialKwh: { mes: string; kwh: number }[];
  cargoFijoArs: number;
  cargoVariableArs: number;
  impuestosArs: number;
  totalFacturaArs: number;
  precioKwhEfectivoArs: number;
  tieneSubsidio: boolean;
}

export interface DatosTecho {
  tipoPropiedad: 'casa' | 'ph' | 'otro';
  materialTecho: 'losa' | 'chapa' | 'teja' | 'otro';
  orientacion: 'norte' | 'noreste' | 'noroeste' | 'no_se';
}

export interface ResultadoPaquete {
  id: string;
  nombre: string;
  paneles: number;
  potenciaKwp: number;
  espacioTechoM2: number;
  generacionMensualKwh: number;
  generacionAnualKwh: number;
  porcentajeConsumoMensual: number;
  ahorroMensualArs: number;
  ahorroAnualArs: number;
  precioOnGridUsd: number;
  precioHibridoUsd: number;
  precioOnGridArs: number;
  precioHibridoArs: number;
  paybackOnGridAnios: number;
  paybackHibridoAnios: number;
  co2EvitadoAnualKg: number;
  arbolesEquivalentes: number;
  autosEquivalentes: number;
  incluye: string[];
  esRecomendado: boolean;
  excedente: boolean;
}

export interface ResultadoCotizacion {
  datosCliente: {
    nombre: string;
    direccion: string;
    localidad: string;
    distribuidora: string;
  };
  consumo: {
    mensualKwh: number;
    promedioMensualKwh: number;
    facturaActualArs: number;
    precioKwhArs: number;
    cargoFijoArs: number;
  };
  paquetes: ResultadoPaquete[];
  recomendado: string;
  fechaCotizacion: string;
}

// Factor de ajuste por orientación del techo
function factorOrientacion(orientacion: string): number {
  switch (orientacion) {
    case 'norte': return 1.0;       // Óptimo en hemisferio sur
    case 'noreste': return 0.95;
    case 'noroeste': return 0.95;
    case 'no_se': return 0.92;      // Promedio conservador
    default: return 0.90;
  }
}

// Factor de ajuste por tipo de techo (afecta ventilación e inclinación)
function factorTecho(material: string): number {
  switch (material) {
    case 'losa': return 1.0;        // Se puede inclinar óptimamente
    case 'chapa': return 0.97;      // Inclinación existente, más calor
    case 'teja': return 0.95;       // Más complejo pero funcional
    case 'otro': return 0.93;
    default: return 0.95;
  }
}

export function calcularCotizacion(
  datosFactura: DatosFactura,
  datosTecho: DatosTecho
): ResultadoCotizacion {
  const hsp = parametros_solares.hsp_promedio_gba;
  const pr = parametros_solares.factor_rendimiento;
  const co2Factor = parametros_solares.co2_por_kwh_kg;
  const tc = preciosConfig.tipo_cambio_usd_ars;

  const fOrientacion = factorOrientacion(datosTecho.orientacion);
  const fTecho = factorTecho(datosTecho.materialTecho);

  // Consumo mensual real o promedio
  const consumoMensual = datosFactura.consumoPromedioMensual > 0
    ? datosFactura.consumoPromedioMensual
    : datosFactura.consumoKwhMensual;

  const precioKwh = datosFactura.precioKwhEfectivoArs;
  const cargoFijo = datosFactura.cargoFijoArs;

  const paquetesConfig = preciosConfig.paquetes;
  const paquetesIds = ['starter', 'hogar', 'total'] as const;

  // Calcular cada paquete
  const paquetes: ResultadoPaquete[] = paquetesIds.map((id) => {
    const pkg = paquetesConfig[id];

    // Generación mensual ajustada por orientación y techo
    const genMensual = pkg.potencia_kwp * hsp * 30 * pr * fOrientacion * fTecho;
    const genAnual = genMensual * 12;

    // Porcentaje del consumo que cubre
    const pctConsumo = consumoMensual > 0
      ? Math.min((genMensual / consumoMensual) * 100, 150)
      : 0;

    // Ahorro: solo sobre el cargo variable (el fijo no se reduce)
    // Si generás más de lo que consumís, el ahorro máximo es el cargo variable
    const ahorroMaxMensual = datosFactura.cargoVariableArs + datosFactura.impuestosArs;
    const ahorroTeorico = genMensual * precioKwh;
    const ahorroMensual = Math.min(ahorroTeorico, ahorroMaxMensual);
    const ahorroAnual = ahorroMensual * 12;

    // Precios
    const precioOnGridArs = pkg.precio_on_grid_usd * tc;
    const precioHibridoArs = pkg.precio_hibrido_usd * tc;

    // Payback
    const paybackOnGrid = ahorroAnual > 0
      ? parseFloat((precioOnGridArs / ahorroAnual).toFixed(1))
      : 99;
    const paybackHibrido = ahorroAnual > 0
      ? parseFloat((precioHibridoArs / ahorroAnual).toFixed(1))
      : 99;

    // Impacto ambiental
    const co2Anual = Math.round(genAnual * co2Factor);
    const arboles = Math.round(co2Anual / 22); // ~22 kg CO2 por árbol/año
    const autos = parseFloat((co2Anual / 4600).toFixed(1)); // ~4600 kg CO2 por auto/año

    return {
      id,
      nombre: pkg.nombre,
      paneles: pkg.paneles,
      potenciaKwp: pkg.potencia_kwp,
      espacioTechoM2: pkg.espacio_techo_m2,
      generacionMensualKwh: Math.round(genMensual),
      generacionAnualKwh: Math.round(genAnual),
      porcentajeConsumoMensual: Math.round(pctConsumo),
      ahorroMensualArs: Math.round(ahorroMensual),
      ahorroAnualArs: Math.round(ahorroAnual),
      precioOnGridUsd: pkg.precio_on_grid_usd,
      precioHibridoUsd: pkg.precio_hibrido_usd,
      precioOnGridArs: Math.round(precioOnGridArs),
      precioHibridoArs: Math.round(precioHibridoArs),
      paybackOnGridAnios: paybackOnGrid,
      paybackHibridoAnios: paybackHibrido,
      co2EvitadoAnualKg: co2Anual,
      arbolesEquivalentes: arboles,
      autosEquivalentes: autos,
      incluye: pkg.incluye,
      esRecomendado: false,
      excedente: genMensual > consumoMensual,
    };
  });

  // Determinar paquete recomendado:
  // El más chico que cubra al menos el 80% del consumo,
  // o el más grande si ninguno llega
  let recomendadoId = 'total';
  for (const paq of paquetes) {
    if (paq.porcentajeConsumoMensual >= 80) {
      recomendadoId = paq.id;
      break;
    }
  }
  paquetes.forEach(p => {
    p.esRecomendado = p.id === recomendadoId;
  });

  return {
    datosCliente: {
      nombre: datosFactura.titular,
      direccion: datosFactura.direccion,
      localidad: `${datosFactura.localidad}, ${datosFactura.partido}`,
      distribuidora: datosFactura.distribuidora,
    },
    consumo: {
      mensualKwh: consumoMensual,
      promedioMensualKwh: datosFactura.consumoPromedioMensual,
      facturaActualArs: datosFactura.totalFacturaArs,
      precioKwhArs: precioKwh,
      cargoFijoArs: cargoFijo,
    },
    paquetes,
    recomendado: recomendadoId,
    fechaCotizacion: new Date().toISOString(),
  };
}
