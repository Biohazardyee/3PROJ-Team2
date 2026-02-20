import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { ButtonMobile } from '@/src/components/ButtonMobile';
import Header from "@/src/components/Header";


export default function AutGuard() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.content}>
                {/* Logo */}
                <LinearGradient
                    colors={['#6366f1', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.icon}
                >
                    <Ionicons name="lock-closed" size={40} color="white" />
                </LinearGradient>

                {/* Texte  */}
                <Text style={styles.title}>Contenu Exclusif</Text>
                <Text style={styles.text}>
                    Rejoignez SUPCONTENT pour accéder à ce contenu.
                </Text>

                {/* boutons */}
                <View style={styles.buttons}>
                    <ButtonMobile
                        title="Se connecter"
                        onPress={() => router.push('/login')}
                    />

                    <View style={styles.spacer} />

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/register')}
                    >
                        <LinearGradient
                            colors={['#6366f1', '#ec4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.outlineGradient}
                        >
                            <View style={styles.innerButton}>
                                <Text style={styles.registerText}>Créer un compte</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Lien retour */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>Plus tard</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C28',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    icon: {
        width: 80,
        height: 80,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    text: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 40,
        lineHeight: 24,
    },
    buttons: {
        width: '100%',
    },
    spacer: {
        height: 15,
    },
    registerButton: {
        height: 55,
        borderRadius: 12,
        overflow: 'hidden',
    },
    outlineGradient: {
        flex: 1,
        padding: 2,
        borderRadius: 12,
    },
    innerButton: {
        flex: 1,
        backgroundColor: '#13131a',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 30,
    },
    backText: {
        color: '#555',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});