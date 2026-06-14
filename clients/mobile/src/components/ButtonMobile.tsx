import React from 'react';
import {StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {useTheme} from '../context/ThemeContext';

interface ButtonProps {
    title?: string;
    children?: React.ReactNode;
    variant?: 'primary' | 'social';
    onPress?: () => void;
    style?: ViewStyle;
    disabled?: boolean;
}

export const ButtonMobile: React.FC<ButtonProps> = ({
    title,
    children,
    variant = 'primary',
    onPress,
    style,
    disabled,
}: ButtonProps) => {
    const {theme} = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.base,
                variant === 'primary'
                    ? styles.primary
                    : [styles.social, {backgroundColor: theme.surface, borderColor: theme.border}],
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            {title ? <Text style={styles.text}>{title}</Text> : children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {borderRadius: 15, justifyContent: 'center', alignItems: 'center', height: 55},
    primary: {backgroundColor: '#3b82f6', width: '100%'},
    social: {flex: 1},
    text: {color: '#FFF', fontSize: 18, fontWeight: 'bold'},
});
