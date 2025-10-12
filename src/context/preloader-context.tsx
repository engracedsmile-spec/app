"use client";

import { Preloader } from '@/components/preloader';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PreloaderContextType {
  preloaderEnabled: boolean;
  setPreloaderEnabled: (enabled: boolean) => void;
  showPreloader: () => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export const usePreloader = () => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error('usePreloader must be used within a PreloaderProvider');
  }
  return context;
};

export const PreloaderProvider = ({ children }: { children: ReactNode }) => {
  const [preloaderEnabled, _setPreloaderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hide preloader whenever the path changes (i.e., navigation completes)
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('preloaderEnabled');
      if (savedPreference !== null) {
        _setPreloaderEnabled(savedPreference === 'true');
      }
    }
  }, []);

  const setPreloaderEnabled = (enabled: boolean) => {
    _setPreloaderEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preloaderEnabled', String(enabled));
    }
  };

  const showPreloader = useCallback(() => {
      if (preloaderEnabled) {
          setIsLoading(true);
      }
  }, [preloaderEnabled]);

  return (
    <PreloaderContext.Provider value={{ preloaderEnabled, setPreloaderEnabled, showPreloader }}>
      {isLoading && <Preloader />}
      {children}
    </PreloaderContext.Provider>
  );
};
