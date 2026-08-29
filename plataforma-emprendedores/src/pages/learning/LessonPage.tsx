import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LessonEditorModal } from '../../components/learning/LessonEditorModal';
import { VideoPlayer } from '../../components/learning/VideoPlayer';
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
  const [activeTab, setActiveTab] = useState<'lecture' | 'video' | 'resources'>('lecture');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLessonData, setEditingLessonData] = useState<LessonData | null>(null);

  // Reliable completion state
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(3);

  const fetchLessonAndCourse = async () => {
    const targetFallback =
      FALLBACK_LESSONS.find((l) => l.slug === lessonSlug) || FALLBACK_LESSONS[0];
    setCurrentLesson(targetFallback);

    try {
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
            setTotalCount(lessonsData.length);

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

            setIsLessonCompleted(!!completedMap[target.id]);
            const doneLessons = Object.values(completedMap).filter(Boolean).length;
            setCompletedCount(doneLessons);

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
            return;
          }
        }
      }

      // Fallback behavior
      setTotalCount(FALLBACK_LESSONS.length);
      const fallbackSyl: SyllabusItem[] = FALLBACK_LESSONS.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        type: `Lectura & Video • ${l.duration_minutes} min`,
        completed: l.id === 'lesson-1',
        active: l.slug === targetFallback.slug,
      }));

      fallbackSyl.push({
        id: 'quiz-module-1',
        title: 'Cuestionario Evaluativo del Módulo',
        slug: 'quiz-module-1',
        type: 'Evaluación • 10 pts',
        completed: false,
        active: false,
        isQuiz: true,
      });

      setSyllabus(fallbackSyl);
      setIsLessonCompleted(targetFallback.id === 'lesson-1');
    } catch (err) {
      console.error('Error loading lesson page:', err);
    }
  };

  useEffect(() => {
    fetchLessonAndCourse();
  }, [courseSlug, lessonSlug, user]);

  // Toggle "Mark as Completed" with reliable persistence
  const handleToggleCompletion = async () => {
    if (!currentLesson) return;
    const newStatus = !isLessonCompleted;
    setIsLessonCompleted(newStatus);

    // Update syllabus state immediately
    setSyllabus((prev) =>
      prev.map((item) => (item.id === currentLesson.id ? { ...item, completed: newStatus } : item))
    );

    // Update counts
    setCompletedCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));

    if (user && !currentLesson.id.startsWith('lesson-')) {
      try {
        await (supabase.from('user_lesson_progress') as any).upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error('Error toggling lesson completion in Supabase:', err);
      }
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

  // Find previous and next lesson for navigation
  const currentIndex = syllabus.findIndex((item) => item.slug === currentLesson?.slug);
  const prevLesson = currentIndex > 0 ? syllabus[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < syllabus.length - 1 ? syllabus[currentIndex + 1] : null;

  const progressPercentage = Math.min(100, Math.round((completedCount / totalCount) * 100));

  const resourcesList =
    Array.isArray(currentLesson?.resources) && currentLesson.resources.length > 0
      ? currentLesson.resources
      : [
          { title: 'Plantilla de Diagnóstico 5S (Excel)', size: '1.2 MB', type: 'XLSX' },
          { title: 'Matriz de Identificación TIMWOODS (PDF)', size: '2.4 MB', type: 'PDF' },
        ];

  return (
    <DashboardLayout title="Academia - RutaPyme">
      {/* Clean Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{course?.title || 'Academia RutaPyme'}</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span>{currentModule?.title || 'Módulo 1'}</span>
          </nav>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            {currentLesson?.title}
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenEditModal}
                className="px-3.5 py-2 bg-surface-container-high border border-outline-variant text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Editar Lección
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-highest transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Nueva Lección
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/aprende/quiz/quiz-module-1')}
            className="px-4 py-2 bg-tertiary-container text-on-tertiary font-bold text-xs rounded-xl hover:bg-tertiary transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            Quiz del Módulo
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 gap-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-outline-variant/30 gap-2 bg-surface-container-lowest p-2 rounded-2xl border shadow-level-1">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'lecture'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">menu_book</span>
              Lectura & Guía Teórica
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Clase Audiovisual
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">folder_open</span>
              Recursos ({resourcesList.length})
            </button>
          </div>

          {/* Tab 1: Lecture Content */}
          {activeTab === 'lecture' && (
            <article className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 md:p-10 border border-outline-variant/20 space-y-6">
              <div className="flex items-center justify-between text-xs text-on-surface-variant pb-4 border-b border-outline-variant/30">
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base">schedule</span> {currentLesson?.duration_minutes || 10} min de lectura
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base">person</span> Prof. Carlos Mendoza
                </span>
              </div>

              <div className="pt-2">
                <MarkdownRenderer content={currentLesson?.content_markdown || ''} />
              </div>
            </article>
          )}

          {/* Tab 2: Video Content with Privacy Player */}
          {activeTab === 'video' && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 border border-outline-variant/20 space-y-4">
              <VideoPlayer
                videoUrl={currentLesson?.video_url}
                title={currentLesson?.title}
                durationMinutes={currentLesson?.duration_minutes}
              />
            </div>
          )}

          {/* Tab 3: Resources */}
          {activeTab === 'resources' && (
            <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 md:p-8 border border-outline-variant/20 space-y-4">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">
                Archivos y Materiales de la Lección
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {resourcesList.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-between hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shadow-sm">
                        {res.type || 'DOC'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{res.title}</p>
                        <p className="text-xs text-on-surface-variant">{res.size || '1.0 MB'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Descargando recurso: ${res.title}`)}
                      className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-on-primary transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Completion & Navigation Footer */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 border border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Mark as Completed Toggle Button */}
            <button
              onClick={handleToggleCompletion}
              className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isLessonCompleted
                  ? 'bg-tertiary text-on-tertiary hover:bg-tertiary-container'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isLessonCompleted ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              {isLessonCompleted ? '✓ Lección Completada' : 'Marcar Lección como Completada'}
            </button>

            {/* Prev / Next Navigation */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              {prevLesson && !prevLesson.isQuiz && (
                <button
                  onClick={() => navigate(`/aprende/curso/${courseSlug || 'lean-manufacturing'}/leccion/${prevLesson.slug}`)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Anterior
                </button>
              )}

              {nextLesson && (
                <button
                  onClick={() => {
                    if (nextLesson.isQuiz) {
                      navigate('/aprende/quiz/quiz-module-1');
                    } else {
                      navigate(`/aprende/curso/${courseSlug || 'lean-manufacturing'}/leccion/${nextLesson.slug}`);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-on-primary-fixed-variant transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>{nextLesson.isQuiz ? 'Ir al Quiz del Módulo' : 'Siguiente Lección'}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Syllabus & Course Progress */}
        <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
          
          {/* Progress Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 border border-outline-variant/20 space-y-4">
            <h3 className="font-headline text-base font-bold text-on-surface">
              Progreso del Curso
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>{completedCount} de {totalCount} lecciones</span>
                <span className="text-tertiary font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Syllabus Items Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 p-6 border border-outline-variant/20 space-y-4">
            <h3 className="font-headline text-base font-bold text-on-surface pb-2 border-b border-outline-variant/30">
              {course?.title || 'Temario del Curso'}
            </h3>

            <div className="space-y-2">
              {syllabus.map((item) => {
                let badgeStyle = 'bg-surface-container-high border-outline-variant text-outline';
                let iconName = 'lock';

                if (item.completed) {
                  badgeStyle = 'bg-tertiary text-on-tertiary';
                  iconName = 'check';
                } else if (item.active) {
                  badgeStyle = 'bg-primary text-on-primary ring-2 ring-primary/20';
                  iconName = 'play_arrow';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isQuiz) {
                        navigate('/aprende/quiz/quiz-module-1');
                      } else {
                        navigate(`/aprende/curso/${courseSlug || 'lean-manufacturing'}/leccion/${item.slug}`);
                      }
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      item.active
                        ? 'bg-surface-container-highest border border-primary/40 shadow-sm'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${badgeStyle}`}>
                        <span className="material-symbols-outlined text-[14px]">{iconName}</span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          item.active
                            ? 'text-primary font-bold'
                            : item.completed
                            ? 'text-on-surface'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[11px] text-outline font-medium">{item.type}</span>
                    </div>
                  </div>
                );
              })}
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
