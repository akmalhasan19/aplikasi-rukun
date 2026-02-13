"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { language, Dictionary, kamus } from './Kamus'

type LanguageContextType = {
    language: language
    setLanguage: (lang: language) => void
    t: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<language>('en')

    useEffect(() => {
        // Load saved language from local storage
        const savedLang = localStorage.getItem('rukun_language') as language
        if (savedLang && ['en', 'id', 'jv'].includes(savedLang)) {
            setLanguage(savedLang)
        }
    }, [])

    const handleSetLanguage = (lang: language) => {
        setLanguage(lang)
        localStorage.setItem('rukun_language', lang)
    }

    // While not mounted, render children to avoid hydration mismatch, but it might use default language
    // ideally we'd use a loader, but for now we just render.
    // Actually, to prevent hydration mismatch for text content, we might need to wait.
    // But waiting flashes empty content. Let's just run with 'en' default on server and update on client.

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t: kamus[language]
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
