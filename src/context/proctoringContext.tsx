'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ProctoringContextType = {
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;
};

const ProctoringContext = createContext<ProctoringContextType | undefined>(undefined);

export const ProctoringProvider = ({ children }: { children: ReactNode }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  return (
    <ProctoringContext.Provider value={{ stream, setStream }}>
      {children}
    </ProctoringContext.Provider>
  );
};

export const useProctoring = () => {
  const context = useContext(ProctoringContext);
  if (!context) throw new Error('useProctoring must be used within ProctoringProvider');
  return context;
};
