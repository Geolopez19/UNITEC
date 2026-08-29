import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface QuizQuestionData {
  id: string | number;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  feedback: string;
}

const FALLBACK_QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    id: 1,
    question: 'Un ensamblador camina 20 metros de ida y vuelta de forma repetitiva para buscar tornillos a un estante lejano. ¿Qué tipo de desperdicio se presenta principalmente?',
    options: [
      { id: 'A', text: 'A) Defectos', isCorrect: false },
      { id: 'B', text: 'B) Movimiento innecesario', isCorrect: true },
      { id: 'C', text: 'C) Sobreprocesamiento', isCorrect: false },
      { id: 'D', text: 'D) Sobreproducción', isCorrect: false },
    ],
    feedback: 'El movimiento innecesario se refiere al desplazamiento del operador dentro de su estación. El transporte se refiere al traslado de materiales o lotes entre áreas.',
  },
  {
    id: 2,
    question: '¿Por qué la Sobreproducción es considerada el desperdicio más grave en Lean Manufacturing?',
    options: [
      { id: 'A', text: 'A) Porque satura el espacio y oculta el resto de desperdicios (inventario, transporte, defectos)', isCorrect: true },
      { id: 'B', text: 'B) Porque obliga a las máquinas a trabajar a velocidades inferiores a la nominal', isCorrect: false },
      { id: 'C', text: 'C) Porque elimina la necesidad de mantenimiento preventivo', isCorrect: false },
      { id: 'D', text: 'D) Porque reduce automáticamente los costos de entrega', isCorrect: false },
    ],
    feedback: 'Fabricar en exceso satura los almacenes, demanda más transporte, incrementa el costo financiero y oculta defectos que tardarán días o semanas en ser descubiertos.',
  },
  {
    id: 3,
    question: '¿Cuál es el propósito principal de la metodología 5S en la gestión de un negocio?',
    options: [
      { id: 'A', text: 'A) Realizar una limpieza estética antes de inspecciones', isCorrect: false },
      { id: 'B', text: 'B) Gestión visual y estandarización del puesto de trabajo para evidenciar anomalías', isCorrect: true },
      { id: 'C', text: 'C) Comprar herramientas de última generación', isCorrect: false },
      { id: 'D', text: 'D) Reducir la nómina de colaboradores', isCorrect: false },
    ],
    feedback: 'La metodología 5S no es un plan de aseo estético; es una técnica de gestión visual y estandarización que permite identificar desviaciones rápidamente.',
  },
];

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<QuizQuestionData[]>(FALLBACK_QUIZ_QUESTIONS);
  const [quizTitle, setQuizTitle] = useState<string>('Evaluación del Módulo Lean Manufacturing');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string | number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);


  const fetchDynamicQuiz = async () => {
    try {


      // Search quiz by course/id in Supabase
      const { data: quizData } = await (supabase.from('quizzes') as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (quizData) {
        setQuizTitle(quizData.title);

        const { data: qRows } = await (supabase.from('quiz_questions') as any)
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });

        if (qRows && qRows.length > 0) {
          const parsedQuestions: QuizQuestionData[] = await Promise.all(
            qRows.map(async (q: any, idx: number) => {
              const { data: optRows } = await (supabase.from('quiz_options') as any)
                .select('*')
                .eq('question_id', q.id);

              const options = (optRows || []).map((o: any, oIdx: number) => ({
                id: String.fromCharCode(65 + oIdx), // 'A', 'B', 'C'
                text: o.option_text,
                isCorrect: !!o.is_correct,
              }));

              return {
                id: q.id || idx + 1,
                question: q.question_text,
                options,
                feedback: q.explanation || 'Consulta el material teórico para reforzar este concepto.',
              };
            })
          );

          if (parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching quiz dynamically:', err);
    }
  };

  useEffect(() => {
    fetchDynamicQuiz();
  }, [quizId]);

  const currentQ = questions[currentIndex] || FALLBACK_QUIZ_QUESTIONS[0];
  const totalQuestions = questions.length;
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionId: string) => {
    if (submittedAnswers[currentQ.id]) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleConfirmAnswer = () => {
    setSubmittedAnswers((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinishQuiz = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    setFinalScore(score);
    const isPass = score >= 70;
    setPassed(isPass);
    setIsFinished(true);

    if (user) {
      try {
        await (supabase.from('user_quiz_attempts') as any).insert({
          user_id: user.id,
          quiz_id: typeof currentQ.id === 'string' ? currentQ.id : null,
          score,
          passed: isPass,
        });
      } catch (e) {
        console.error('Error recording quiz attempt in Supabase:', e);
      }
    }
  };

  const currentSelected = selectedAnswers[currentQ.id];
  const isSubmitted = submittedAnswers[currentQ.id];
  const correctOption = currentQ.options.find((o) => o.isCorrect);
  const isCorrect = currentSelected === correctOption?.id;

  return (
    <DashboardLayout title="Quiz Evaluativo - Academia">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-level-1">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-tertiary">
              Evaluación del Módulo
            </span>
            <h1 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
              {quizTitle}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-3.5 py-2 rounded-xl border border-outline text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Volver a la Lección
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-on-surface-variant">
            <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {!isFinished ? (
          /* Question Card */
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-level-1 space-y-6">
            <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-snug">
              {currentQ.question}
            </h2>

            {/* Options list */}
            <div className="space-y-3">
              {currentQ.options.map((option) => {
                const isThisSelected = currentSelected === option.id;
                let optionStyle =
                  'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary';

                if (isSubmitted) {
                  if (option.isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold';
                  } else if (isThisSelected && !option.isCorrect) {
                    optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 font-bold';
                  } else {
                    optionStyle = 'border-outline-variant/30 opacity-50 bg-background text-on-surface-variant';
                  }
                } else if (isThisSelected) {
                  optionStyle = 'border-primary bg-primary-container/40 font-bold text-primary ring-2 ring-primary/20';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">{option.id}.</span>
                    <span className="flex-1 leading-relaxed">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Box */}
            {isSubmitted && (
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed space-y-1 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">
                    {isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  {isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
                </div>
                <p>{currentQ.feedback}</p>
              </div>
            )}

            {/* Question Footer Actions */}
            <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
              {!isSubmitted ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!currentSelected}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant disabled:opacity-40 transition-colors shadow-sm cursor-pointer ml-auto"
                >
                  Confirmar Respuesta
                </button>
              ) : (
                <div className="flex justify-end w-full">
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <span>Siguiente Pregunta</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-6 py-2.5 bg-tertiary text-on-tertiary font-bold text-xs rounded-xl hover:bg-tertiary-container transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <span>Finalizar Evaluación</span>
                      <span className="material-symbols-outlined text-base">emoji_events</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-level-1 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-4xl">
                {passed ? 'workspace_premium' : 'sentiment_dissatisfied'}
              </span>
            </div>

            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {passed ? '¡Felicidades, Evaluación Aprobada!' : 'Evaluación Completada'}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {passed
                  ? 'Has demostrado dominio conceptual de este módulo.'
                  : 'Revisa los conceptos teóricos e inténtalo nuevamente para consolidar el conocimiento.'}
              </p>
            </div>

            <div className="p-6 bg-surface-container-low rounded-2xl max-w-xs mx-auto space-y-1">
              <span className="text-xs uppercase font-bold text-on-surface-variant">Calificación Obtenida</span>
              <p className={`text-4xl font-headline font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {finalScore}%
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => {
                  setIsFinished(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setSubmittedAnswers({});
                }}
                className="px-5 py-2.5 border border-outline rounded-xl font-bold text-xs text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                Reintentar Evaluación
              </button>

              <button
                onClick={() => navigate('/aprende')}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant shadow-sm cursor-pointer"
              >
                Volver al Catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
