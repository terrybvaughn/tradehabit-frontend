import { createContext, useState, useContext, type FC, type ReactNode } from "react";

interface AnalysisStatusContextValue {
  ready: boolean;
  setReady: (val: boolean) => void;
}

const AnalysisStatusContext = createContext<AnalysisStatusContextValue | undefined>(undefined);

export const AnalysisStatusProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  return (
    <AnalysisStatusContext.Provider value={{ ready, setReady }}>
      {children}
    </AnalysisStatusContext.Provider>
  );
};

export const useAnalysisStatus = () => {
  const ctx = useContext(AnalysisStatusContext);
  if (!ctx) throw new Error("useAnalysisStatus must be used within AnalysisStatusProvider");
  return ctx;
}; 