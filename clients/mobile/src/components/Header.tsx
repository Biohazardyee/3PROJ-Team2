import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {useRouter, Router} from "expo-router";
import {useTheme} from '../context/ThemeContext';


const Header: React.FC = () => {

    const router: Router = useRouter();
    const {theme} = useTheme();
    return (
        <View style={[styles.header, {backgroundColor: theme.background}]}>
            <View style={styles.content}>
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                />

                <Text style={styles.name}>Melodia</Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity onPress={(): void => router.push('/notifications')}>
                    <Ionicons
                        name="notifications-outline"
                        size={26}
                        color={theme.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={(): void => router.push('/conversations')}>
                    <Ionicons
                        name="paper-plane-outline"
                        size={26}
                        color={theme.text}
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
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    logoImage: {
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
