import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [levelRequired, setLevelRequired] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { error: insertErr } = await (supabase.from('courses') as any).insert({
        title,
        slug: generatedSlug,
        description,
        thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        level_required: levelRequired,
      });

      if (insertErr) {
        setError(insertErr.message);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-level-2 space-y-6">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
          <h3 className="font-headline text-xl font-bold text-on-surface">Crear Nuevo Curso (Admin)</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-xs p-3 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-on-surface mb-1">Título del Curso</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Estrategias de Marketing Digital"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-on-surface mb-1">Slug (URL amigable)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="marketing-digital"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-on-surface mb-1">Descripción</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resume el propósito y competencias que desarrollará este curso..."
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Nivel Requerido</label>
              <select
                value={levelRequired}
                onChange={(e) => setLevelRequired(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              >
                <option value={1}>Nivel 1 (Inicial)</option>
                <option value={2}>Nivel 2 (Básico)</option>
                <option value={3}>Nivel 3 (Intermedio)</option>
                <option value={4}>Nivel 4 (Avanzado)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">URL de Portada (Imagen)</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-container-high"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-on-primary-fixed-variant disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
