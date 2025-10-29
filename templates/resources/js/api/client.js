const base = '/api/notes';

export async function fetchNotes() {
  const res = await fetch(base);
  if (!res.ok) return [];
  return await res.json();
}

export async function createNote(payload) {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function updateNote(id, payload) {
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function deleteNote(id) {
  await fetch(`${base}/${id}`, { method: 'DELETE' });
}
