import { useEffect, useState } from 'react';
import { fetchNotes, createNote, updateNote as apiUpdateNote, deleteNote as apiDeleteNote } from '../api/client';

const techStack = [
  { name: 'Laravel 12', icon: '🐘', color: 'from-red-500 to-orange-500' },
  { name: 'React 18', icon: '⚛️', color: 'from-blue-400 to-cyan-400' },
  { name: 'JavaScript', icon: '💛', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Tailwind CSS', icon: '🎨', color: 'from-cyan-400 to-blue-500' },
  { name: 'Vite', icon: '⚡', color: 'from-purple-500 to-pink-500' },
  { name: 'SQLite', icon: '🗄️', color: 'from-green-400 to-emerald-500' },
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      setNotes([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    try {
      if (editingId) {
        await apiUpdateNote(editingId, {content: value});
        setEditingId(null);
      } else {
        await createNote({content: value});
      }

      setInput('');
      await load();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }

  async function handleEdit(n) {
    setEditingId(n.id);
    setInput(n.content);
  }

  async function handleDelete(id) {
    if (!confirm('Delete note?')) return;
    try {
      await apiDeleteNote(id);
      await load();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 to-blue-900 rounded-2xl shadow-xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent">S6 Stack</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
          Modern full-stack starter with type safety, hot reload, and batteries included
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="w-full max-w-4xl mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all text-center group"
            >
              <div className={`text-3xl mb-2 bg-gradient-to-br ${tech.color} bg-clip-text text-transparent`}>
                {tech.icon}
              </div>
              <div className="text-white text-sm font-medium">{tech.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Try It Out</h2>
              <span className="text-sm text-gray-400">Full-stack CRUD demo</span>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a note to test the API..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-900 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                {editingId ? '✓ Update' : '+ Add'}
              </button>
            </form>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-400">No notes yet. Add one to see persistence in action!</p>
                </div>
              ) : (
                notes.map(n => (
                  <div key={n.id} className="group flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-white break-words">{n.content}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(n)} 
                        className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(n.id)} 
                        className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Built with ❤️ using modern web technologies • Hot reload enabled
          </p>
        </div>
      </div>
    </div>
  );
}
