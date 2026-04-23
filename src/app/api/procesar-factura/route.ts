import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PROMPT_EXTRACCION = `
Sos un experto en facturas eléctricas argentinas. Analizá esta imagen de una factura eléctrica y extraé TODOS los datos posibles.

REGLAS ESTRICTAS:
- La factura puede ser de EDENOR o EDESUR
- Buscá consumo en kWh, NO en kW
- Si hay historial de consumos de meses anteriores (gráfico de barras, tabla o listado), extraelo completo con mes y valor en kWh
- Los importes están en pesos argentinos (ARS)
- Identificá si el cliente tiene o no subsidio del Estado
- El cargo_fijo_ars es la suma de cargos fijos (cargo fijo por servicio, etc)
- El cargo_variable_ars es la suma de cargos por energía consumida
- Los impuestos_ars incluyen IVA, contribuciones municipales, ley 7290, etc
- Si un campo no se puede leer con certeza, usá null
- Respondé UNICAMENTE con el JSON, sin texto antes ni después, sin markdown

{
  "extraccion_exitosa": true,
  "distribuidora": "EDENOR o EDESUR",
  "titular": {
    "nombre": "APELLIDO NOMBRE completo tal como aparece",
    "cuit": "XX-XXXXXXXX-X",
    "direccion": "calle y número completo, piso, depto si tiene",
    "localidad": "barrio o localidad",
    "partido": "partido del GBA o CABA",
    "codigo_postal": "XXXX"
  },
  "cuenta": {
    "numero_cliente": "número completo",
    "numero_suministro": "número completo o null",
    "numero_medidor": "número completo",
    "categoria_tarifaria": "T1-R1, T1-R2, etc tal como aparece",
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
    "fecha_emision": "AAAA-MM-DD o null",
    "fecha_vencimiento_1": "AAAA-MM-DD o null",
    "periodo_desde": "AAAA-MM-DD o null",
    "periodo_hasta": "AAAA-MM-DD o null"
  }
}
`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('factura') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar que hay API key configurada
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY no configurada. Modo demo.');
      return NextResponse.json(
        { error: 'API key no configurada. Modo demo activo.' },
        { status: 501 }
      );
    }

    // Convertir archivo a base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Determinar mime type
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const name = file.name.toLowerCase();
      if (name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (name.endsWith('.png')) mimeType = 'image/png';
      else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (name.endsWith('.webp')) mimeType = 'image/webp';
      else mimeType = 'image/jpeg';
    }

    console.log(`Procesando: ${file.name} (${mimeType}, ${file.size} bytes)`);

    // Llamar a Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: PROMPT_EXTRACCION,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Gemini API:', response.status, errorText);
      return NextResponse.json(
        { error: `Error del servicio de IA: ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();

    // Extraer el texto de la respuesta de Gemini
    const contenido = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!contenido) {
      console.error('Respuesta vacía de Gemini:', JSON.stringify(result));
      return NextResponse.json(
        { error: 'La IA no pudo leer la factura. Intentá con una foto más nítida.' },
        { status: 422 }
      );
    }

    // Intentar parsear el JSON
    let jsonData;
    try {
      let clean = contenido.trim();
      if (clean.startsWith('```json')) clean = clean.slice(7);
      if (clean.startsWith('```')) clean = clean.slice(3);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
      clean = clean.trim();

      jsonData = JSON.parse(clean);
    } catch (parseError) {
      console.error('Error parseando JSON de Gemini:', contenido);
      return NextResponse.json(
        { error: 'No se pudo interpretar la respuesta. Intentá con otra imagen.' },
        { status: 422 }
      );
    }

    // Validar que la extracción fue exitosa
    if (!jsonData.extraccion_exitosa) {
      return NextResponse.json(
        { error: 'No se pudieron extraer los datos de la factura.' },
        { status: 422 }
      );
    }

    console.log('Factura procesada OK:', jsonData.distribuidora, jsonData.consumo?.consumo_kwh_periodo, 'kWh');

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la factura' },
      { status: 500 }
    );
  }
}
