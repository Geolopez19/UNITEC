import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface QuizQuestionData {
  id: number;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  feedback: string;
}

const SAMPLE_QUIZ_QUESTIONS: QuizQuestionData[] = [
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

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);

  const currentQ = SAMPLE_QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = SAMPLE_QUIZ_QUESTIONS.length;
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
    SAMPLE_QUIZ_QUESTIONS.forEach((q) => {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    const hasPassed = calculatedScore >= 70;

    setFinalScore(calculatedScore);
    setPassed(hasPassed);
    setIsFinished(true);

    if (user) {
      try {
        await (supabase.from('user_quiz_attempts') as any).insert({
          user_id: user.id,
          quiz_id: quizId || 'quiz-module-1',
          score: calculatedScore,
          passed: hasPassed,
          answers_summary: selectedAnswers,
        });
      } catch (err) {
        console.error('Error saving quiz attempt:', err);
      }
    }
  };

  if (isFinished) {
    return (
      <DashboardLayout title="Resultado de Evaluación">
        <div className="max-w-2xl mx-auto my-12 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-level-2 text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner ${
              passed ? 'bg-tertiary-fixed-dim/20 text-tertiary' : 'bg-error-container text-on-error-container'
            }`}
          >
            <span className="material-symbols-outlined text-5xl">
              {passed ? 'verified' : 'cancel'}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-secondary">
              Evaluación Completada
            </span>
            <h2 className="text-3xl font-bold font-headline text-on-surface">
              Puntaje Obtenido: <span className={passed ? 'text-tertiary' : 'text-error'}>{finalScore}%</span>
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              {passed
                ? '¡Felicidades! Has superado la evaluación del módulo con éxito.'
                : 'No alcanzaste la nota mínima de aprobación (70%). Te recomendamos repasar los contenidos y reintentar.'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentIndex(0);
                setSelectedAnswers({});
                setSubmittedAnswers({});
              }}
              className="flex-1 py-3 border border-outline text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Reintentar Quiz
            </button>

            <button
              onClick={() => navigate('/aprende')}
              className="flex-1 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors cursor-pointer shadow-sm"
            >
              Volver a la Academia
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedOptionId = selectedAnswers[currentQ.id];
  const isConfirmed = submittedAnswers[currentQ.id];

  return (
    <DashboardLayout title="Cuestionario de Evaluación">
      <div className="max-w-3xl mx-auto my-6 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Cuestionario de Evaluación
          </h2>
          <p className="text-xs text-on-surface-variant">
            Módulo 1: Fundamentos de Lean Manufacturing
          </p>
        </div>

        {/* Quiz Card Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-6 md:p-8 border border-outline-variant/20 space-y-6">
          
          {/* Progress Header */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-on-surface-variant uppercase tracking-wider">
                Pregunta {currentIndex + 1} de {totalQuestions}
              </span>
              <span className="text-tertiary font-bold">{progressPercentage}% Completado</span>
            </div>

            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optionStyle = 'border-outline-variant/60 hover:bg-surface-container-low text-on-surface';

              if (isSelected) {
                if (isConfirmed) {
                  optionStyle = opt.isCorrect
                    ? 'border-tertiary bg-tertiary-fixed-dim/20 text-tertiary font-semibold'
                    : 'border-error bg-error-container text-on-error-container font-semibold';
                } else {
                  optionStyle = 'border-primary ring-1 ring-primary bg-surface-container text-primary font-semibold';
                }
              }

              return (
                <label
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${optionStyle}`}
                >
                  <input
                    type="radio"
                    name={`quiz_${currentQ.id}`}
                    checked={isSelected}
                    onChange={() => handleSelectOption(opt.id)}
                    className="mt-1 text-primary focus:ring-primary border-outline-variant h-4 w-4"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{opt.text}</span>
                  </div>
                  {isConfirmed && isSelected && (
                    <span className="material-symbols-outlined text-lg">
                      {opt.isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Explanatory Feedback when confirmed */}
          {isConfirmed && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs space-y-1">
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Retroalimentación Formativa:
              </span>
              <p className="text-on-surface-variant leading-relaxed">{currentQ.feedback}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30">
            <button
              onClick={() => {
                if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
              }}
              disabled={currentIndex === 0}
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Anterior
            </button>

            {!isConfirmed ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={!selectedOptionId}
                className="bg-primary-container text-on-primary-container font-semibold text-xs px-6 py-2.5 rounded-lg hover:bg-primary hover:text-on-primary disabled:opacity-40 transition-colors cursor-pointer"
              >
                Confirmar Respuesta
              </button>
            ) : currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="bg-primary text-on-primary font-semibold text-xs px-6 py-2.5 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Siguiente Pregunta</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                className="bg-tertiary-container text-on-tertiary font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-tertiary transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Finalizar & Ver Resultado</span>
                <span className="material-symbols-outlined text-base">military_tech</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};
