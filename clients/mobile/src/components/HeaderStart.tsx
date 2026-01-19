import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HeaderStart: React.FC = () => {
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
                    {/* Logo A changer */}
                    <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>♪</Text>
                </LinearGradient>
                {/* Nom de l'app */}
                <Text style={styles.name}>SUPCONTENT</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#13141c',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ad46ff',
        letterSpacing: 0.5,
    }
});

export default HeaderStart;