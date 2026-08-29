# Documentación del Proyecto para Agentes

## Resumen del Proyecto
Plataforma web para gestión y aceleración de microemprendedores (React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase).

## Arquitectura y Conexión de Backend (Supabase)
- **Script SQL Base:** [`db.sql`](file:///c:/Proyecto%20Personales/UNITEC/db.sql) define el esquema completo de PostgreSQL (profiles, diagnostic_responses, inventory_items, inventory_movements, invoices, invoice_items, employees, employee_requests, tax_records, lean_lessons, lean_progress, mentorship_sessions) con RLS y el trigger `on_auth_user_created`.
- **Script SQL LMS:** [`db2.sql`](file:///c:/Proyecto%20Personales/UNITEC/db2.sql) define la infraestructura de la Academia de Aprendizaje (courses, course_modules, lessons, quizzes, quiz_questions, quiz_options, user_lesson_progress, user_quiz_attempts).
- **Cliente Supabase:** [`plataforma-emprendedores/src/lib/supabaseClient.ts`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/lib/supabaseClient.ts) inicializa el cliente tipado leyendo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de `.env`.
- **Tipos TypeScript:** [`plataforma-emprendedores/src/types/database.ts`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/types/database.ts) expone la interfaz `Database` y los tipos individuales de las tablas de `db.sql` y `db2.sql`.

## Módulos Implementados (Fases)
- **Fase 0 - Client & Layout:** Configuración base de cliente Supabase, enrutamiento, layouts (`Sidebar.tsx`, `TopBar.tsx`, `DashboardLayout.tsx`).
- **Fase 1 - Auth & Diagnóstico:** 
  - [`src/pages/AuthPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/AuthPage.tsx): Login y registro con confirmación de correo.
  - [`src/data/diagnosticQuestions.ts`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/data/diagnosticQuestions.ts): 10 preguntas de madurez digital.
  - [`src/pages/DiagnosticPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/DiagnosticPage.tsx): Cuestionario interactivo basado en [`diseno/cuestenario.html`](file:///c:/Proyecto%20Personales/UNITEC/diseno/cuestenario.html).
- **Plataforma de Aprendizaje LMS (Estilo Platzi - Dinámica & Roles):**
  - [`src/pages/learning/CatalogPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/CatalogPage.tsx): Catálogo de cursos dinámico desde Supabase.
  - [`src/pages/learning/LessonPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/LessonPage.tsx): Vista de lección dinámica con video, Markdown, recursos y temario.
  - [`src/pages/learning/QuizPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/QuizPage.tsx): Evaluación interactiva con retroalimentación e inserción de intentos.
  - [`src/components/learning/CourseEditorModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/learning/CourseEditorModal.tsx) y [`LessonEditorModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/learning/LessonEditorModal.tsx): Modales de creación/edición exclusiva para usuarios con rol `admin`.
  - [`src/lib/seedLearningData.ts`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/lib/seedLearningData.ts): Sembrado automático de cursos y lecciones iniciales.

## Reglas de Trabajo
- Las maquetas y diseños de referencia residen en `./diseno/`. Solo se implementará el diseño visual cuando el usuario indique expresamente la ruta del archivo correspondiente en `diseno/`.
