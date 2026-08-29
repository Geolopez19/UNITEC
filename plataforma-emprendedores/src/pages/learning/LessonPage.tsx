import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LessonEditorModal } from '../../components/learning/LessonEditorModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { MarkdownRenderer } from '../../utils/markdown';

interface LessonData {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  video_url: string | null;
  content_markdown: string | null;
  duration_minutes: number;
  resources: any;
  order_index: number;
}

interface SyllabusItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  completed: boolean;
  active: boolean;
  isQuiz?: boolean;
}

const FALLBACK_LESSONS: LessonData[] = [
  {
    id: 'lesson-1',
    module_id: 'mod-1',
    title: '1. Filosofía Lean y los 8 Desperdicios (Muda)',
    slug: 'introduccion',
    video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
    content_markdown: `
## Bloque 1: Filosofía Lean y los 8 Desperdicios (Muda)

### Lectura Conceptual
**Lean Manufacturing** es una filosofía de gestión originada en el Sistema de Producción Toyota (TPS). Su propósito central es **maximizar el valor entregado al cliente final eliminando sistemáticamente el desperdicio (*Muda*)**, la sobrecarga (*Muri*) y la variabilidad (*Mura*).

* **Valor Agregado (VA):** Toda actividad que transforma el producto/servicio y por la cual el cliente está dispuesto a pagar.
* **Desperdicio (Muda):** Todo consumo de recursos que no añade valor.

#### Los 8 Desperdicios Clásicos (TIMWOODS)
1. **Transporte:** Mover materiales sin agregar valor.
2. **Inventario:** Acumulación excesiva de materia prima o producto terminado.
3. **Movimiento:** Desplazamientos innecesarios del personal.
4. **Esperas:** Tiempos muertos esperando materiales o autorizaciones.
5. **Sobreproducción:** Fabricar más o antes de lo requerido (el peor desperdicio).
6. **Sobreprocesamiento:** Pasos adicionales no exigidos por el cliente.
7. **Defectos:** Errores o descartes que consumen horas y material.
8. **Talento No Aprovechado:** No escuchar ni aprovechar las ideas del equipo.
    `,
    duration_minutes: 8,
    resources: [
      { title: 'Matriz de Identificación de Desperdicios (TIMWOODS)', size: '1.4 MB', type: 'PDF' },
      { title: 'Checklist de Verificación de Procesos', size: '650 KB', type: 'XLSX' },
    ],
    order_index: 1,
  },
  {
    id: 'lesson-2',
    module_id: 'mod-1',
    title: '2. Estabilidad Operativa y Metodología 5S',
    slug: 'estabilidad-operativa-5s',
    video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
    content_markdown: `
## Bloque 2: Estabilidad Operativa y Metodología 5S

La metodología **5S** es una técnica de **gestión visual y estandarización del puesto de trabajo** orientada a que cualquier anomalía sea evidente de inmediato.

1. **Seiri (Clasificar):** Separar lo necesario de lo innecesario en el área de trabajo.
2. **Seiton (Ordenar):** Un lugar para cada cosa y cada cosa en su lugar con códigos visuales.
3. **Seiso (Limpiar):** Limpiar e inspeccionar para anticipar fallas de maquinaria y puesto.
4. **Seiketsu (Estandarizar):** Establecer normas y controles visuales auditables.
5. **Shitsuke (Disciplina):** Fomentar el hábito de la mejora continua (Kaizen).
    `,
    duration_minutes: 10,
    resources: [
      { title: 'Plantilla de Auditoría 5S para PYMEs', size: '2.1 MB', type: 'XLSX' },
    ],
    order_index: 2,
  },
  {
    id: 'lesson-3',
    module_id: 'mod-1',
    title: '3. Flujo Continuo, Takt Time y Sistemas Pull (Kanban)',
    slug: 'flujo-continuo-takt-time',
    video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
    content_markdown: `
## Bloque 3: Flujo Continuo y Takt Time

### Conceptos Clave
- **Takt Time:** Ritmo al que el cliente demanda el producto. Se calcula dividiendo el tiempo disponible entre la demanda.
- **Sistema Pull (Kanban):** Producir únicamente cuando el cliente o la siguiente estación lo requiere.
- **Visualización WIP:** Limitar el trabajo en proceso para evitar cuellos de botella.
    `,
    duration_minutes: 12,
    resources: [
      { title: 'Calculadora de Takt Time & Tiempo de Ciclo', size: '980 KB', type: 'XLSX' },
    ],
    order_index: 3,
  },
];

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const { user, isAdmin } = useAuth();

  const [course, setCourse] = useState<any>({
    title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
    slug: 'lean-manufacturing',
  });
  const [currentModule, setCurrentModule] = useState<any>({
    id: 'mod-1',
    title: 'Módulo 1: Filosofía Lean & Estabilidad Operativa',
  });
  const [currentLesson, setCurrentLesson] = useState<LessonData>(FALLBACK_LESSONS[0]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'lecture' | 'resources'>('lecture');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLessonData, setEditingLessonData] = useState<LessonData | null>(null);

  const fetchLessonAndCourse = async () => {
    // 1. Initial instant render with fallback
    const targetFallback =
      FALLBACK_LESSONS.find((l) => l.slug === lessonSlug) || FALLBACK_LESSONS[0];
    setCurrentLesson(targetFallback);

    const initialSyl: SyllabusItem[] = FALLBACK_LESSONS.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      type: `Lectura & Video • ${l.duration_minutes} min`,
      completed: l.id === 'lesson-1',
      active: l.slug === targetFallback.slug,
    }));

    initialSyl.push({
      id: 'quiz-module-1',
      title: 'Cuestionario Evaluativo del Módulo',
      slug: 'quiz-module-1',
      type: 'Evaluación • 10 pts',
      completed: false,
      active: false,
      isQuiz: true,
    });
    setSyllabus(initialSyl);

    try {
      // 2. Non-blocking fetch from Supabase
      const { data: courseData } = await (supabase.from('courses') as any)
        .select('*')
        .eq('slug', courseSlug || 'lean-manufacturing')
        .maybeSingle();

      if (courseData) {
        setCourse(courseData);

        const { data: modulesData } = await (supabase.from('course_modules') as any)
          .select('*')
          .eq('course_id', courseData.id)
          .order('order_index', { ascending: true });

        if (modulesData && modulesData.length > 0) {
          setCurrentModule(modulesData[0]);

          const { data: lessonsData } = await (supabase.from('lessons') as any)
            .select('*')
            .eq('module_id', modulesData[0].id)
            .order('order_index', { ascending: true });

          if (lessonsData && lessonsData.length > 0) {
            const target =
              lessonsData.find((l: LessonData) => l.slug === lessonSlug) || lessonsData[0];
            setCurrentLesson(target);

            let completedMap: Record<string, boolean> = {};
            if (user) {
              const { data: progressData } = await (supabase.from('user_lesson_progress') as any)
                .select('lesson_id, completed')
                .eq('user_id', user.id);

              if (progressData) {
                progressData.forEach((p: any) => {
                  completedMap[p.lesson_id] = p.completed;
                });
              }
            }

            const syl: SyllabusItem[] = lessonsData.map((l: LessonData) => ({
              id: l.id,
              title: l.title,
              slug: l.slug,
              type: l.video_url ? `Video • ${l.duration_minutes} min` : `Lectura • ${l.duration_minutes} min`,
              completed: !!completedMap[l.id],
              active: l.id === target.id,
            }));

            syl.push({
              id: 'quiz-module-1',
              title: 'Cuestionario Evaluativo del Módulo',
              slug: 'quiz-module-1',
              type: 'Evaluación • 10 pts',
              completed: false,
              active: false,
              isQuiz: true,
            });

            setSyllabus(syl);
          }
        }
      }
    } catch (err) {
      console.error('Error loading lesson page:', err);
    }
  };

  useEffect(() => {
    fetchLessonAndCourse();
  }, [courseSlug, lessonSlug, user]);

  const handleMarkAsCompleted = async () => {
    if (!user || !currentLesson) return;
    try {
      await (supabase.from('user_lesson_progress') as any).upsert({
        user_id: user.id,
        lesson_id: currentLesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      setSyllabus((prev) =>
        prev.map((item) => (item.id === currentLesson.id ? { ...item, completed: true } : item))
      );
    } catch (err) {
      console.error('Error marking lesson completed:', err);
    }
  };

  const handleOpenEditModal = () => {
    setEditingLessonData(currentLesson);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingLessonData(null);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (updatedData?: any) => {
    if (updatedData) {
      setCurrentLesson((prev) => ({
        ...prev,
        ...updatedData,
      }));
    }
    fetchLessonAndCourse();
  };

  const resourcesList = Array.isArray(currentLesson?.resources) && currentLesson.resources.length > 0
    ? currentLesson.resources
    : [
        { title: 'Plantilla de Diagnóstico en Excel', size: '1.2 MB', type: 'XLSX' },
        { title: 'Guía Rápida de Identificación de Muda (PDF)', size: '3.5 MB', type: 'PDF' },
      ];

  return (
    <DashboardLayout title="Lección - Academia RutaPyme">
      {/* Header breadcrumb & info */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-tertiary text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{course?.title || 'Academia RutaPyme'}</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span>{currentModule?.title || 'Módulo 1'}</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            {currentLesson?.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {isAdmin && (
            <>
              <button
                onClick={handleOpenEditModal}
                className="px-4 py-2.5 bg-tertiary-container text-on-tertiary font-bold text-xs rounded-xl hover:bg-tertiary transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Editar Lección
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-surface-container-high text-primary font-semibold text-xs rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Nueva Lección
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/aprende/quiz/quiz-module-1')}
            className="px-5 py-2.5 bg-tertiary text-on-tertiary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            Ir al Cuestionario del Módulo
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Lesson Tabs & Content */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-level-1 p-6 md:p-8 flex flex-col min-w-0 border border-outline-variant/20">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-outline-variant/30 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'lecture'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">menu_book</span>
              Lectura & Guía Teórica
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'video'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Clase Audiovisual
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'resources'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">folder_open</span>
              Recursos & Materiales ({resourcesList.length})
            </button>
          </div>

          {/* Tab 1: Lecture Content with Rich Markdown Renderer */}
          {activeTab === 'lecture' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-on-surface-variant pb-4 border-b border-outline-variant/30">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">schedule</span> {currentLesson?.duration_minutes || 10} min de lectura
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">person</span> Prof. Carlos Mendoza
                </span>
                {isAdmin && (
                  <button
                    onClick={handleOpenEditModal}
                    className="ml-auto text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Editar Contenido
                  </button>
                )}
              </div>

              {/* Formatted Rich HTML Markdown Output */}
              <div className="pt-2">
                <MarkdownRenderer content={currentLesson?.content_markdown || ''} />
              </div>
            </div>
          )}

          {/* Tab 2: Video Content */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src={currentLesson?.video_url || 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk'}
                  title={currentLesson?.title || 'Clase Audiovisual'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-xs text-on-surface-variant">
                Video explicativo de la lección "{currentLesson?.title}".
              </p>
            </div>
          )}

          {/* Tab 3: Resources */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
                Archivos y Materiales de la Lección
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {resourcesList.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low flex items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                        {res.type || 'DOC'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{res.title}</p>
                        <p className="text-xs text-on-surface-variant">{res.size || '1.0 MB'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Descargando recurso: ${res.title}`)}
                      className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="mt-10 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleMarkAsCompleted}
              className="w-full sm:w-auto px-5 py-2.5 border border-tertiary text-tertiary font-semibold text-xs rounded-lg hover:bg-tertiary-fixed-dim/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              Marcar Lección como Completada
            </button>

            <button
              onClick={() => navigate('/aprende/quiz/quiz-module-1')}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              Ir al Quiz del Módulo
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Syllabus / Course Progress */}
        <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 border border-outline-variant/20">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">
              {course?.title || 'Temario del Curso'}
            </h3>

            <div className="space-y-1">
              {syllabus.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isQuiz) {
                      navigate('/aprende/quiz/quiz-module-1');
                    } else {
                      navigate(`/aprende/curso/${courseSlug || 'lean-manufacturing'}/leccion/${item.slug}`);
                    }
                  }}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-surface-container-highest border border-primary-fixed-dim'
                      : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.completed ? (
                      <div className="w-5 h-5 rounded-full bg-tertiary text-on-primary flex items-center justify-center text-xs shadow-sm">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      </div>
                    ) : item.active ? (
                      <div className="w-5 h-5 rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center text-outline text-xs">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        item.active
                          ? 'text-primary font-bold'
                          : item.completed
                          ? 'text-on-surface'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[11px] text-outline">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Admin Lesson Editor Modal */}
      {currentModule && (
        <LessonEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          moduleId={currentModule.id}
          initialData={editingLessonData}
        />
      )}
    </DashboardLayout>
  );
};
