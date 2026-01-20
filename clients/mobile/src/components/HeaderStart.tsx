import React from 'react';
import { View, Text,TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import {useRouter} from "expo-router";

const HeaderStart: React.FC = () => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <View style={styles.content}>
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
                        size={24}
                        color="white"
                    />
                </LinearGradient>
                {/* Nom de l'app */}
                <Text style={styles.name}>SUPCONTENT</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Ionicons
                    name="notifications-outline"
                    size={26}
                    color="white"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1C1C28',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ad46ff',
        letterSpacing: 0.5,
    }
});

export default HeaderStart;