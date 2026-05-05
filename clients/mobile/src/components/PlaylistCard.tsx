import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');

// Définition des types pour les props du composant
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
                                                       onDelete
                                                   }: PlaylistCardProps) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{uri: image}} style={styles.cardImage}/>

            <View style={styles.footerCard}>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={styles.cardCount}>
                        {count} titres
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={onEdit}
                    style={styles.moreButton}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#666"/>
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
        maxWidth: (width / 2) - 24
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: '#2A2A38'
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
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 10
    },
    cardCount: {
        color: '#666',
        fontSize: 12,
        marginTop: 2
    },
    moreButton: {
        paddingLeft: 10,
        paddingVertical: 5,
    }
});

export default PlaylistCard;