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

// Course-specific distinct fallback content with rich text & solid videos
const COURSE_FALLBACKS: Record<string, { title: string; moduleTitle: string; lessons: LessonData[] }> = {
  'lean-manufacturing': {
    title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
    moduleTitle: 'Módulo 1: Filosofía Lean & Estabilidad Operativa',
    lessons: [
      {
        id: 'lean-1',
        module_id: 'mod-lean',
        title: '1. Filosofía Lean y los 8 Desperdicios (Muda)',
        slug: 'introduccion',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Filosofía Lean y los 8 Desperdicios (Muda)

## 📌 Introducción y Principios Fundamentales
La filosofía **Lean Manufacturing** nació en Japón dentro del Sistema de Producción Toyota (TPS) con un propósito inequívoco: **entregar la máxima calidad al cliente en el menor tiempo posible, eliminando todo aquello que consuma recursos sin agregar valor real.**

---

## 🎯 ¿Qué es el Valor Agregado vs Desperdicio?
* **Valor Agregado (VA):** Es toda actividad que transforma físicamente el producto o servicio y por la cual el cliente final está genuinamente dispuesto a pagar.
* **Desperdicio (*Muda*):** Cualquier tarea, movimiento, tiempo muerto o recurso consumido que no incrementa el valor percibido por el cliente.

---

## 🔍 Los 8 Desperdicios Clásicos en PYMEs (Metodología TIMWOODS)

1. **🚚 Transporte Innecesario:** Trasladar cajas, materia prima o carpetas de un piso a otro sin transformar el producto.
2. **📦 Inventario Excesivo:** Materia prima paralizada o producto terminado guardado en almacén que congela el capital de trabajo.
3. **🏃 Movimiento Innecesario:** Colaboradores caminando largas distancias para buscar herramientas o folletos.
4. **⏳ Tiempos de Espera:** Empleados o máquinas paralizadas esperando firmas de aprobación o llegada de suministros.
5. **📈 Sobreproducción (El Peor Desperdicio):** Fabricar más de lo demandado o antes de tiempo. Genera todos los demás desperdicios.
6. **⚙️ Sobreprocesamiento:** Agregar acabados, empaques o pasos complejos que el cliente no solicitó ni valora.
7. **❌ Defectos y Reprocesos:** Artículos mal confeccionados o errores en presupuestos que requieren horas de corrección.
8. **💡 Talento No Aprovechado:** No escuchar las ideas de mejora continua de los colaboradores que ejecutan la tarea diaria.

---

## 🛠️ Plan de Acción Inmediato para tu Empresa
* **Paso 1:** Camina por tu taller o negocio con ojos Lean (Gemba Walk).
* **Paso 2:** Identifica los 2 desperdicios más graves de tu operación diaria.
* **Paso 3:** Cuantifica el tiempo o dinero que pierdes mensualmente por ellos y diseña un plan de choque.
        `,
        duration_minutes: 12,
        resources: [
          { title: 'Matriz de Diagnóstico TIMWOODS (PDF)', size: '1.4 MB', type: 'PDF' },
          { title: 'Hoja de Registro Gemba Walk (Excel)', size: '650 KB', type: 'XLSX' },
        ],
        order_index: 1,
      },
      {
        id: 'lean-2',
        module_id: 'mod-lean',
        title: '2. Estabilidad Operativa y Metodología 5S',
        slug: 'estabilidad-operativa-5s',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Metodología 5S y Estandarización Visual

## 📌 ¿Por qué implementar 5S en tu Negocio?
La metodología **5S** no es un simple programa de aseo; es un **sistema de gestión visual y estandarización operativa** diseñado para que cualquier anomalía, falta de insumo o falla en el proceso sea evidente a simple vista en menos de 5 segundos.

---

## 📋 Las 5 Etapas del Sistema

### 1️⃣ Seiri (Clasificar / Descartar)
* **Objetivo:** Separar lo útil de lo inútil en la zona de trabajo.
* **Acción:** Aplica la "Tarjeta Roja" a todo objeto que no se haya usado en los últimos 30 días.

### 2️⃣ Seiton (Ordenar / Organizar)
* **Objetivo:** *Un lugar para cada cosa y cada cosa en su lugar.*
* **Acción:** Define ubicaciones fijas con etiquetas, códigos de colores o siluetas marcadas.

### 3️⃣ Seiso (Limpiar e Inspeccionar)
* **Objetivo:** La limpieza es inspección. Detectar fugas de aceite, desgaste de cables o acumulación de polvo antes de que causen averías.

### 4️⃣ Seiketsu (Estandarizar)
* **Objetivo:** Crear instructivos visuales y listas de cotejo diarias para mantener los primeros 3 pasos.

### 5️⃣ Shitsuke (Disciplina y Hábito)
* **Objetivo:** Convertir la metodología en una cultura colectiva mediante auditorías periódicas y reconocimientos al equipo.
        `,
        duration_minutes: 15,
        resources: [
          { title: 'Plantilla de Auditoría 5S para PYMEs', size: '2.1 MB', type: 'XLSX' },
          { title: 'Formulario de Tarjeta Roja (PDF)', size: '450 KB', type: 'PDF' },
        ],
        order_index: 2,
      },
      {
        id: 'lean-3',
        module_id: 'mod-lean',
        title: '3. Flujo Continuo, Takt Time y Sistemas Pull',
        slug: 'flujo-continuo-takt-time',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Flujo Continuo y Takt Time

## ⏱️ ¿Qué es el Takt Time?
El **Takt Time** es el ritmo o "latido del corazón" al que tu empresa debe producir para satisfacer exactamente la demanda del cliente sin generar sobreproducción ni desabastecimiento.

**Takt Time = Tiempo Operativo Disponible / Demanda del Cliente**

---

## 🔄 Sistema Pull vs Push
* **Sistema Push (Empujar):** Fabricar basándose en estimaciones o intuición. Produce inventario ocioso y cuellos de botella.
* **Sistema Pull (Jalar / Kanban):** Producir únicamente cuando el cliente final o la siguiente estación solicita una unidad.

---

## 💡 Beneficios de Reducir el Lead Time
1. Menos capital atado en inventarios.
2. Entregas 3 veces más rápidas al cliente.
3. Detección inmediata de piezas defectuosas.
        `,
        duration_minutes: 15,
        resources: [
          { title: 'Calculadora de Takt Time & Tiempo de Ciclo', size: '980 KB', type: 'XLSX' },
        ],
        order_index: 3,
      },
    ],
  },
  'flujo-de-caja': {
    title: 'Gestión de Flujo de Caja e Impuestos para PYMEs',
    moduleTitle: 'Módulo 1: Control Financiero y Salud del Negocio',
    lessons: [
      {
        id: 'caja-1',
        module_id: 'mod-caja',
        title: '1. Importancia del Flujo de Caja en PYMEs',
        slug: 'introduccion',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Fundamentos de Flujo de Caja para Microempresas

## 💡 El Mito de las Ventas vs La Realidad de la Caja
Muchos emprendedores quiebran teniendo ventas récord. ¿Por qué ocurre esto? Porque **la utilidad contable es una estimación teórica, pero el Flujo de Caja es el dinero líquido real disponible en tu cuenta para pagar la nómina y los proveedores mañana.**

---

## 📊 Estructura Básica del Estado de Flujo de Caja

1. **Entradas Operativas (+):** Cobros efectivos de clientes por ventas al contado y recuperación de facturas a crédito.
2. **Salidas Operativas (-):** Compras de insumos, pago de salarios, alquileres, servicios y transporte.
3. **Flujo Neto de Caja (=):** La diferencia resultante. Si es negativo durante 2 meses consecutivos, el negocio entra en zona de riesgo crítico.

---

## 🚀 3 Reglas de Oro para Proteger tu Liquidez
* **Regla 1:** Cobra rápido y negocia plazos de pago más amplios con tus proveedores.
* **Regla 2:** Separa tajantemente las finanzas personales de las finanzas del negocio (asígnate un sueldo fijo).
* **Regla 3:** Revisa tu saldo de caja semanalmente, no al final del mes.
        `,
        duration_minutes: 14,
        resources: [
          { title: 'Plantilla de Flujo de Caja Semanal en Excel', size: '1.8 MB', type: 'XLSX' },
        ],
        order_index: 1,
      },
      {
        id: 'caja-2',
        module_id: 'mod-caja',
        title: '2. Proyección de Ingresos y Egresos a 90 Días',
        slug: 'proyeccion-financiera',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Proyección Financiera a 90 Días

## 📈 ¿Por qué proyectar a 90 días?
Un presupuesto de caja a 90 días te permite ver los baches o huecos de liquidez **antes de que sucedan**, dándote tiempo para negociar con proveedores o impulsar ofertas de cobro anticipado.

---

## 🛠️ Pasos para Construir tu Presupuesto Móvil
1. **Listar Gastos Fijos Inamovibles:** Alquiler, nómina base, energía, internet.
2. **Estimar Cobros Reales a Crédito:** Ajusta por el porcentaje de morosidad histórico de tus clientes.
3. **Establecer un Fondo de Emergencia:** Equivalente a mínimo 1 mes de costos fijos.
        `,
        duration_minutes: 16,
        resources: [
          { title: 'Guía de Proyección Financiera (PDF)', size: '1.1 MB', type: 'PDF' },
        ],
        order_index: 2,
      },
      {
        id: 'caja-3',
        module_id: 'mod-caja',
        title: '3. Preparación Fiscal y Reserva Tributaria',
        slug: 'impuestos-pyme',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Estrategia de Reserva Tributaria para PYMEs

## 🏛️ Evita Sorpresas Fiscales
Uno de los errores más comunes en microempresas es utilizar el dinero retenido por impuestos (como el ISV/IVA recaudado) para pagar gastos operativos del día a día.

---

## 💡 La Estrategia del 15% Automático
* Cada vez que recibas un pago de un cliente, transfiere inmediatamente el **15% del valor retenido** a una cuenta bancaria secundaria o sub-cuenta de ahorro.
* Al llegar la fecha de declaración trimestral o anual, tendrás el dinero 100% disponible sin recurrir a préstamos de emergencia.
        `,
        duration_minutes: 12,
        resources: [
          { title: 'Calendario Fiscal & Plantilla de Ahorro Tributario', size: '750 KB', type: 'PDF' },
        ],
        order_index: 3,
      },
    ],
  },
  'marketing-digital': {
    title: 'Estrategias de Marketing Digital & Fidelización de Clientes',
    moduleTitle: 'Módulo 1: Atracción de Clientes e Identidad Digital',
    lessons: [
      {
        id: 'mkt-1',
        module_id: 'mod-mkt',
        title: '1. Definición del Cliente Ideal (Buyer Persona)',
        slug: 'introduccion',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Definición del Buyer Persona para PYMEs

## 🎯 ¿Por qué definir a tu Cliente Ideal?
Publicitar "para todo el mundo" es la forma más rápida de desperdiciar tu presupuesto de marketing. El **Buyer Persona** es una representación semi-ficticia de tu cliente ideal basada en datos reales de tus compradores actuales.

---

## 📋 Los 4 Pilares del Perfil de Cliente
1. **Datos Demográficos:** Edad, ubicación, nivel educativo y ocupación.
2. **Puntos de Dolor (*Pain Points*):** ¿Qué problema urgente o frustración busca resolver tu cliente?
3. **Hábitos Digitales:** ¿Utiliza WhatsApp, Instagram, TikTok o Facebook para informarse?
4. **Propuesta de Valor Personalizada:** ¿Por qué tu producto/servicio es superior a las alternativas del mercado?
        `,
        duration_minutes: 12,
        resources: [
          { title: 'Plantilla Práctica de Buyer Persona (PDF)', size: '1.2 MB', type: 'PDF' },
        ],
        order_index: 1,
      },
      {
        id: 'mkt-2',
        module_id: 'mod-mkt',
        title: '2. Redes Sociales y Contenido de Valor',
        slug: 'estrategia-contenido',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Creación de Contenido de Valor y Redes Sociales

## 📱 La Regla del 70/30 en Contenidos
* **70% Contenido Educativo e Inspiracional:** Consejos, tutoriales de uso, detrás de cámaras e historias de éxito de clientes.
* **30% Oferta Directa de Venta:** Promociones, llamados a la acción (CTA) e invitaciones de compra directas.

---

## 🎬 Estructura de un Video Corto (Reel / TikTok) Exitoso
1. **Gancho (Primeros 3 segundos):** Una pregunta intrigante o afirmación impactante.
2. **Desarrollo del Consejo (15-30 segundos):** Explicación clara y sin rodeos.
3. **Llamado a la Acción (CTA final):** *"Comenta la palabra 'APRENDE' para recibir más información por DM"*.
        `,
        duration_minutes: 15,
        resources: [
          { title: 'Calendario de Contenidos para Redes Sociales', size: '1.5 MB', type: 'XLSX' },
        ],
        order_index: 2,
      },
      {
        id: 'mkt-3',
        module_id: 'mod-mkt',
        title: '3. Estrategias de Retención y Fidelización',
        slug: 'fidelizacion',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
# Guía Maestra: Retención y Ventas por WhatsApp Business

## 💬 El Poder de WhatsApp Business para PYMEs
Conseguir un cliente nuevo cuesta 5 veces más que venderle nuevamente a un cliente satisfecho. WhatsApp Business es el canal con mayor tasa de apertura (+90%) para cerrar ventas repetidas.

---

## 🛠️ Herramientas Clave a Configurar
1. **Respuestas Rápidas (\`/precio\`, \`/horario\`):** Ahorra horas de tipeo respondiendo dudas frecuentes en segundos.
2. **Etiquetas de Clientes:** Organiza a tus contactos en *"Nuevo Cliente"*, *"Pedido Pendiente"*, *"Cliente VIP"*.
3. **Catálogo Digital:** Muestra tus productos directamente en el perfil sin enviar imágenes pesadas.
        `,
        duration_minutes: 14,
        resources: [
          { title: 'Guía de Configuración WhatsApp Business (PDF)', size: '890 KB', type: 'PDF' },
        ],
        order_index: 3,
      },
    ],
  },
};

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const { user, isAdmin } = useAuth();

  const currentSlugKey = courseSlug || 'lean-manufacturing';
  const fallbackData = COURSE_FALLBACKS[currentSlugKey] || COURSE_FALLBACKS['lean-manufacturing'];

  const [course, setCourse] = useState<any>({
    title: fallbackData.title,
    slug: currentSlugKey,
  });
  const [currentModule, setCurrentModule] = useState<any>({
    id: 'mod-1',
    title: fallbackData.moduleTitle,
  });
  const [currentLesson, setCurrentLesson] = useState<LessonData>(fallbackData.lessons[0]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [activeTab, setActiveTab] = useState<'lecture' | 'video' | 'resources'>('lecture');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLessonData, setEditingLessonData] = useState<LessonData | null>(null);

  // Reliable completion state
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(fallbackData.lessons.length);

  const getStorageKey = () => `rutapyme_completed_${user?.id || 'guest'}_${currentSlugKey}`;

  const loadCompletedMapFromStorage = (): Record<string, boolean> => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveCompletedMapToStorage = (map: Record<string, boolean>) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(map));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  };

  const fetchLessonAndCourse = async () => {
    const localCompletedMap = loadCompletedMapFromStorage();

    const targetFallback =
      fallbackData.lessons.find((l) => l.slug === lessonSlug) || fallbackData.lessons[0];
    setCurrentLesson(targetFallback);
    setCourse({ title: fallbackData.title, slug: currentSlugKey });
    setCurrentModule({ id: 'mod-1', title: fallbackData.moduleTitle });

    try {
      // Fetch course from Supabase
      const { data: courseData } = await (supabase.from('courses') as any)
        .select('*')
        .eq('slug', currentSlugKey)
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

            let completedMap: Record<string, boolean> = { ...localCompletedMap };

            if (user) {
              const { data: progressData } = await (supabase.from('user_lesson_progress') as any)
                .select('lesson_id, completed')
                .eq('user_id', user.id);

              if (progressData) {
                progressData.forEach((p: any) => {
                  if (p.completed) completedMap[p.lesson_id] = true;
                });
              }
            }

            const targetDone = !!(completedMap[target.id] || completedMap[target.slug]);
            setIsLessonCompleted(targetDone);

            const syl: SyllabusItem[] = lessonsData.map((l: LessonData) => {
              const isDone = !!(completedMap[l.id] || completedMap[l.slug]);
              return {
                id: l.id,
                title: l.title,
                slug: l.slug,
                type: l.video_url ? `Video • ${l.duration_minutes} min` : `Lectura • ${l.duration_minutes} min`,
                completed: isDone,
                active: l.id === target.id,
              };
            });

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
            const doneCount = syl.filter((s) => s.completed).length;
            setCompletedCount(doneCount);
            return;
          }
        }
      }

      // Course-specific Fallback Behavior
      setTotalCount(fallbackData.lessons.length);
      let completedMap: Record<string, boolean> = { ...localCompletedMap };

      const targetDone = !!(completedMap[targetFallback.id] || completedMap[targetFallback.slug]);
      setIsLessonCompleted(targetDone);

      const fallbackSyl: SyllabusItem[] = fallbackData.lessons.map((l) => {
        const isDone = !!(completedMap[l.id] || completedMap[l.slug]);
        return {
          id: l.id,
          title: l.title,
          slug: l.slug,
          type: `Lectura & Video • ${l.duration_minutes} min`,
          completed: isDone,
          active: l.slug === targetFallback.slug,
        };
      });

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
      const doneCount = fallbackSyl.filter((s) => s.completed).length;
      setCompletedCount(doneCount);
    } catch (err) {
      console.error('Error loading lesson page:', err);
    }
  };

  useEffect(() => {
    fetchLessonAndCourse();
  }, [courseSlug, lessonSlug, user]);

  const handleToggleCompletion = async () => {
    if (!currentLesson) return;
    const newStatus = !isLessonCompleted;
    setIsLessonCompleted(newStatus);

    const currentLocalMap = loadCompletedMapFromStorage();
    if (newStatus) {
      currentLocalMap[currentLesson.slug] = true;
    } else {
      delete currentLocalMap[currentLesson.slug];
    }
    saveCompletedMapToStorage(currentLocalMap);

    let newDoneCount = 0;
    setSyllabus((prev) => {
      const updated = prev.map((item) => {
        if (item.id === currentLesson.id || item.slug === currentLesson.slug) {
          return { ...item, completed: newStatus };
        }
        return item;
      });
      newDoneCount = updated.filter((s) => s.completed).length;
      return updated;
    });

    setCompletedCount(newDoneCount);

    if (user && !currentLesson.id.startsWith('lesson-') && !currentLesson.id.startsWith('lean-') && !currentLesson.id.startsWith('caja-') && !currentLesson.id.startsWith('mkt-')) {
      try {
        await (supabase.from('user_lesson_progress') as any).upsert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error('Error updating lesson progress in Supabase:', err);
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

  const currentIndex = syllabus.findIndex((item) => item.slug === currentLesson?.slug);
  const prevLesson = currentIndex > 0 ? syllabus[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < syllabus.length - 1 ? syllabus[currentIndex + 1] : null;

  const progressPercentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  const resourcesList =
    Array.isArray(currentLesson?.resources) && currentLesson.resources.length > 0
      ? currentLesson.resources
      : [
          { title: 'Plantilla de Diagnóstico en Excel', size: '1.2 MB', type: 'XLSX' },
          { title: 'Guía de Trabajo Práctico (PDF)', size: '2.4 MB', type: 'PDF' },
        ];

  return (
    <DashboardLayout title="Academia - RutaPyme">
      {/* Clean Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-tertiary text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">school</span>
            <span>{course?.title || fallbackData.title}</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span>{currentModule?.title || fallbackData.moduleTitle}</span>
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
                  <span className="material-symbols-outlined text-base">schedule</span> {currentLesson?.duration_minutes || 12} min de lectura
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
                  onClick={() => navigate(`/aprende/curso/${currentSlugKey}/leccion/${prevLesson.slug}`)}
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
                      navigate(`/aprende/curso/${currentSlugKey}/leccion/${nextLesson.slug}`);
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
              {course?.title || fallbackData.title}
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
                        navigate(`/aprende/curso/${currentSlugKey}/leccion/${item.slug}`);
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
