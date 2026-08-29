import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CourseEditorModal } from '../../components/learning/CourseEditorModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { seedLearningData } from '../../lib/seedLearningData';
import { calculateCourseProgress } from '../../utils/progress';

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  level_required: number;
  category: string;
  duration_label: string;
  total_lessons: number;
  progress_percentage: number;
  rating: number;
}

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const sampleCourses: CourseItem[] = [
    {
      id: 'course-1',
      title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
      slug: 'lean-manufacturing',
      description: 'Aprende a identificar y eliminar los 8 desperdicios (Muda), aplicar 5S y optimizar procesos en tu empresa.',
      thumbnail_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      level_required: 1,
      category: 'Estrategia',
      duration_label: '4h 30m',
      total_lessons: 3,
      progress_percentage: calculateCourseProgress(user, 'lean-manufacturing', 3),
      rating: 4.9,
    },
    {
      id: 'course-2',
      title: 'Gestión de Flujo de Caja e Impuestos para PYMEs',
      slug: 'flujo-de-caja',
      description: 'Técnicas esenciales para calcular, pronosticar y optimizar el flujo financiero y preparar tus obligaciones fiscales.',
      thumbnail_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      level_required: 2,
      category: 'Finanzas',
      duration_label: '3h 15m',
      total_lessons: 8,
      progress_percentage: calculateCourseProgress(user, 'flujo-de-caja', 8),
      rating: 4.8,
    },
    {
      id: 'course-3',
      title: 'Estrategias de Marketing Digital & Fidelización de Clientes',
      slug: 'marketing-digital',
      description: 'Expande tu alcance y atrae a los clientes ideales con estrategias probadas en redes sociales y catálogo digital.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      level_required: 2,
      category: 'Marketing',
      duration_label: '5h 00m',
      total_lessons: 12,
      progress_percentage: calculateCourseProgress(user, 'marketing-digital', 12),
      rating: 4.7,
    },
  ];

  const fetchCourses = async () => {
    // Initial render with dynamic progress
    setCourses(sampleCourses);

    try {
      seedLearningData().catch(() => {});

      const { data, error } = await (supabase.from('courses') as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: CourseItem[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description || '',
          thumbnail_url: c.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          level_required: c.level_required || 1,
          category: c.level_required === 1 ? 'Estrategia' : c.level_required === 2 ? 'Finanzas' : 'Marketing',
          duration_label: '4h 00m',
          total_lessons: 3,
          progress_percentage: calculateCourseProgress(user, c.slug, 3),
          rating: 4.9,
        }));
        setCourses(mapped);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      activeCategory === 'all' || course.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="Academia RutaPyme">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">
            Academia RutaPyme
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Potencia tu emprendimiento con cursos guiados diseñados por expertos para la aplicación en el mundo real.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Crear Nuevo Curso
          </button>
        )}
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-surface-container-lowest rounded-xl p-4 shadow-level-1 flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 border border-outline-variant/20">
        <div className="relative w-full sm:w-96 flex-shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-background text-on-surface text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Estrategia', 'Finanzas', 'Marketing'].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'border border-outline-variant bg-transparent text-secondary hover:bg-surface-container-high'
                }`}
              >
                {cat === 'all' ? 'Todos los Cursos' : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Course Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const userLevel = profile?.current_level || 1;
          const isRecommended = userLevel >= course.level_required;
          return (
            <article
              key={course.id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-level-1 flex flex-col group hover:shadow-level-2 transition-all duration-300 border border-outline-variant/20"
            >
              <div className="h-44 bg-surface-container-highest relative overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary px-2.5 py-1 rounded-md font-semibold text-[11px] shadow-sm backdrop-blur-sm">
                  {course.category}
                </div>
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-md font-bold text-[11px] shadow-sm ${
                    isRecommended
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-lowest text-primary'
                  }`}
                >
                  Nivel {course.level_required} {isRecommended ? '• Recomendado' : ''}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="flex-1">
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-2 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {course.progress_percentage > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                      <span>{course.progress_percentage}% Completado</span>
                      <span>En progreso</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full"
                        style={{ width: `${course.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center mt-auto">
                  <span className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                    <span className="material-symbols-outlined text-amber-500 text-base">star</span>
                    {course.rating} ({course.total_lessons} lecciones)
                  </span>

                  <button
                    onClick={() => navigate(`/aprende/curso/${course.slug}/leccion/introduccion`)}
                    className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      course.progress_percentage > 0
                        ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm'
                        : 'border border-primary text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    {course.progress_percentage > 0 ? 'Continuar' : 'Comenzar Curso'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Admin Editor Modal */}
      <CourseEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCourses}
      />
    </DashboardLayout>
  );
};
