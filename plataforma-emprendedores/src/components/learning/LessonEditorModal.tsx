import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedLesson?: any) => void;
  moduleId: string;
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    video_url?: string | null;
    content_markdown?: string | null;
    duration_minutes?: number;
  } | null;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  moduleId,
  initialData,
}) => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [contentMarkdown, setContentMarkdown] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setVideoUrl(initialData.video_url || '');
      setContentMarkdown(initialData.content_markdown || '');
      setDurationMinutes(initialData.duration_minutes || 10);
    } else {
      setTitle('');
      setSlug('');
      setVideoUrl('');
      setContentMarkdown('');
      setDurationMinutes(10);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload = {
        module_id: moduleId,
        title,
        slug: generatedSlug,
        video_url: videoUrl || 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: contentMarkdown,
        duration_minutes: durationMinutes,
      };

      if (initialData?.id && !initialData.id.startsWith('lesson-')) {
        const { error: updateErr } = await (supabase.from('lessons') as any)
          .update(payload)
          .eq('id', initialData.id);

        if (updateErr) {
          setError(updateErr.message);
          setLoading(false);
          return;
        }
      } else {
        const { error: insertErr } = await (supabase.from('lessons') as any).insert({
          ...payload,
          resources: [],
        });

        if (insertErr) {
          setError(insertErr.message);
          setLoading(false);
          return;
        }
      }

      onSuccess({ ...payload, id: initialData?.id || 'new-id' });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-level-2 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
          <h3 className="font-headline text-xl font-bold text-on-surface">
            {initialData ? '✏️ Editar Lección (Admin)' : '➕ Agregar Lección (Admin)'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
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
            <label className="block font-semibold text-on-surface mb-1">Título de la Lección</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. 1. Filosofía Lean y los 8 Desperdicios"
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-on-surface mb-1">Slug (URL amigable)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="introduccion"
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-1">Duración Estimada (Minutos)</label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-on-surface mb-1">URL de Video (YouTube/Vimeo/Embed)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube-nocookie.com/embed/..."
              className="w-full p-2.5 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-on-surface">Guía Teórica & Contenido (Editor WordPress / Markdown)</label>
              <span className="text-[11px] text-primary">Soporta # Títulos, **negrita**, *listas y citas</span>
            </div>
            <textarea
              rows={12}
              required
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              placeholder="Escribe el contenido detallado de la clase en formato Markdown..."
              className="w-full p-3 rounded-lg border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary font-mono text-xs leading-relaxed"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-container-high cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-on-primary-fixed-variant disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'Guardando Cambios...' : 'Guardar Lección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
