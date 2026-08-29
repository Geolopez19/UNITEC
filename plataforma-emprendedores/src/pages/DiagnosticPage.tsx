import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIAGNOSTIC_QUESTIONS, calculateLevelFromScore } from '../data/diagnosticQuestions';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import logoImg from '../assets/logo.png';

const PILLARS = [
  { id: 1, name: 'Estrategia y Liderazgo', questionIds: [1, 2] },
  { id: 2, name: 'Procesos y Operaciones', questionIds: [3, 4] },
  { id: 3, name: 'Clientes y Mercados', questionIds: [5, 6] },
  { id: 4, name: 'Personas y Cultura', questionIds: [7, 8] },
  { id: 5, name: 'Tecnología e Innovación', questionIds: [9, 10] },
];

export const DiagnosticPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultLevel, setResultLevel] = useState<number | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Determine current pillar
  const currentPillarIndex = Math.floor(currentIndex / 2);
  const currentPillar = PILLARS[currentPillarIndex] || PILLARS[0];

  const handleSelectOption = (points: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Debes estar autenticado para guardar el diagnóstico.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalScore = Object.values(selectedAnswers).reduce((acc, curr) => acc + curr, 0);
      const assignedLevel = calculateLevelFromScore(totalScore);

      // 1. Ensure profile exists and has assigned_level updated
      const { error: profileError } = await (supabase.from('profiles') as any).upsert({
        id: user.id,
        business_name: profile?.business_name || user.user_metadata?.business_name || 'Mi Negocio',
        current_level: assignedLevel,
      });

      if (profileError) {
        console.error('Error updating profile:', profileError.message);
      }

      // 2. Insert into diagnostic_responses
      const { error: diagError } = await (supabase.from('diagnostic_responses') as any).insert({
        user_id: user.id,
        answers: selectedAnswers,
        total_score: totalScore,
        assigned_level: assignedLevel,
      });

      if (diagError) {
        console.error('Error saving diagnostic response:', diagError.message);
      }

      await refreshProfile();
      setResultLevel(assignedLevel);
    } catch (err) {
      console.error('Unexpected error submitting diagnostic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resultLevel !== null) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-level-2 text-center space-y-6">
          <div className="w-20 h-20 bg-tertiary-fixed-dim/20 text-tertiary rounded-full flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-5xl">military_tech</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-tertiary">
              ¡Diagnóstico Completado!
            </span>
            <h2 className="text-3xl font-bold font-headline text-on-surface">
              Te encuentras en el <span className="text-primary">Nivel {resultLevel}</span>
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Hemos adaptado tu <strong>Ruta Personalizada</strong> en la plataforma para acelerar la digitalización y ventas de {profile?.business_name || 'tu emprendimiento'}.
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl text-left space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-on-surface-variant">Emprendimiento:</span>
              <span className="text-on-surface">{profile?.business_name || 'Mi Negocio'}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-on-surface-variant">Nivel Asignado:</span>
              <span className="text-tertiary font-bold">Nivel {resultLevel} de 4</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <span>Ir a Mi Ruta Personalizada & Dashboard</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  const selectedPoint = selectedAnswers[currentQuestion.id];

  return (
    <div className="bg-background text-on-background font-sans antialiased min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1200px] bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden flex flex-col md:flex-row border border-outline-variant/20 min-h-[650px]">
        
        {/* Left Sidebar - Progress / Pillars */}
        <div className="w-full md:w-1/3 bg-surface-container-low p-6 md:p-8 flex flex-col border-r border-outline-variant/30">
          <div className="mb-8">
            <img src={logoImg} alt="RutaPyme Logo" className="h-10 w-auto mb-6 object-contain" />
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
              Diagnóstico de Madurez
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Evalúa el estado actual de tu negocio para recibir recomendaciones personalizadas.
            </p>
          </div>

          {/* Stepper / Pillars */}
          <div className="flex-1 flex flex-col space-y-6">
            {PILLARS.map((pillar, idx) => {
              const isCompleted = currentPillarIndex > idx;
              const isActive = currentPillarIndex === idx;

              return (
                <div key={pillar.id} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-on-tertiary text-sm">check</span>
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full bg-primary-container ring-4 ring-primary-container/20 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-on-primary">{pillar.id}</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-outline-variant bg-surface-container-lowest flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-outline">{pillar.id}</span>
                      </div>
                    )}
                    {idx < PILLARS.length - 1 && (
                      <div
                        className={`w-0.5 h-10 my-1 ${
                          isCompleted ? 'bg-tertiary-container' : 'bg-outline-variant/60'
                        }`}
                      ></div>
                    )}
                  </div>

                  <div className="pt-1">
                    <p
                      className={`text-sm font-semibold ${
                        isActive
                          ? 'text-primary font-bold'
                          : isCompleted
                          ? 'text-on-surface'
                          : 'text-outline'
                      }`}
                    >
                      {pillar.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isCompleted ? 'Completado' : isActive ? 'En progreso' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content Area - Questionnaire */}
        <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col bg-surface-container-lowest justify-between">
          <div>
            {/* Header Status */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-tertiary bg-tertiary-container/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  Pilar {currentPillar.id} de {PILLARS.length} • Pregunta {currentIndex + 1} de {totalQuestions}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {progressPercentage}% Completado
                </span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">
                {currentPillar.name}
              </h3>
              <p className="text-xs text-on-surface-variant">
                Evalúa cómo tu empresa gestiona sus operaciones diarias y la formalidad de sus procesos.
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-8 overflow-hidden">
              <div
                className="bg-tertiary-container h-full rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Questions Area */}
            <div className="space-y-4">
              <div className="mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {currentQuestion.category}
                </span>
                <h4 className="font-headline text-lg font-semibold text-on-surface mt-1">
                  {currentIndex + 1}. {currentQuestion.question}
                </h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  {currentQuestion.description}
                </p>
              </div>

              {/* Option Cards */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedPoint === option.points;
                  return (
                    <label
                      key={idx}
                      onClick={() => handleSelectOption(option.points)}
                      className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all ${
                        isSelected
                          ? 'border-primary ring-1 ring-primary bg-surface-container-low text-on-surface'
                          : 'border-outline-variant/60 hover:bg-surface-container-low/50 text-on-surface'
                      }`}
                    >
                      <div className="flex w-full items-start justify-between">
                        <div className="flex flex-col pr-4">
                          <span className="text-sm font-medium text-on-surface block mb-0.5">
                            {option.text}
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined transition-opacity ml-2 ${
                            isSelected
                              ? 'text-primary opacity-100 font-bold'
                              : 'text-outline-variant opacity-30'
                          }`}
                        >
                          check_circle
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low disabled:opacity-30 transition-colors text-xs font-semibold flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined mr-2 text-base">arrow_back</span>
              Anterior
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedPoint === undefined}
                className="px-6 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-on-primary-fixed-variant disabled:opacity-40 transition-colors text-xs font-semibold shadow-sm flex items-center cursor-pointer"
              >
                Guardar y Siguiente
                <span className="material-symbols-outlined ml-2 text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedPoint === undefined || isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-tertiary-container text-on-tertiary hover:bg-tertiary disabled:opacity-40 transition-colors text-xs font-bold shadow-sm flex items-center cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <span>Finalizar & Calcular Nivel</span>
                    <span className="material-symbols-outlined ml-2 text-base">military_tech</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
