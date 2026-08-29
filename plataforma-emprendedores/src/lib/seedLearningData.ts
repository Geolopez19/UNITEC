import { supabase } from './supabaseClient';

export async function seedLearningData() {
  try {
    // 1. Check if course exists
    const { data: existingCourses } = await (supabase.from('courses') as any)
      .select('id')
      .eq('slug', 'lean-manufacturing');

    if (existingCourses && existingCourses.length > 0) {
      console.log('Seed data already present for lean-manufacturing.');
      return;
    }

    // 2. Insert main course
    const { data: newCourse, error: courseErr } = await (supabase.from('courses') as any)
      .insert({
        title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
        slug: 'lean-manufacturing',
        description: 'Aprende a identificar y eliminar los 8 desperdicios (Muda), aplicar 5S, Takt Time y optimizar procesos en tu empresa.',
        thumbnail_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        level_required: 1,
        order_index: 1,
      })
      .select()
      .single();

    if (courseErr || !newCourse) {
      console.error('Error seeding course:', courseErr);
      return;
    }

    // 3. Insert course module
    const { data: newModule, error: modErr } = await (supabase.from('course_modules') as any)
      .insert({
        course_id: newCourse.id,
        title: 'Módulo 1: Filosofía Lean & Estabilidad Operativa',
        order_index: 1,
      })
      .select()
      .single();

    if (modErr || !newModule) {
      console.error('Error seeding module:', modErr);
      return;
    }

    // 4. Insert lessons
    const lessonsData = [
      {
        module_id: newModule.id,
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
          { title: 'Matriz TIMWOODS en PDF', url: '#' },
          { title: 'Checklist de Desperdicios', url: '#' },
        ],
        order_index: 1,
      },
      {
        module_id: newModule.id,
        title: '2. Estabilidad Operativa y Metodología 5S',
        slug: 'estabilidad-operativa-5s',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
## Bloque 2: Estabilidad Operativa y Metodología 5S

La metodología **5S** es una técnica de **gestión visual y estandarización del puesto de trabajo** orientada a que cualquier anomalía sea evidente de inmediato.

1. **Seiri (Clasificar):** Separar lo necesario de lo innecesario.
2. **Seiton (Ordenar):** Un lugar para cada cosa y cada cosa en su lugar.
3. **Seiso (Limpiar):** Limpiar e inspeccionar para anticipar fallas.
4. **Seiketsu (Estandarizar):** Establecer normas y controles visuales.
5. **Shitsuke (Disciplina):** Fomentar el hábito y la mejora continua.
        `,
        duration_minutes: 10,
        resources: [{ title: 'Auditoría 5S Excel', url: '#' }],
        order_index: 2,
      },
      {
        module_id: newModule.id,
        title: '3. Flujo Continuo, Takt Time y Sistemas Pull (Kanban)',
        slug: 'flujo-continuo-takt-time',
        video_url: 'https://www.youtube-nocookie.com/embed/u2bS9EG4btk',
        content_markdown: `
## Bloque 3: Flujo Continuo y Takt Time

### Conceptos Clave
- **Takt Time:** Ritmo al que el cliente compra. (Tiempo disponible / Demanda requerida).
- **Sistema Pull (Kanban):** Producir únicamente cuando el cliente o el proceso subsiguiente lo solicita.
        `,
        duration_minutes: 12,
        resources: [{ title: 'Calculadora de Takt Time', url: '#' }],
        order_index: 3,
      },
    ];

    await (supabase.from('lessons') as any).insert(lessonsData);

    // 5. Insert Quiz for this course
    const { data: newQuiz } = await (supabase.from('quizzes') as any)
      .insert({
        course_id: newCourse.id,
        title: 'Cuestionario Evaluativo del Módulo Lean Manufacturing',
        min_passing_score: 70,
      })
      .select()
      .single();

    if (newQuiz) {
      // Questions
      const questionsToInsert = [
        {
          quiz_id: newQuiz.id,
          question_text: 'Un ensamblador camina 20 metros de ida y vuelta de forma repetitiva para buscar tornillos a un estante lejano. ¿Qué tipo de desperdicio se presenta principalmente?',
          explanation: 'El movimiento innecesario se refiere al desplazamiento del operador dentro de su estación.',
          order_index: 1,
          options: [
            { option_text: 'A) Defectos', is_correct: false },
            { option_text: 'B) Movimiento innecesario', is_correct: true },
            { option_text: 'C) Sobreprocesamiento', is_correct: false },
            { option_text: 'D) Sobreproducción', is_correct: false },
          ],
        },
        {
          quiz_id: newQuiz.id,
          question_text: '¿Por qué la Sobreproducción es considerada el desperdicio más grave en Lean Manufacturing?',
          explanation: 'Fabricar en exceso satura los almacenes, demanda más transporte, incrementa el costo financiero y oculta defectos.',
          order_index: 2,
          options: [
            { option_text: 'A) Porque satura el espacio y oculta el resto de desperdicios', is_correct: true },
            { option_text: 'B) Porque obliga a las máquinas a trabajar despacio', is_correct: false },
            { option_text: 'C) Porque elimina el mantenimiento', is_correct: false },
            { option_text: 'D) Porque reduce los costos', is_correct: false },
          ],
        },
      ];

      for (const q of questionsToInsert) {
        const { data: insertedQ } = await (supabase.from('quiz_questions') as any)
          .insert({
            quiz_id: q.quiz_id,
            question_text: q.question_text,
            explanation: q.explanation,
            order_index: q.order_index,
          })
          .select()
          .single();

        if (insertedQ) {
          const opts = q.options.map((o) => ({
            question_id: insertedQ.id,
            option_text: o.option_text,
            is_correct: o.is_correct,
          }));
          await (supabase.from('quiz_options') as any).insert(opts);
        }
      }
    }

    console.log('Seed data successfully seeded for LMS (Courses, Modules, Lessons, Quizzes)!');
  } catch (err) {
    console.error('Unexpected error in seedLearningData:', err);
  }
}
