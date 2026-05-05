import React, {useState, useEffect} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import {useLocalSearchParams} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import BackButton from "../components/BackButton";
import apiClient from "../api/client";
import AlbumCard from "@/src/components/AlbumCard";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

const PADDING_HORIZONTAL = 10;
const GAP = 6;
const COLUMN_WIDTH: number = (SCREEN_WIDTH - PADDING_HORIZONTAL * 2 - GAP) / 2;

const PlaylistDetails = () => {
    const {id, title} = useLocalSearchParams();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPlaylistContent: () => Promise<void> = async (): Promise<void> => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/playlist-items/playlist/${id}`);
            setItems(res.data.playlistItems || []);
        } catch (e) {
            Alert.alert("Erreur", "Impossible de charger le contenu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect((): void => {
        if (id) loadPlaylistContent();
    }, [id]);

    const removeItem = (playlistItemId: string, mediaTitle: string): void => {
        Alert.alert("Supprimer", `Retirer "${mediaTitle}" ?`, [
            {text: "Annuler", style: "cancel"},
            {
                text: "Retirer",
                style: "destructive",
                onPress: async (): Promise<void> => {
                    try {
                        await apiClient.delete(`/playlist-items/${playlistItemId}`);
                        setItems((prev) => prev.filter((i): boolean => i.id !== playlistItemId));
                    } catch {
                        Alert.alert("Erreur", "Action impossible.");
                    }
                },
            },
        ]);
    };

    const renderAlbumItem = ({item}: { item: any }) => {
        const media = item.media;
        const content = media?.content;

        return (
            <View style={styles.cardWrapper}>
                <TouchableOpacity
                    style={{flex: 1}}
                    onLongPress={(): void => removeItem(item.id, content?.name || "élément")}
                    activeOpacity={0.8}
                >
                    <AlbumCard
                        id={media?.id}
                        title={content?.album?.name || content?.name}
                        artist={content?.album?.artist || content?.artist}
                        cover={content?.cover || media?.cover}
                        rating={String(media?.rating || 0)}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(): void => removeItem(item.id, content?.name || "élément")}
                >
                    <Ionicons name="ellipsis-vertical" size={14} color="white"/>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content"/>

            <View style={styles.header}>
                <BackButton/>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title}
                </Text>
                <View style={{width: 45}}/>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5"/>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAlbumItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1C1C28",
    },

    card: {
        width: "100%",
        flex: 1,
    },

    coverContainer: {
        width: "100%",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    headerTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },

    listContent: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 40,
    },

    // 🔥 FIX ICI
    columnWrapper: {
        gap: GAP,
        marginBottom: 12,
    },

    // 🔥 FIX ICI
    cardWrapper: {
        width: COLUMN_WIDTH,
        flex: 1,
        position: "relative",
    },

    moreButton: {
        position: "absolute",
        top: 6,
        right: 6,
        zIndex: 99,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 10,
        width: 22,
        height: 22,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default PlaylistDetails;
