import { createContext, useContext, useState, ReactNode } from 'react';
import { Loading } from '../components/Loading';

interface LoadingContextData {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

interface LoadingProviderProps {
  children: ReactNode;
}

const LoadingContext = createContext<LoadingContextData>({} as LoadingContextData);

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        showLoading,
        hideLoading
      }}
    >
      {children}
      {isLoading && <Loading fullScreen />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error('useLoading deve ser usado dentro de um LoadingProvider');
  }

  return context;
}