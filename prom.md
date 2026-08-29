# 🚀 PROMPT DE INICIALIZACIÓN & PLAN DE TRABAJO PARA ANTIGRAVITY

Actúa como un Desarrollador Full Stack Senior y Arquitecto de Software. Vamos a construir una plataforma web responsive para la gestión y aceleración de microemprendedores utilizando **React (Vite) + TypeScript + Tailwind CSS + Supabase (PostgreSQL, Auth, Storage, Edge Functions)**.

---

## ⚠️ REGLA CRÍTICA DE DISEÑO & FLUJO DE TRABAJO (LEER ATENTAMENTE)

1. **Carpeta de Diseños (`/diseno`):**
   - Todas las referencias visuales, capturas de pantalla, maquetas o especificaciones UI/UX se irán colocando progresivamente en la carpeta raíz llamada:
     📂 `./diseno/`
2. **Espera de Instrucción Explícita:**
   - **NO inventes ni asumas estilos visuales complejos por tu cuenta.**
   - Trabajarás en el diseño visual de cada pantalla **únicamente cuando el usuario te indique la ubicación exacta del archivo dentro de `diseno/`** (por ejemplo: _"Antigravity, toma el diseño de `diseno/dashboard_mobile.png` y hazlo funcional"_).
3. **Conversión a Código Funcional:**
   - En cuanto se indique el archivo de diseño, tu objetivo será replicar fielmente la interfaz visual (paleta, espaciado, tipografía, componentes responsive) y conectarla inmediatamente a la lógica funcional de React y a la base de datos de Supabase.

---

## 🛠️ 1. STACK TECNOLÓGICO Y CONFIGURACIÓN

- **Frontend:** React 18+ con Vite y TypeScript.
- **Estilos:** Tailwind CSS (versión moderna con `@tailwindcss/vite`).
- **Iconografía:** `lucide-react`.
- **Visualización de Datos:** `recharts`.
- **Backend:** Supabase Client (`@supabase/supabase-js`) con Row Level Security (RLS) habilitado.
- **Manejo de Formularios y Estados:** React Hook Form + Zod, React Router DOM v6.

---

## 🗄️ 2. ESQUEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)

El modelo de datos debe soportar multi-tenant aislado por usuario (`user_id = auth.uid()`):

- `profiles`: `id (uuid, PK -> auth.users)`, `business_name`, `current_level (1-4)`, `plan_type ('free' | 'pro_plus')`, `created_at`.
- `diagnostic_responses`: `id`, `user_id`, `answers (jsonb)`, `total_score`, `assigned_level (1-4)`, `created_at`.
- `inventory_items`: `id`, `user_id`, `sku`, `name`, `stock_quantity`, `min_alert_stock`, `cost_price`, `sale_price`, `created_at`.
- `invoices`: `id`, `user_id`, `invoice_number`, `client_name`, `total_amount`, `tax_amount`, `status ('draft' | 'issued' | 'cancelled')`, `created_at`.
- `employees`: `id`, `business_id (FK -> profiles.id)`, `full_name`, `position`, `salary`, `hire_date`, `status ('active' | 'vacation' | 'inactive')`, `created_at`.
- `employee_requests`: `id`, `employee_id (FK -> employees.id)`, `request_type ('vacation' | 'leave' | 'advance')`, `start_date`, `end_date`, `status ('pending' | 'approved' | 'rejected')`, `notes`, `created_at`.
- `lean_lessons`: `id`, `title`, `duration_minutes`, `video_url`, `level_required`.
- `lean_progress`: `id`, `user_id`, `lesson_id`, `completed (boolean)`, `completed_at`.
- `mentorship_sessions`: `id`, `user_id`, `mentor_name`, `scheduled_at`, `notes`, `status ('scheduled' | 'completed' | 'cancelled')`.

---

## 🗺️ 3. PLAN DE EJECUCIÓN MODULAR POR FASES

### 🔹 Fase 0: Setup del Entorno & Supabase Client

- Configurar cliente de Supabase en `src/lib/supabaseClient.ts` leyendo variables de `.env`.
- Configurar rutas principales con `react-router-dom` y Layout base con soporte responsive (Navbar móvil / Sidebar escritorio).

### 🔹 Fase 1: Autenticación, Registro & Diagnóstico Inicial

- Flujo de Auth con Supabase (`signUp`, `signIn`).
- Cuestionario de diagnóstico corto (10 preguntas) sobre nivel de digitalización.
- Algoritmo de asignación de Nivel (1 al 4) y guardado de resultados.

### 🔹 Fase 2: Ruta Personalizada & Módulo de Inventario

- Onboarding modular que sugiere qué módulo activar primero según el nivel obtenido.
- CRUD de inventario, registro de entradas/salidas y banner reactivo de alerta para productos con bajo stock (`stock_quantity <= min_alert_stock`).

### 🔹 Fase 3: Facturación Simple & Gestión de RRHH

- Generador de facturas ordenadas para sustituir el cuaderno manual, con vista/descarga y descuento de stock.
- Módulo de personal: listado de colaboradores, registro de asistencia/turnos y gestión de solicitudes de vacaciones/permisos.

### 🔹 Fase 4: Calculadora de Impuestos & Capacitación Lean

- Calculadora de estimación tributaria basada en ventas registradas del periodo y calendario con recordatorios de fechas clave.
- Sección de microlecciones en video (5-10 min) sobre metodología Lean (reducción de desperdicios, mejora continua) con tracking de completado.

### 🔹 Fase 5: Dashboard Central & Mentoría Pro+

- Dashboard consolidado con métricas de ventas, alertas de stock, estimación de impuestos y avance de nivel.
- Módulo de agendamiento y seguimiento de sesiones mensuales de mentoría para usuarios en plan Pro+.

---

## 🎯 ACCIÓN INICIAL REQUERIDA:

Confirma que has entendido las reglas del proyecto y la directiva sobre la carpeta `diseno/`. Espera la indicación del primer módulo a implementar junto con la ruta de su diseño.
