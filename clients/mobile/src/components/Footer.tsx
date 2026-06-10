import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter, usePathname, Router} from "expo-router";

const Footer: React.FC = () => {
    const router: Router = useRouter();
    const pathname: string = usePathname();

    return (
        <View style={styles.footer}>
            <TouchableOpacity onPress={(): void => router.push('/')} style={styles.icon}>
                <Ionicons
                    name="home-outline"
                    size={26}
                    color={pathname === '/' ? '#6366f1' : '#94a3b8'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/feed')} style={styles.icon}>
                <Ionicons
                    name="rocket-outline"
                    size={26}
                    color={pathname === '/feed' ? '#ec4899' : '#94a3b8'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/stats')} style={styles.icon}>
                <Ionicons
                    name="stats-chart"
                    size={26}
                    color={pathname === '/stats' ? '#cbc13e' : '#94a3b8'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/library')} style={styles.icon}>
                <Ionicons
                    name="library-outline"
                    size={26}
                    color={pathname === '/library' ? '#c33131' : '#94a3b8'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={(): void => router.push('/profile')} style={styles.icon}>
                <Ionicons
                    name="person-outline"
                    size={26}
                    color={pathname === '/restriction' ? '#fff7f7' : '#94a3b8'}
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
        backgroundColor: '#1C1C28',
        paddingVertical: 15,
        borderTopWidth: 0.5,
        borderTopColor: '#333'
    },
    icon: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
})

export default Footer;
