"use client";
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const stored = window.localStorage.getItem(key);
            return stored !== null ? (JSON.parse(stored) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // storage full or unavailable — fail silently
        }
    }, [key, value]);

    const set = useCallback((next: T | ((prev: T) => T)) => {
        setValue(next);
    }, []);

    return [value, set] as const;
}
