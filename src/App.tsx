import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/global.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { TransactionForm } from './pages/Transaction/TransactionForm';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { NotFoundPage } from './pages/NotFound';
import { ShoppingListPage } from './pages/ShoppingList/ShoppingListPage';
import { AgendaPage } from './pages/Agenda/AgendaPage';
import { ButlerAIPage } from './pages/ButlerAI/ButlerAIPage';
import { LoadingProvider } from './contexts/LoadingContext';
import { SplashScreen } from './components/SplashScreen';
import { useEffect, useState } from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <AuthProvider>
            <LoadingProvider>
              <BrowserRouter>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <MainLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route path="" element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="transaction/new" element={<ErrorBoundary><TransactionForm /></ErrorBoundary>} />
                    <Route path="transaction/edit/:id" element={<ErrorBoundary><TransactionForm /></ErrorBoundary>} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="shopping-list" element={<ShoppingListPage />} />
                    <Route path="agenda" element={<AgendaPage />} />
                    <Route path="butler-ai" element={<ButlerAIPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </LoadingProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App;