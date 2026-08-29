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
- **Plataforma de Aprendizaje LMS Rediseñada:**
  - [`src/pages/learning/CatalogPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/CatalogPage.tsx): Catálogo de cursos dinámico.
  - [`src/pages/learning/LessonPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/LessonPage.tsx): Vista de lección moderna con navegación inferior, temario visual y marcado de lecciones completadas.
  - [`src/components/learning/VideoPlayer.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/learning/VideoPlayer.tsx): Reproductor de video privado con poster interactivo libre de anuncios.
  - [`src/components/learning/LessonEditorModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/learning/LessonEditorModal.tsx): Editor por pestañas para instructores con previsualización en vivo.
  - [`src/pages/learning/QuizPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/learning/QuizPage.tsx): Evaluaciones interactivas.
- **Módulo de Gestión de Inventario:**
  - [`src/pages/inventory/InventoryPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/inventory/InventoryPage.tsx): Vista principal basada en [`diseno/inventario.html`](file:///c:/Proyecto%20Personales/UNITEC/diseno/inventario.html) con tarjetas KPI, tabla con barras de nivel y filtros por categoría.
  - [`src/components/inventory/ProductModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/inventory/ProductModal.tsx): Modal CRUD para agregar y editar productos.
  - [`src/components/inventory/StockMovementModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/inventory/StockMovementModal.tsx): Modal para reabastecimiento (entradas/salidas) conectado a `inventory_movements`.
- **Módulo de Ventas & Facturación:**
  - [`src/pages/sales/SalesPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/sales/SalesPage.tsx): Vista principal basada en [`diseno/sales.html`](file:///c:/Proyecto%20Personales/UNITEC/diseno/sales.html) con gráfico de tendencia, barras de estado y tabla de transacciones en Córdobas (C$).
  - [`src/components/sales/NewSaleModal.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/components/sales/NewSaleModal.tsx): Modal de registro de ventas rápidas con integración directa a existencias de inventario y facturación.
- **Módulo de Reportes Financieros:**
  - [`src/pages/reports/ReportsPage.tsx`](file:///c:/Proyecto%20Personales/UNITEC/plataforma-emprendedores/src/pages/reports/ReportsPage.tsx): Vista principal basada en [`diseno/reporte.html`](file:///c:/Proyecto%20Personales/UNITEC/diseno/reporte.html) con tarjetas Bento KPI, gráficos de crecimiento, desglose de gastos y exportación a PDF y Excel (CSV).

## Reglas de Trabajo
- Las maquetas y diseños de referencia residen en `./diseno/`. Solo se implementará el diseño visual cuando el usuario indique expresamente la ruta del archivo correspondiente en `diseno/`.
