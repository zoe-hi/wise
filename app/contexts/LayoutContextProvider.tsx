"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContentContextType {
  pageBackPath: string;
  setPageBackPath: (content: string) => void;
}

const LayoutContext = createContext<LayoutContentContextType| undefined>(undefined);

export function LayoutContextProvider({ children }: { children: React.ReactNode }) {
  const [pageBackPath, setPageBackPath] = useState("");

  return (
    <LayoutContext.Provider value={{ pageBackPath, setPageBackPath }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContent() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutContextProvider');
  }
  return context;
}
