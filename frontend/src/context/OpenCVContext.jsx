'use client';

import { createContext, useContext, useState } from 'react';

const OpenCVContext = createContext(null);

export const OpenCVProvider = ({ children }) => {
  const [cv, setCv] = useState(null);

  return (
    <OpenCVContext.Provider value={{ cv, setCv }}>
      {children}
    </OpenCVContext.Provider>
  );
};

export const useOpenCV = () => useContext(OpenCVContext);
