import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter, usePathname, Router} from "expo-router";
import {useTheme} from '../context/ThemeContext';

const Footer: React.FC = () => {
    const router: Router = useRouter();
    const pathname: string = usePathname();
    const {theme} = useTheme();

    return (
        <View style={[styles.footer, {backgroundColor: theme.background, borderTopColor: theme.separator}]}>
            <TouchableOpacity onPress={(): void => router.push('/')} style={styles.icon}>
                <Ionicons
                    name="home-outline"
                    size={26}
                    color={pathname === '/' ? '#6366f1' : theme.subText}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/feed')} style={styles.icon}>
                <Ionicons
                    name="rocket-outline"
                    size={26}
                    color={pathname === '/feed' ? '#ec4899' : theme.subText}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/stats')} style={styles.icon}>
                <Ionicons
                    name="stats-chart"
                    size={26}
                    color={pathname === '/stats' ? '#cbc13e' : theme.subText}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/library')} style={styles.icon}>
                <Ionicons
                    name="library-outline"
                    size={26}
                    color={pathname === '/library' ? '#c33131' : theme.subText}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/profile')} style={styles.icon}>
                <Ionicons
                    name="person-outline"
                    size={26}
                    color={pathname === '/restriction' ? '#6366f1' : pathname === '/profile' ? '#6366f1' : theme.subText}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 0.5,
    },
    icon: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
})

export default Footer;
