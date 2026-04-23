import { NextRequest, NextResponse } from 'next/server';

// API Route para procesar facturas con IA
// TODO: Integrar con OpenAI GPT-4o, Anthropic Claude, u otro LLM con visión
//
// Por ahora retorna un error controlado que activa el DEMO MODE
// en el frontend (datos de ejemplo de la factura Edesur analizada)

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

    console.log(`📄 Factura recibida: ${file.name} (${file.type}, ${file.size} bytes)`);

    // ═══════════════════════════════════════════════════════
    // TODO: Integrar con LLM de visión
    //
    // Opción A — OpenAI:
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [{
    //     role: 'user',
    //     content: [
    //       { type: 'text', text: PROMPT_EXTRACCION_FACTURA },
    //       { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
    //     ]
    //   }],
    //   max_tokens: 2000,
    // });
    // const jsonStr = response.choices[0].message.content;
    //
    // Opción B — Anthropic Claude:
    // Similar, usando la API de Messages con content type image
    //
    // ═══════════════════════════════════════════════════════

    // Por ahora: retornar error para que el frontend use DEMO MODE
    return NextResponse.json(
      { error: 'API de IA no configurada. Usando modo demo.' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error procesando factura:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la factura' },
      { status: 500 }
    );
  }
}
