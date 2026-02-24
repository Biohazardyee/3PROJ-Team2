import React from 'react';
import { View, Text,TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import {useRouter, usePathname} from "expo-router";

const Header: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    return (
        <View style={styles.header}>
            <View style={styles.content}>
                {/* Logo */}
                <Image 
                    source={require('@/assets/images/logo.png')} 
                    style={styles.logoImage} 
                />

                {/* Nom de l'app */}
                <Text style={styles.name}>MELODIA</Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Ionicons
                        name="notifications-outline"
                        size={26}
                        color="white"
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/restriction')} >
                    <Ionicons
                        name="paper-plane-outline"
                        size={26}
                        color={pathname === '/messages' ? 'black' : 'white'}
                    />
                </TouchableOpacity>
            </View>
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
    logoImage : {
        width: 50,
        height: 50,   
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ad46ff',
        letterSpacing: 0.5,
    },
    buttons: {
        flexDirection: 'row',
        gap: 15, 
        alignItems: 'center',
    }
});

export default Header;