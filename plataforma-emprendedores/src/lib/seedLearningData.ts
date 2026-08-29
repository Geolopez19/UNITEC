import { supabase } from './supabaseClient';

export async function seedLearningData() {
  try {
    // Check if courses already seeded
    const { data: existingCourses } = await (supabase.from('courses') as any)
      .select('id')
      .eq('slug', 'lean-manufacturing');

    if (existingCourses && existingCourses.length > 0) {
      console.log('Seed data already present in database.');
      return;
    }

    // Define 3 solid courses
    const coursesToInsert = [
      {
        title: 'Fundamentos de Lean Manufacturing & Eliminación de Desperdicios',
        slug: 'lean-manufacturing',
        description: 'Aprende a identificar y eliminar los 8 desperdicios (Muda), aplicar 5S, Takt Time y optimizar procesos en tu empresa.',
        thumbnail_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        level_required: 1,
        order_index: 1,
      },
      {
        title: 'Gestión de Flujo de Caja e Impuestos para PYMEs',
        slug: 'flujo-de-caja',
        description: 'Técnicas esenciales para calcular, pronosticar y optimizar el flujo financiero y preparar tus obligaciones fiscales sin sorpresas.',
        thumbnail_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        level_required: 2,
        order_index: 2,
      },
      {
        title: 'Estrategias de Marketing Digital & Fidelización de Clientes',
        slug: 'marketing-digital',
        description: 'Expande tu alcance y atrae a los clientes ideales con estrategias probadas en redes sociales, contenidos de valor y WhatsApp.',
        thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        level_required: 2,
        order_index: 3,
      },
    ];

    for (const cData of coursesToInsert) {
      const { data: newCourse, error: courseErr } = await (supabase.from('courses') as any)
        .insert(cData)
        .select()
        .single();

      if (courseErr || !newCourse) continue;

      // Module
      let modTitle = 'Módulo 1: Filosofía Lean & Estabilidad Operativa';
      if (cData.slug === 'flujo-de-caja') modTitle = 'Módulo 1: Control Financiero y Salud del Negocio';
      if (cData.slug === 'marketing-digital') modTitle = 'Módulo 1: Atracción de Clientes e Identidad Digital';

      const { data: newModule } = await (supabase.from('course_modules') as any)
        .insert({
          course_id: newCourse.id,
          title: modTitle,
          order_index: 1,
        })
        .select()
        .single();

      if (!newModule) continue;

      // Solid lessons per course
      let lessonsList: any[] = [];
      if (cData.slug === 'lean-manufacturing') {
        lessonsList = [
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
            duration_minutes: 10,
            resources: [
              { title: 'Matriz de Identificación TIMWOODS', size: '1.4 MB', type: 'PDF' },
              { title: 'Checklist de Verificación de Procesos', size: '650 KB', type: 'XLSX' },
            ],
            order_index: 1,
          },
          {
            module_id: newModule.id,
            title: '2. Estabilidad Operativa y Metodología 5S',
            slug: 'estabilidad-operativa-5s',
            video_url: 'https://www.youtube-nocookie.com/embed/J73JpG_8C9s',
            content_markdown: `
## Bloque 2: Estabilidad Operativa y Metodología 5S

La metodología **5S** es una técnica de **gestión visual y estandarización del puesto de trabajo** orientada a que cualquier anomalía sea evidente de inmediato.

1. **Seiri (Clasificar):** Separar lo necesario de lo innecesario en el área de trabajo.
2. **Seiton (Ordenar):** Un lugar para cada cosa y cada cosa en su lugar con códigos visuales.
3. **Seiso (Limpiar):** Limpiar e inspeccionar para anticipar fallas de maquinaria y puesto.
4. **Seiketsu (Estandarizar):** Establecer normas y controles visuales auditables.
5. **Shitsuke (Disciplina):** Fomentar el hábito de la mejora continua (Kaizen).
            `,
            duration_minutes: 12,
            resources: [{ title: 'Plantilla de Auditoría 5S para PYMEs', size: '2.1 MB', type: 'XLSX' }],
            order_index: 2,
          },
          {
            module_id: newModule.id,
            title: '3. Flujo Continuo, Takt Time y Sistemas Pull (Kanban)',
            slug: 'flujo-continuo-takt-time',
            video_url: 'https://www.youtube-nocookie.com/embed/gL2u-m2c858',
            content_markdown: `
## Bloque 3: Flujo Continuo y Takt Time

### Conceptos Clave
- **Takt Time:** Ritmo al que el cliente demanda el producto. Se calcula dividiendo el tiempo disponible entre la demanda.
- **Sistema Pull (Kanban):** Producir únicamente cuando el cliente o la siguiente estación lo requiere.
- **Visualización WIP:** Limitar el trabajo en proceso para evitar cuellos de botella.
            `,
            duration_minutes: 15,
            resources: [{ title: 'Calculadora de Takt Time & Tiempo de Ciclo', size: '980 KB', type: 'XLSX' }],
            order_index: 3,
          },
        ];
      } else if (cData.slug === 'flujo-de-caja') {
        lessonsList = [
          {
            module_id: newModule.id,
            title: '1. Importancia del Flujo de Caja en PYMEs',
            slug: 'introduccion',
            video_url: 'https://www.youtube-nocookie.com/embed/pQ3hN3S8T-s',
            content_markdown: `
## Bloque 1: Estructura del Flujo de Caja

### Lectura Conceptual
El **Flujo de Caja** es el oxigenador real de cualquier microempresa. A diferencia de las ventas totales o la utilidad teórica, mide la liquidez física en caja y banco para cubrir compromisos de corto plazo.

#### Reglas de Oro Financieras
1. **Cobros vs Ventas:** Una venta no cobrada es un préstamo sin intereses al cliente.
2. **Ciclo de Conversión de Efectivo:** Días transcurridos desde que compras materia prima hasta que cobras la factura.
            `,
            duration_minutes: 10,
            resources: [{ title: 'Plantilla de Flujo de Caja Semanal', size: '1.8 MB', type: 'XLSX' }],
            order_index: 1,
          },
          {
            module_id: newModule.id,
            title: '2. Proyección de Ingresos y Egresos a 90 Días',
            slug: 'proyeccion-financiera',
            video_url: 'https://www.youtube-nocookie.com/embed/Q0PZ-G3YtT8',
            content_markdown: `
## Bloque 2: Presupuesto y Proyección Financiera

Aprende a anticipar baches de liquidez construyendo un presupuesto móvil a 90 días.
            `,
            duration_minutes: 15,
            resources: [{ title: 'Guía de Proyección Financiera', size: '1.1 MB', type: 'PDF' }],
            order_index: 2,
          },
          {
            module_id: newModule.id,
            title: '3. Preparación Fiscal y Reserva Tributaria',
            slug: 'impuestos-pyme',
            video_url: 'https://www.youtube-nocookie.com/embed/H0p6-W-zJ10',
            content_markdown: `
## Bloque 3: Estrategia de Reserva Tributaria

Reserva automáticamente entre el 10% y 15% de cada venta cobrada en una sub-cuenta dedicada exclusivamente para el pago de impuestos anuales o trimestrales.
            `,
            duration_minutes: 12,
            resources: [{ title: 'Calendario Fiscal PYME', size: '750 KB', type: 'PDF' }],
            order_index: 3,
          },
        ];
      } else if (cData.slug === 'marketing-digital') {
        lessonsList = [
          {
            module_id: newModule.id,
            title: '1. Definición del Cliente Ideal (Buyer Persona)',
            slug: 'introduccion',
            video_url: 'https://www.youtube-nocookie.com/embed/8w40bW_x23k',
            content_markdown: `
## Bloque 1: Conoce a tu Cliente Ideal

### Lectura Conceptual
Antes de invertir un dólar en pauta publicitaria, debes definir con precisión a tu **Buyer Persona**: quién es, cuáles son sus dolores diarios, qué soluciones busca y qué objeciones tiene antes de comprar.
            `,
            duration_minutes: 10,
            resources: [{ title: 'Plantilla Buyer Persona', size: '1.2 MB', type: 'PDF' }],
            order_index: 1,
          },
          {
            module_id: newModule.id,
            title: '2. Estrategia de Contenido de Valor y Redes Sociales',
            slug: 'estrategia-contenido',
            video_url: 'https://www.youtube-nocookie.com/embed/n4p-L4P5a8s',
            content_markdown: `
## Bloque 2: Parrilla de Contenidos

Organiza una parrilla mensual aplicando la regla **70/30**: 70% contenido que aporta valor y educa, y 30% llamado a la acción directo de venta.
            `,
            duration_minutes: 14,
            resources: [{ title: 'Calendario de Redes Sociales Excel', size: '1.5 MB', type: 'XLSX' }],
            order_index: 2,
          },
          {
            module_id: newModule.id,
            title: '3. Retención, Fidelización y Ventas por WhatsApp Business',
            slug: 'fidelizacion',
            video_url: 'https://www.youtube-nocookie.com/embed/T60sP_6vY40',
            content_markdown: `
## Bloque 3: Ventas por WhatsApp Business

Configura respuestas rápidas, catálogos digitales y listas de difusión segmentadas para convertir conversaciones casuales en clientes recurrentes.
            `,
            duration_minutes: 12,
            resources: [{ title: 'Guía de Ventas por WhatsApp', size: '890 KB', type: 'PDF' }],
            order_index: 3,
          },
        ];
      }

      await (supabase.from('lessons') as any).insert(lessonsList);
    }

    console.log('Seed data successfully seeded for all 3 courses with solid contents and videos!');
  } catch (err) {
    console.error('Unexpected error in seedLearningData:', err);
  }
}
