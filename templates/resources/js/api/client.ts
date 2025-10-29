const base = '/api/notes';

export async function fetchNotes() {
  const res = await fetch(base);
  if (!res.ok) return [];
  return await res.json();
}

export async function createNote(payload: {content: string}) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function updateNote(id: number, payload: {content: string}) {
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function deleteNote(id: number) {
  await fetch(`${base}/${id}`, { method: 'DELETE' });
}
