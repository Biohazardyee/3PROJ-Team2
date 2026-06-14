import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../context/ThemeContext';
import {useTranslation} from 'react-i18next';

const {width} = Dimensions.get('window');

type PlaylistCardProps = {
    title: string;
    count: number;
    image: string;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
    title,
    count,
    image,
    onPress,
    onEdit,
    onDelete,
}: PlaylistCardProps) => {
    const {theme} = useTheme();
    const {t} = useTranslation();

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{uri: image}} style={[styles.cardImage, {backgroundColor: theme.surface}]}/>

            <View style={styles.footerCard}>
                <View style={styles.textContainer}>
                    <Text style={[styles.cardTitle, {color: theme.text}]} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={[styles.cardCount, {color: theme.subText}]}>
                        {count} {t(count <= 1 ? "track_singular" : "track_plural")}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onEdit}
                    style={styles.moreButton}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color={theme.subText}/>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 8,
        marginBottom: 5,
        maxWidth: (width / 2) - 24,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
    },
    footerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 10,
    },
    cardCount: {
        fontSize: 12,
        marginTop: 2,
    },
    moreButton: {
        paddingLeft: 10,
        paddingVertical: 5,
    },
});

export default PlaylistCard;
