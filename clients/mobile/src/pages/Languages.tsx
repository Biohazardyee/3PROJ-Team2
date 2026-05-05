import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../components/BackButton';
import {useTheme} from '../context/ThemeContext';

const AVAILABLE_LANGUAGES = [
    {code: 'fr', label: 'Français', flag: '🇫🇷'},
    {code: 'en', label: 'English', flag: '🇬🇧'},
    {code: 'es', label: 'Español', flag: '🇪🇸'},
];

const Languages = () => {
    const {theme} = useTheme();
    const [selectedLang, setSelectedLang] = useState('fr');

    useEffect((): void => {
        const loadLanguage: () => Promise<void> = async (): Promise<void> => {
            try {
                const savedLang: string | null = await AsyncStorage.getItem('user_language');
                if (savedLang) {
                    setSelectedLang(savedLang);
                }
            } catch (e) {
                console.error("Erreur chargement langue", e);
            }
        };
        loadLanguage();
    }, []);

    // 2. Fonction pour changer et sauvegarder la langue
    const changeLanguage = async (langCode: string): Promise<void> => {
        setSelectedLang(langCode);
        await AsyncStorage.setItem('user_language', langCode);

        // Note : Pour traduire toute l'app, il faudra plus tard utiliser un outil comme i18next.
        // Pour l'instant, on sauvegarde le choix de l'utilisateur.
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <View style={styles.header}>
                <BackButton/>
                <Text style={[styles.headerTitle, {color: theme.text}]}>Langue</Text>
                <View style={{width: 45}}/>
            </View>

            <View style={styles.content}>
                <View style={[styles.card, {backgroundColor: theme.card}]}>

                    {AVAILABLE_LANGUAGES.map((lang: { code: string, label: string, flag: string }, index: number) => {
                        const isSelected = selectedLang === lang.code;

                        return (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageRow,
                                    {borderBottomColor: theme.border},
                                    // On enlève la bordure du dernier élément
                                    index === AVAILABLE_LANGUAGES.length - 1 && {borderBottomWidth: 0}
                                ]}
                                onPress={(): Promise<void> => changeLanguage(lang.code)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.flag}>{lang.flag}</Text>
                                <Text style={[styles.languageName, {color: theme.text}]}>{lang.label}</Text>

                                {/* Icône de validation (Check) si c'est la langue sélectionnée */}
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.accent}/>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                </View>

                <Text style={[styles.infoText, {color: theme.subText}]}>
                    Actuellement, les données sont configurées pour s'afficher en : {
                    AVAILABLE_LANGUAGES.find(l => l.code === selectedLang)?.label
                }
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 15,
    },
    headerTitle: {fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center'},
    content: {flex: 1, padding: 20},
    card: {
        borderRadius: 15,
        overflow: 'hidden', // Pour que les bords des boutons ne dépassent pas
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
    },
    flag: {
        fontSize: 24,
        marginRight: 15,
    },
    languageName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    infoText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
    }
});

export default Languages;