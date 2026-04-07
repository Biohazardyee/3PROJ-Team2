import React from 'react';
import { View, Text,TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import {useRouter, usePathname} from "expo-router";
import { useFonts } from 'expo-font';
import { Syncopate_400Regular } from '@expo-google-fonts/syncopate';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';

const Header: React.FC = () => {
    let [fontsLoaded] = useFonts({
    Syncopate_400Regular,
    Pacifico_400Regular
  });
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
                <Text style={styles.name}>Melodia</Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Ionicons
                        name="notifications-outline"
                        size={26}
                        color="white"
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/conversations')} >
                    <Ionicons
                        name="paper-plane-outline"
                        size={26}
                        color="white"
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
        fontSize: 21,
        fontWeight: 'bold',
        color: '#ad46ff',
        letterSpacing: 0.5,
        fontFamily: 'Pacifico_400Regular', 
    },
    buttons: {
        flexDirection: 'row',
        gap: 15, 
        alignItems: 'center',
    }
});

export default Header;