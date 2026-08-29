import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../pages/AuthPage';
import { DiagnosticPage } from '../pages/DiagnosticPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CatalogPage } from '../pages/learning/CatalogPage';
import { LessonPage } from '../pages/learning/LessonPage';
import { QuizPage } from '../pages/learning/QuizPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/diagnostico"
        element={
          <ProtectedRoute requireDiagnostic={false}>
            <DiagnosticPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Learning Platform (LMS) Routes */}
      <Route
        path="/aprende"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aprende/curso/:courseSlug/leccion/:lessonSlug"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <LessonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aprende/quiz/:quizId"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <QuizPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
