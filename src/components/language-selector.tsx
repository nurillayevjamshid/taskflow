"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const locales = [
    { code: "uz" as const, label: "O'zbek" },
    { code: "ru" as const, label: "Русский" },
    { code: "en" as const, label: "English" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-9 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center hover:bg-accent transition"
        title="Change language"
      >
        <Globe className="size-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-md p-1 min-w-32 z-50">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => {
                setLocale(loc.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                locale === loc.code ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
