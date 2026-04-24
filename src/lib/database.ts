const API_BASE = '/api/leads';

export async function crearLead(nombre: string, email: string, telefono?: string): Promise<number | null> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono }),
    });

    if (!response.ok) {
      console.error('Error creando lead:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error creando lead:', error);
    return null;
  }
}

export async function actualizarLead(leadId: number, datos: Record<string, any>): Promise<boolean> {
  try {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, ...datos }),
    });

    if (!response.ok) {
      console.error('Error actualizando lead:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error actualizando lead:', error);
    return false;
  }
}

export async function actualizarPaso(leadId: number, paso: string): Promise<boolean> {
  return actualizarLead(leadId, { paso_actual: paso });
}
