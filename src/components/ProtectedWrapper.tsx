import React, { Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedWrapperProps {
  children: React.ReactNode;
}

export const ProtectedWrapper: React.FC<ProtectedWrapperProps> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <ProtectedRoute>{children}</ProtectedRoute>
  </Suspense>
);
