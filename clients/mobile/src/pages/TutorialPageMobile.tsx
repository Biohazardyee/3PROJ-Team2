import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const slides = [
    { id: 1,
      title: "Bienvenue",
      text: "Découvrez la meilleure musique du moment sur SUPCONTENT."
    },
    { id: 2,
      title: "Partagez",
      text: "Commentez et notez vos albums préférés avec la communauté."
    },
    { id: 3,
      title: "Profitez",
      text: "Créez vos playlists et emportez votre musique partout."
    },
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push('/');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        /* Degradé */
        <LinearGradient
            colors={['#000000', '#2D1B4E', '#ad46ff']}
            locations={[0, 0.6, 1]}
            style={styles.container}
        >
            <View style={{ flex: 1 }}>
                <View style={styles.top}>
                    {/* Fond Logo */}
                    <LinearGradient
                        colors={['#6366f1', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logo}
                    >
                        {/* Logo */}
                        <Ionicons
                            name="musical-notes-outline"
                            size={50}
                            color="white"
                        />
                    </LinearGradient>
                </View>
                <View style={styles.content}>
                    {/* Contenu du texte */}
                    <Text style={styles.title}>{slides[currentIndex].title}</Text>
                    <Text style={styles.description}>{slides[currentIndex].text}</Text>
                </View>

                {/* Barre de navigation */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handlePrev}
                        style={[styles.navButton, currentIndex === 0 && { opacity: 0 }]}
                        disabled={currentIndex === 0}
                    >
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>

                    <View style={styles.dotsContainer}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                        <Ionicons
                            name={currentIndex === slides.length - 1 ? "checkmark-circle" : "arrow-forward"}
                            size={28}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    top: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    logo: {
        width: 110,
        height: 110,
        borderRadius: 28, 
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    content: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        color: '#94a3b8',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        flex : 1 ,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },
    navButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#ffffff',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#848689',
    },
});