import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../pages/AuthPage';
import { DiagnosticPage } from '../pages/DiagnosticPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CatalogPage } from '../pages/learning/CatalogPage';
import { LessonPage } from '../pages/learning/LessonPage';
import { QuizPage } from '../pages/learning/QuizPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { SalesPage } from '../pages/sales/SalesPage';
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

      {/* Inventory Module Route */}
      <Route
        path="/inventario"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />

      {/* Sales & Invoicing Module Route */}
      <Route
        path="/ventas"
        element={
          <ProtectedRoute requireDiagnostic={true}>
            <SalesPage />
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
