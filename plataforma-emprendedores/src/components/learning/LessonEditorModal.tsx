import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MarkdownRenderer } from '../../utils/markdown';
import { VideoPlayer } from './VideoPlayer';

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
    resources?: any;
  } | null;
}

export const LessonEditorModal: React.FC<LessonEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  moduleId,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'video' | 'resources' | 'general' | 'preview'>('content');
  
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [contentMarkdown, setContentMarkdown] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [resources, setResources] = useState<{ title: string; url: string; type: string }[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setVideoUrl(initialData.video_url || '');
      setContentMarkdown(initialData.content_markdown || '');
      setDurationMinutes(initialData.duration_minutes || 10);
      setResources(Array.isArray(initialData.resources) ? initialData.resources : []);
    } else {
      setTitle('');
      setSlug('');
      setVideoUrl('');
      setContentMarkdown('');
      setDurationMinutes(10);
      setResources([
        { title: 'Plantilla de Diagnóstico en Excel', url: '#', type: 'XLSX' },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const insertSnippet = (snippet: string) => {
    setContentMarkdown((prev) => prev + '\n' + snippet);
  };

  const handleAddResource = () => {
    setResources((prev) => [...prev, { title: 'Nuevo Recurso / Plantilla', url: '#', type: 'PDF' }]);
  };

  const handleRemoveResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    setResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  // Ensure we get or create a valid PostgreSQL UUID for course_module
  const getValidModuleId = async (): Promise<string | null> => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleId);
    if (isUUID) return moduleId;

    // Search for existing real module in Supabase
    const { data: realMod } = await (supabase.from('course_modules') as any)
      .select('id')
      .limit(1)
      .maybeSingle();

    if (realMod && realMod.id) {
      return realMod.id;
    }

    // If no course module exists yet, create course and module
    let courseId = null;
    const { data: realCourse } = await (supabase.from('courses') as any)
      .select('id')
      .limit(1)
      .maybeSingle();

    if (realCourse && realCourse.id) {
      courseId = realCourse.id;
    } else {
      const { data: newCourse } = await (supabase.from('courses') as any)
        .insert({
          title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
          slug: 'lean-manufacturing',
          description: 'Aprende a optimizar procesos en tu empresa.',
          level_required: 1,
        })
        .select('id')
        .single();
      if (newCourse) courseId = newCourse.id;
    }

    if (courseId) {
      const { data: newMod } = await (supabase.from('course_modules') as any)
        .insert({
          course_id: courseId,
          title: 'Módulo 1: Filosofía Lean & Estabilidad Operativa',
          order_index: 1,
        })
        .select('id')
        .single();
      if (newMod) return newMod.id;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validModId = await getValidModuleId();

      const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload = {
        title: title || 'Nueva Lección',
        slug: generatedSlug,
        video_url: videoUrl || null,
        content_markdown: contentMarkdown,
        duration_minutes: durationMinutes,
        resources,
      };

      const isExistingUUID = initialData?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(initialData.id);

      if (isExistingUUID) {
        const { error: updateErr } = await (supabase.from('lessons') as any)
          .update(payload)
          .eq('id', initialData.id);

        if (updateErr) {
          console.error('Error updating lesson:', updateErr);
          setError(updateErr.message);
          setLoading(false);
          return;
        }
      } else if (validModId) {
        const { error: insertErr } = await (supabase.from('lessons') as any).insert({
          ...payload,
          module_id: validModId,
        });

        if (insertErr) {
          console.error('Error inserting lesson:', insertErr);
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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-4xl w-full shadow-level-2 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-tertiary">
              Editor de Lección (Instructor)
            </span>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {initialData?.title ? `Editar: ${initialData.title}` : 'Crear Nueva Lección'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === 'preview' ? 'content' : 'preview')}
              className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {activeTab === 'preview' ? 'edit' : 'visibility'}
              </span>
              {activeTab === 'preview' ? 'Volver a Editar' : 'Vista Previa'}
            </button>

            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-outline-variant/30 bg-background px-6 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'content', label: '📝 Guía Teórica', icon: 'description' },
            { id: 'video', label: '🎬 Video Audiovisual', icon: 'movie' },
            { id: 'resources', label: '📁 Materiales & Recursos', icon: 'attach_file' },
            { id: 'general', label: '⚙️ General & Ajustes', icon: 'settings' },
            { id: 'preview', label: '👁️ Previsualización', icon: 'preview' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="m-6 p-3 bg-error-container text-on-error-container text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab 1: Guía Teórica */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex-wrap gap-2">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">construction</span> Herramientas Rápida de Formato:
                </span>
                <div className="flex gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => insertSnippet('## Título de Sección')}
                    className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-[11px] font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    + H2 Título
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('### Subtítulo')}
                    className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-[11px] font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    + H3 Subtítulo
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('**Texto en Negrita**')}
                    className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-[11px] font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    **Negrita**
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('* Item de lista importante')}
                    className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-[11px] font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    • Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('> "Cita de reflexión o concepto clave"')}
                    className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-[11px] font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                  >
                    "Cita"
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  Contenido en Markdown / Texto Enriquecido
                </label>
                <textarea
                  rows={14}
                  required
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="Escribe la lección aquí usando encabezados (#, ##), listas (*), negritas (**texto**)..."
                  className="w-full p-4 rounded-xl border border-outline-variant bg-background text-on-surface font-mono text-xs leading-relaxed focus:outline-none focus:border-primary shadow-inner"
                ></textarea>
              </div>
            </div>
          )}

          {/* Tab 2: Video */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  URL del Video (YouTube / Vimeo / MP4 Directo)
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Ej. https://www.youtube.com/watch?v=u2bS9EG4btk"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface text-xs focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Se optimizará automáticamente con el reproductor privado libre de anuncios.
                </p>
              </div>

              <div>
                <span className="block text-xs font-bold text-on-surface mb-2">Prueba del Reproductor:</span>
                <VideoPlayer videoUrl={videoUrl} title={title || 'Prueba de Video'} durationMinutes={durationMinutes} />
              </div>
            </div>
          )}

          {/* Tab 3: Recursos */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-on-surface">Lista de Materiales Adjuntos</h4>
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="px-3 py-1.5 bg-primary-container text-on-primary-container font-semibold text-xs rounded-lg hover:bg-primary hover:text-on-primary transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Añadir Material
                </button>
              </div>

              {resources.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic p-4 bg-surface-container-low rounded-xl text-center">
                  No hay materiales ni descargas adjuntas a esta lección.
                </p>
              ) : (
                <div className="space-y-3">
                  {resources.map((res, index) => (
                    <div
                      key={index}
                      className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={res.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        placeholder="Nombre del recurso (Ej. Plantilla Excel 5S)"
                        className="flex-1 p-2 rounded-lg border border-outline-variant bg-background text-xs"
                      />
                      <select
                        value={res.type}
                        onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                        className="p-2 rounded-lg border border-outline-variant bg-background text-xs"
                      >
                        <option value="PDF">PDF</option>
                        <option value="XLSX">Excel (XLSX)</option>
                        <option value="DOCX">Word (DOCX)</option>
                        <option value="LINK">Enlace Web</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="text-error hover:bg-error-container/40 p-1.5 rounded-lg cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Título de la Lección</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. 1. Filosofía Lean y los 8 Desperdicios"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="filosofia-lean"
                    className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Duración Estimada (Minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Live Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-6 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30">
              <div className="border-b border-outline-variant/30 pb-4">
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  Previsualización en Vivo del Estudiante
                </span>
                <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                  {title || 'Título de la Lección'}
                </h2>
              </div>

              {videoUrl && (
                <VideoPlayer videoUrl={videoUrl} title={title} durationMinutes={durationMinutes} />
              )}

              <div className="pt-2">
                <MarkdownRenderer content={contentMarkdown} />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline text-on-surface hover:bg-surface-container-high cursor-pointer font-semibold text-xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-on-primary-fixed-variant shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Guardar Lección</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
