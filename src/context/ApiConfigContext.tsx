'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiConfigContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

interface ApiConfigProviderProps {
  children: ReactNode;
  apiId: number;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

const API_BASE_URL_KEY = 'apiBaseUrl';
const API_ID_KEY = 'apiId';

// API URL mapping
const apiUrlMapping: Record<number, string> = {
  1: 'https://builder-server-nu.vercel.app/',
  2: 'https://swish-server.vercel.app/',
  3: 'https://oraginic.vercel.app/',
  4: 'https://onno-server.vercel.app/',
  5: 'https://alfredo-server.vercel.app/',
};

export const ApiConfigProvider = ({ children, apiId }: ApiConfigProviderProps) => {
  const selectedApiUrl = apiUrlMapping[apiId] || 'https://builder-server-nu.vercel.app/';
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(selectedApiUrl);

  useEffect(() => {
    // Set the selected API URL and ID immediately
    console.log('Generated website API ID:', apiId);
    console.log('Generated website using API URL:', selectedApiUrl);
    setApiBaseUrlState(selectedApiUrl);
    localStorage.setItem(API_ID_KEY, apiId.toString());
    localStorage.setItem(API_BASE_URL_KEY, selectedApiUrl);
  }, [apiId, selectedApiUrl]);

  const setApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    localStorage.setItem(API_BASE_URL_KEY, url);
  };

  return (
    <ApiConfigContext.Provider value={{ apiBaseUrl, setApiBaseUrl }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return context;
};