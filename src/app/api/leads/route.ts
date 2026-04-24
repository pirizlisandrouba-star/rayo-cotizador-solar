import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  return neon(databaseUrl);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, telefono } = body;

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
    }

    const sql = getDb();

    const result = await sql`
      INSERT INTO leads (nombre, email, telefono, paso_actual, estado)
      VALUES (${nombre}, ${email}, ${telefono || null}, 'bienvenida', 'nuevo')
      RETURNING id
    `;

    const id = result[0]?.id;
    console.log('Lead creado:', id, nombre, email);

    return NextResponse.json({ id });
  } catch (error: any) {
    console.error('Error creando lead:', error.message || error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...datos } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const sql = getDb();

    const campos = Object.keys(datos);
    const valores = Object.values(datos);

    if (campos.length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    // Construir query dinamico
    const setClauses = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
    const query = `UPDATE leads SET ${setClauses}, updated_at = NOW() WHERE id = $${campos.length + 1}`;

    await sql(query, [...valores, id]);

    console.log('Lead actualizado:', id, datos.paso_actual || '');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error actualizando lead:', error.message || error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = getDb();

    const result = await sql`
      SELECT * FROM leads ORDER BY created_at DESC LIMIT 100
    `;

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error listando leads:', error.message || error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
