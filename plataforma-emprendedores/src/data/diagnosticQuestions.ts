export interface DiagnosticOption {
  text: string;
  points: number; // 0, 3, 7, or 10
}

export interface DiagnosticQuestion {
  id: number;
  category: string;
  question: string;
  description: string;
  options: DiagnosticOption[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    category: 'Control de Inventario',
    question: '¿Cómo gestionas actualmente el inventario de tus productos o insumos?',
    description: 'El control de stock es fundamental para prevenir pérdidas y desabastecimiento.',
    options: [
      { text: 'No llevo control formal o lo calculo visualmente al momento', points: 0 },
      { text: 'Registro las entradas y salidas en cuadernos o libretas', points: 3 },
      { text: 'Utilizo hojas de cálculo (Excel / Google Sheets)', points: 7 },
      { text: 'Utilizo un sistema digital o plataforma con alertas automáticas de bajo stock', points: 10 },
    ],
  },
  {
    id: 2,
    category: 'Ventas y Comprobantes',
    question: '¿Cómo registras las ventas e emites comprobantes a tus clientes?',
    description: 'Un registro estructurado permite conocer la salud financiera en tiempo real.',
    options: [
      { text: 'Solo entrego comprobantes informales o no llevo registro sistemático', points: 0 },
      { text: 'Anoto cada venta en un cuaderno al final del día', points: 3 },
      { text: 'Registro las ventas diariamente en una plantilla de Excel', points: 7 },
      { text: 'Emitimos facturas/recibos digitales y el inventario se descuenta automáticamente', points: 10 },
    ],
  },
  {
    id: 3,
    category: 'Gestión de Clientes',
    question: '¿De qué manera mantienes el contacto y registro de tus clientes?',
    description: 'Conocer a tus clientes facilita la fidelización y repetición de compras.',
    options: [
      { text: 'No guardo información de mis clientes', points: 0 },
      { text: 'Tengo los contactos guardados informalmente en mi teléfono o WhatsApp', points: 3 },
      { text: 'Llevo una lista estructurada en Excel con nombres y contactos', points: 7 },
      { text: 'Utilizo un CRM o base de datos centralizada con historial de compras', points: 10 },
    ],
  },
  {
    id: 4,
    category: 'Recursos Humanos y Colaboradores',
    question: '¿Cómo gestionas a tu personal o colaboradores (si aplica)?',
    description: 'Una administración clara de personal mejora la productividad y el clima laboral.',
    options: [
      { text: 'Trabajo solo(a) o con apoyos informales sin horarios ni salario fijo', points: 0 },
      { text: 'Tengo colaboradores y acordamos tareas y pago de forma verbal', points: 3 },
      { text: 'Llevo un registro básico de asistencia y nómina en papel o Excel', points: 7 },
      { text: 'Tengo personal contratado formalmente con gestión de permisos y pagos en plataforma', points: 10 },
    ],
  },
  {
    id: 5,
    category: 'Impuestos y Cumplimiento Fiscal',
    question: '¿Cómo estimas y preparas tus obligaciones tributarias (impuestos)?',
    description: 'Planificar los impuestos evita multas y sorpresas a fin de mes.',
    options: [
      { text: 'No calculo impuestos hasta que el contador me indica la fecha límite', points: 0 },
      { text: 'Guardo las facturas en una carpeta física para revisarlas a fin de mes', points: 3 },
      { text: 'Calculo estimaciones aproximadas en Excel antes de la fecha de pago', points: 7 },
      { text: 'Cuento con una calculadora/recordatorio tributario en tiempo real según mis ventas', points: 10 },
    ],
  },
  {
    id: 6,
    category: 'Presencia y Canales Digitales',
    question: '¿Qué presencia digital tiene tu emprendimiento actualmente?',
    description: 'Los canales digitales amplían el alcance de tu mercado objetivo.',
    options: [
      { text: 'No tengo presencia en redes ni canales digitales', points: 0 },
      { text: 'Uso un perfil personal o página básica en redes sociales (Facebook/Instagram)', points: 3 },
      { text: 'Cuento con catálogo digital o WhatsApp Business configurado', points: 7 },
      { text: 'Tengo tienda en línea propia o marketplace integrado para ventas', points: 10 },
    ],
  },
  {
    id: 7,
    category: 'Metodología y Mejora Continua (Lean)',
    question: '¿Aplicas alguna metodología para reducir desperdicios o mejorar procesos?',
    description: 'La filosofía Lean ayuda a optimizar costos y tiempos de entrega.',
    options: [
      { text: 'No conozco metodologías de mejora o trabajo por intuición', points: 0 },
      { text: 'Intento corregir errores cuando ocurren sin un método formal', points: 3 },
      { text: 'He leído sobre metodologías agiles y aplico algunos conceptos básicos', points: 7 },
      { text: 'Capacito al equipo constantemente en optimización de procesos (Lean/5S)', points: 10 },
    ],
  },
  {
    id: 8,
    category: 'Presupuesto y Finanzas',
    question: '¿Cuentas con un presupuesto mensual de ingresos y egresos?',
    description: 'El presupuesto proyectado previene problemas de flujo de caja.',
    options: [
      { text: 'Mezclo el dinero personal con el dinero del negocio', points: 0 },
      { text: 'Separo las cuentas pero no tengo un presupuesto formal mensual', points: 3 },
      { text: 'Formulo un presupuesto mensual en Excel y comparo los gastos', points: 7 },
      { text: 'Tengo presupuesto proyectado con alertas de variación de costos e indicadores', points: 10 },
    ],
  },
  {
    id: 9,
    category: 'Medición de Resultados (KPIs)',
    question: '¿Qué tan frecuente revisas los indicadores clave de desempeño de tu negocio?',
    description: 'Lo que no se mide no se puede mejorar.',
    options: [
      { text: 'No mido indicadores o métricas de ventas', points: 0 },
      { text: 'Reviso las ventas totales únicamente a fin de mes', points: 3 },
      { text: 'Analizo métricas semanalmente (producto más vendido, clientes nuevos)', points: 7 },
      { text: 'Monitoreo dashboards en tiempo real con margen de ganancia y recurrencia', points: 10 },
    ],
  },
  {
    id: 10,
    category: 'Acompañamiento y Mentoría',
    question: '¿Recibes asesoría profesional o mentoría para acelerar tu crecimiento?',
    description: 'La orientación experta acorta la curva de aprendizaje en el negocio.',
    options: [
      { text: 'Tomo todas las decisiones de forma autónoma sin asesoría', points: 0 },
      { text: 'Consulto dudas ocasionales con otros emprendedores o familiares', points: 3 },
      { text: 'Asisto a talleres o capacitaciones grupales de aceleración', points: 7 },
      { text: 'Tengo un plan de mentoría personalizada y estructurada mensual', points: 10 },
    ],
  },
];

export function calculateLevelFromScore(totalScore: number): number {
  if (totalScore <= 25) return 1;
  if (totalScore <= 50) return 2;
  if (totalScore <= 75) return 3;
  return 4;
}
