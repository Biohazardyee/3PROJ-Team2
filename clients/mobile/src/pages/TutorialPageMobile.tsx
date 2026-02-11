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
            colors={['#000000', '#959496', '#dedede']}
            locations={[0, 0.6, 1]}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>

                {/* Contenu du texte */}
                <View style={styles.content}>
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
                            color="#ad46ff"
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        color: '#94a3b8',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingBottom: 40,
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
        backgroundColor: '#ad46ff',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: '#334155',
    },
});