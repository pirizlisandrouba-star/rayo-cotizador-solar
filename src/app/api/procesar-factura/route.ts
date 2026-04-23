import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

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

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key no configurada. Modo demo activo.' },
        { status: 501 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const name = file.name.toLowerCase();
      if (name.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (name.endsWith('.png')) mimeType = 'image/png';
      else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (name.endsWith('.webp')) mimeType = 'image/webp';
      else mimeType = 'image/jpeg';
    }

    console.log('Procesando:', file.name, mimeType, file.size, 'bytes');

    const prompt = `Sos un experto en facturas electricas argentinas. Analiza este documento de una factura electrica y extrae TODOS los datos posibles.

REGLAS:
- La factura puede ser de EDENOR o EDESUR
- Busca consumo en kWh, NO en kW
- Si hay historial de consumos de meses anteriores (grafico de barras, tabla o listado), extraelo completo con mes y valor en kWh
- Los importes estan en pesos argentinos (ARS)
- Identifica si el cliente tiene o no subsidio del Estado
- El cargo_fijo_ars es la suma de cargos fijos (cargo fijo por servicio, etc)
- El cargo_variable_ars es la suma de cargos por energia consumida
- Los impuestos_ars incluyen IVA, contribuciones municipales, ley 7290, etc
- Si un campo no se puede leer con certeza, usa null
- Responde UNICAMENTE con el JSON, sin texto antes ni despues, sin backticks, sin markdown

{
  "extraccion_exitosa": true,
  "distribuidora": "EDENOR o EDESUR",
  "titular": {
    "nombre": "APELLIDO NOMBRE completo tal como aparece",
    "cuit": "XX-XXXXXXXX-X",
    "direccion": "calle y numero completo, piso, depto si tiene",
    "localidad": "barrio o localidad",
    "partido": "partido del GBA o CABA",
    "codigo_postal": "XXXX"
  },
  "cuenta": {
    "numero_cliente": "numero completo",
    "numero_suministro": "numero completo o null",
    "numero_medidor": "numero completo",
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
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000
      }
    };

    console.log('Llamando a Gemini 2.5 Flash...');
    console.log('URL:', url.replace(GEMINI_API_KEY, 'KEY_HIDDEN'));
    console.log('MimeType:', mimeType);
    console.log('Base64 length:', base64.length);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Gemini status:', response.status);
    console.log('Gemini response:', responseText.substring(0, 300));

    if (!response.ok) {
      console.error('Error Gemini completo:', responseText);
      return NextResponse.json(
        { error: `Error Gemini ${response.status}: ${responseText.substring(0, 300)}` },
        { status: 502 }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Gemini no devolvio JSON:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Respuesta invalida del servicio de IA' },
        { status: 502 }
      );
    }

    const contenido = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!contenido) {
      console.error('Sin contenido. Candidates:', JSON.stringify(result.candidates || {}).substring(0, 500));
      return NextResponse.json(
        { error: 'La IA no pudo leer la factura.' },
        { status: 422 }
      );
    }

    console.log('Gemini texto:', contenido.substring(0, 200));

let jsonData;
    try {
      let clean = contenido.trim();
      
      const jsonBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
      const match = clean.match(jsonBlockRegex);
      if (match) {
        clean = match[1].trim();
      }
      
      if (!clean.startsWith('{')) {
        const jsonStart = clean.indexOf('{');
        const jsonEnd = clean.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          clean = clean.substring(jsonStart, jsonEnd + 1);
        }
      }

      console.log('JSON limpio:', clean.substring(0, 200));
      jsonData = JSON.parse(clean);
    } catch (parseError) {
      console.error('No se pudo parsear:', contenido);
      return NextResponse.json(
        { error: 'No se pudo interpretar. Respuesta: ' + contenido.substring(0, 200) },
        { status: 422 }
      );
    }

    if (!jsonData.extraccion_exitosa) {
      return NextResponse.json(
        { error: 'No se pudieron extraer los datos.' },
        { status: 422 }
      );
    }

    console.log('EXITO:', jsonData.distribuidora, jsonData.consumo?.consumo_kwh_periodo, 'kWh');
    return NextResponse.json(jsonData);

  } catch (error: any) {
    console.error('Error general:', error.message || error);
    return NextResponse.json(
      { error: 'Error interno: ' + (error.message || 'desconocido') },
      { status: 500 }
    );
  }
}
