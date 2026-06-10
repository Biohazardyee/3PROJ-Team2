import React, {useState, useRef, useEffect} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import {Router, useRouter} from "expo-router";
import apiClient from "../api/client";
import {InputMobile} from "../components/InputMobile";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

const slides = [
    {
        id: 1,
        title: "Bienvenue",
        text: "Découvrez la meilleure musique du moment sur SUPCONTENT.",
    },
    {
        id: 2,
        title: "Partagez",
        text: "Commentez et notez vos albums préférés avec la communauté.",
    },
    {
        id: 3,
        title: "Profitez",
        text: "Créez vos playlists et emportez votre musique partout.",
    },
    {
        id: 4,
        title: "Dernière étape",
        text: "Quel est votre artiste ou groupe préféré ?",
    },
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [favorite_band, setFavoriteBand] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false); // <-- Déclaration manquante ajoutée
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const searchTimeout = useRef<any>(null);
    const router: Router = useRouter();

    useEffect((): void => {
        const getUserId: () => Promise<void> = async (): Promise<void> => {
            const token: string | null = await SecureStore.getItemAsync("userToken");
            if (token) {
                const decoded: any = jwtDecode(token);
                setCurrentUserId(decoded.id);
            }
        };
        getUserId();
    }, []);

    const searchArtists: (text: string) => Promise<void> = async (text: string): Promise<void> => {
        setFavoriteBand(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (text.length > 2) {
            setIsSearching(true);
            searchTimeout.current = setTimeout(async (): Promise<void> => {
                try {
                    const response = await apiClient.get(`/api/search?query=${text}`);
                    const albums =
                        response.data.searchResults?.results?.albummatches?.album || [];
                    const uniqueArtists: unknown[] = [
                        ...new Set(albums.map((item: any) => item.artist)),
                    ];
                    setSuggestions(uniqueArtists.map((name: unknown): { name: unknown } => ({name})).slice(0, 5));
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Erreur recherche:", error);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleNext: () => void = (): void => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev: () => void = (): void => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleFinish: () => Promise<void> = async (): Promise<void> => {
        if (!favorite_band) {
            Alert.alert("Champ manquant", "Choisis un artiste !");
            return;
        }
        setIsLoading(true);

        try {

            await apiClient.patch("/users/profile", {favorite_band});
            router.replace("/");
        } catch (error: any) {
            console.error("Erreur save artist:", error.response?.data);
            Alert.alert("Erreur", "Impossible de sauvegarder votre artiste.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={["#000000", "#2D1B4E", "#ad46ff"]}
            locations={[0, 0.6, 1]}
            style={styles.container}
        >
            <View style={{flex: 1}}>
                <View style={styles.top}>
                    <LinearGradient
                        colors={["#6366f1", "#ec4899"]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.logo}
                    >
                        <Ionicons name="musical-notes-outline" size={50} color="white"/>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{slides[currentIndex].title}</Text>

                    {currentIndex < 3 ? (
                        <Text style={styles.description}>{slides[currentIndex].text}</Text>
                    ) : (
                        <View style={styles.searchSection}>
                            <InputMobile
                                label="Artiste préféré"
                                placeholder="Ex: Daft Punk, Angèle..."
                                icon="musical-note-outline"
                                value={favorite_band}
                                onChangeText={searchArtists}
                                onFocus={(): false | void =>
                                    favorite_band.length > 2 && setShowSuggestions(true)
                                }
                            />

                            {showSuggestions && (
                                <View style={styles.suggestionsContainer}>
                                    {isSearching ? (
                                        <ActivityIndicator
                                            color="#6366f1"
                                            style={{padding: 10}}
                                        />
                                    ) : (
                                        suggestions.map((item, index: number) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionItem}
                                                onPress={(): void => {
                                                    setFavoriteBand(item.name);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <Ionicons
                                                    name="mic-outline"
                                                    size={18}
                                                    color="#94a3b8"
                                                />
                                                <Text style={styles.suggestionText}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handlePrev}
                        style={[styles.navButton, currentIndex === 0 && {opacity: 0}]}
                        disabled={currentIndex === 0}
                    >
                        <Ionicons name="arrow-back" size={28} color="white"/>
                    </TouchableOpacity>

                    <View style={styles.dotsContainer}>
                        {slides.map((_: { id: number, title: string, text: string }, index: number) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index
                                        ? styles.activeDot
                                        : styles.inactiveDot,
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleNext}
                        style={styles.navButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white"/>
                        ) : (
                            <Ionicons
                                name={
                                    currentIndex === slides.length - 1
                                        ? "checkmark-circle"
                                        : "arrow-forward"
                                }
                                size={28}
                                color="#ffffff"
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    top: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 20,
    },
    logo: {
        width: 110,
        height: 110,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },
    content: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    title: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    description: {
        color: "#94a3b8",
        fontSize: 18,
        textAlign: "center",
        lineHeight: 26,
    },
    searchSection: {width: "100%", zIndex: 50},
    suggestionsContainer: {
        backgroundColor: "#1e1e2d",
        borderRadius: 12,
        marginTop: -5,
        borderWidth: 1,
        borderColor: "#334155",
        overflow: "hidden",
        position: "absolute",
        top: 80,
        left: 0,
        right: 0,
        elevation: 5,
        zIndex: 100,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "#334155",
    },
    suggestionText: {color: "white", marginLeft: 10, fontSize: 15},
    footer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        zIndex: 1,
    },
    navButton: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    dotsContainer: {flexDirection: "row", gap: 8},
    dot: {height: 8, borderRadius: 4},
    activeDot: {width: 24, backgroundColor: "#ffffff"},
    inactiveDot: {width: 8, backgroundColor: "#848689"},
});
