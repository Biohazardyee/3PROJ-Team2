import React from 'react';
import {TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Router, useRouter} from 'expo-router';
import {useTheme} from '../context/ThemeContext';

type BackButtonProps = {
    style?: ViewStyle;
}

const BackButton = ({style}: BackButtonProps) => {
    const router: Router = useRouter();
    const {theme} = useTheme();

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={(): void => router.back()}
            activeOpacity={0.7}
        >
            <Ionicons name="chevron-back" size={30} color={theme.text}/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22.5,
    },
});

export default BackButton;