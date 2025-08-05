"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import i18n from "i18next";

type Language = "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en"); // Default to English
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return; // Guard for SSR
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage === "en") {
      setLanguageState(savedLanguage);
      setIsRTL(false);
      document.documentElement.dir = "ltr";
      document.documentElement.lang = savedLanguage;
      i18n.changeLanguage(savedLanguage);
    } else {
      setLanguageState("en");
      setIsRTL(false);
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
      i18n.changeLanguage("en");
    }
  }, []);

  // Sync language changes across tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "language" && e.newValue === "en") {
        setLanguageState(e.newValue);
        setIsRTL(false);
        document.documentElement.dir = "ltr";
        document.documentElement.lang = e.newValue;
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setIsRTL(false);
    localStorage.setItem("language", lang);
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage("en");
  };

  const value = useMemo(() => ({ language, setLanguage, isRTL, toggleLanguage }), [language, isRTL]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
