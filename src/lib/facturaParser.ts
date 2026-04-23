// Prompt y parser para extracción de datos de facturas eléctricas argentinas
import { DatosFactura } from './calculadora';

// Prompt optimizado para ambos formatos (Edenor y Edesur)
export const PROMPT_EXTRACCION_FACTURA = `
Sos un experto en facturas eléctricas argentinas. Analizá la imagen/PDF de esta factura 
eléctrica y extraé TODOS los datos posibles en formato JSON.

IMPORTANTE:
- La factura puede ser de EDENOR o EDESUR
- Buscá consumo en kWh, NO en kW
- Si hay historial de consumos de meses anteriores (gráfico de barras o tabla), extraelo completo
- Los importes están en pesos argentinos (ARS)
- Identificá si el cliente tiene o no subsidio del Estado
- Si un campo no se puede leer con certeza, usá null

Devolvé EXACTAMENTE este JSON (sin texto adicional, solo el JSON):

{
  "extraccion_exitosa": true,
  "distribuidora": "EDENOR o EDESUR",
  "titular": {
    "nombre": "APELLIDO NOMBRE",
    "cuit": "XX-XXXXXXXX-X",
    "direccion": "calle y número, piso, depto",
    "localidad": "barrio o localidad",
    "partido": "partido o CABA",
    "codigo_postal": "XXXX"
  },
  "cuenta": {
    "numero_cliente": "XXXXXXXXXX",
    "numero_suministro": "XXXX-XXXXXXXX XX",
    "numero_medidor": "XXXXXXXXX",
    "categoria_tarifaria": "T1-R1 o T1-R2 etc",
    "tipo": "RESIDENCIAL"
  },
  "consumo": {
    "periodo_dias": 30,
    "consumo_kwh_periodo": 0,
    "historial_kwh": [
      { "mes": "MM/AAAA", "kwh": 0 }
    ]
  },
  "economia": {
    "cargo_fijo_ars": 0,
    "cargo_variable_ars": 0,
    "impuestos_ars": 0,
    "total_factura_ars": 0,
    "subsidio_ars": 0,
    "tiene_subsidio": false
  },
  "metadata": {
    "fecha_emision": "AAAA-MM-DD",
    "fecha_vencimiento_1": "AAAA-MM-DD",
    "periodo_desde": "AAAA-MM-DD",
    "periodo_hasta": "AAAA-MM-DD"
  }
}
`;

// Parsear la respuesta del LLM al formato interno DatosFactura
export function parsearRespuestaLLM(jsonString: string): DatosFactura | null {
  try {
    // Limpiar posible markdown del LLM
    let clean = jsonString.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();

    const data = JSON.parse(clean);

    if (!data.extraccion_exitosa) return null;

    // Calcular consumo mensual y promedio
    const periodoDias = data.consumo.periodo_dias || 30;
    const consumoPeriodo = data.consumo.consumo_kwh_periodo || 0;
    const consumoMensual = Math.round((consumoPeriodo / periodoDias) * 30);

    // Historial: calcular promedio si hay datos
    const historial = data.consumo.historial_kwh || [];
    let consumoPromedio = consumoMensual;
    if (historial.length > 1) {
      const suma = historial.reduce((acc: number, h: { kwh: number }) => acc + h.kwh, 0);
      consumoPromedio = Math.round(suma / historial.length);
    }

    // Precio efectivo del kWh
    const cargoVariable = data.economia.cargo_variable_ars || 0;
    const precioKwh = consumoPeriodo > 0
      ? parseFloat((cargoVariable / consumoPeriodo).toFixed(2))
      : 0;

    return {
      distribuidora: (data.distribuidora || 'OTRA').toUpperCase() as DatosFactura['distribuidora'],
      titular: data.titular?.nombre || 'Cliente',
      direccion: data.titular?.direccion || '',
      localidad: data.titular?.localidad || '',
      partido: data.titular?.partido || '',
      codigoPostal: data.titular?.codigo_postal || '',
      cuit: data.titular?.cuit || '',
      numeroCliente: data.cuenta?.numero_cliente || '',
      numeroSuministro: data.cuenta?.numero_suministro || '',
      numeroMedidor: data.cuenta?.numero_medidor || '',
      categoriaTarifaria: data.cuenta?.categoria_tarifaria || '',
      consumoKwhPeriodo: consumoPeriodo,
      periodoDias: periodoDias,
      consumoKwhMensual: consumoMensual,
      consumoPromedioMensual: consumoPromedio,
      historialKwh: historial,
      cargoFijoArs: data.economia?.cargo_fijo_ars || 0,
      cargoVariableArs: cargoVariable,
      impuestosArs: data.economia?.impuestos_ars || 0,
      totalFacturaArs: data.economia?.total_factura_ars || 0,
      precioKwhEfectivoArs: precioKwh,
      tieneSubsidio: data.economia?.tiene_subsidio || false,
    };
  } catch (error) {
    console.error('Error parseando respuesta LLM:', error);
    return null;
  }
}

// Verificar si necesitamos más facturas (Edenor sin historial)
export function necesitaMasFacturas(datos: DatosFactura): boolean {
  return datos.distribuidora === 'EDENOR' && datos.historialKwh.length <= 1;
}
