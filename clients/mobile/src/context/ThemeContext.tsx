import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Définition des palettes de couleurs (Sombre et Clair)
export const Colors = {
    dark: {
        background: '#1C1C28',
        card: '#2A2A38',
        text: '#FFFFFF',
        subText: '#AAAAAA',
        border: 'rgba(255,255,255,0.05)',
        accent: '#6C5CE7',
    },
    light: {
        background: '#F5F5F7',
        card: '#FFFFFF',
        text: '#1C1C28',
        subText: '#666666',
        border: 'rgba(0,0,0,0.05)',
        accent: '#6C5CE7',
    }
};

const ThemeContext = createContext({
    isDarkMode: true,
    toggleTheme: async (value: boolean): Promise<void> => {
    },
    theme: Colors.dark,
});

export const ThemeProvider = ({children}: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect((): void => {
        const loadTheme: () => Promise<void> = async (): Promise<void> => {
            try {
                const savedTheme: string | null = await AsyncStorage.getItem('pref_darkmode');
                if (savedTheme !== null) {
                    setIsDarkMode(JSON.parse(savedTheme));
                }
            } catch (e) {
                console.error("Erreur chargement thème", e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme: (value: boolean) => Promise<void> = async (value: boolean): Promise<void> => {
        setIsDarkMode(value);
        await AsyncStorage.setItem('pref_darkmode', JSON.stringify(value));
    };

    const theme = isDarkMode ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{isDarkMode, toggleTheme, theme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);