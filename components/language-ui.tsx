"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLanguage, dictionary, languages, skillLevelDescriptions, translate, type Language, type TranslationKey } from "@/lib/i18n";

const storageKey = "ksb_language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return languages.some((language) => language.value === value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (isLanguage(stored)) setLanguageState(stored);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        setLanguageState(nextLanguage);
        localStorage.setItem(storageKey, nextLanguage);
      },
      t(key, values) {
        return translate(language, key, values);
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context) return context;
  return {
    language: defaultLanguage,
    setLanguage() {},
    t: (key: TranslationKey, values?: Record<string, string | number>) => translate(defaultLanguage, key, values)
  };
}

export function T({ textKey, values }: { textKey: TranslationKey; values?: Record<string, string | number> }) {
  const { t } = useLanguage();
  return <>{t(textKey, values)}</>;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-1 shadow-sm" aria-label="Language">
      {languages.map((item) => (
        <button
          className={`rounded-full px-3 py-1.5 text-xs font-black ${language === item.value ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          key={item.value}
          onClick={() => setLanguage(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function LocalizedOption({ textKey }: { textKey: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(textKey)}</>;
}

export function SkillLevelGuide({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage();
  const items = skillLevelDescriptions[language] ?? skillLevelDescriptions.ja;

  return (
    <details className={`rounded-lg border border-line bg-slate-50 ${compact ? "p-2" : "p-3"}`}>
      <summary className="cursor-pointer text-xs font-black text-slate-700">{t("skillHelpSummary")}</summary>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <div className="rounded-md bg-white px-3 py-2 text-xs leading-5 text-slate-600 ring-1 ring-line" key={item.level}>
            <p className="font-black text-slate-900">{item.label}</p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

export function translatedStatusKey(status: string): TranslationKey {
  if (status === "full") return "statusFull";
  if (status === "finished") return "statusFinished";
  if (status === "cancelled") return "statusCancelled";
  return "statusOpen";
}

export { dictionary };
