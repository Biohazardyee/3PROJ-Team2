import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import {useLocalSearchParams} from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "@/src/components/Header";
import AlbumCard from "@/src/components/AlbumCard";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

const TYPE_CONFIG: any = {
    listened: {
        title: "Écoutés",
        subtitle: "Albums terminés",
        icon: "check-circle-outline",
        color: "#00ffa3",
    },
    later: {
        title: "À écouter",
        subtitle: "Liste d'attente",
        icon: "playlist-music",
        color: "#3b82f6",
    },
    favorite: {
        title: "Favoris",
        subtitle: "Vos préférés",
        icon: "star",
        color: "#fbbf24",
    },
    disliked: {
        title: "Je n'aime pas",
        subtitle: "Moins aimés",
        icon: "close-circle-outline",
        color: "#f43f5e",
    },
};

const StatDetails: React.FC = () => {
    const {type} = useLocalSearchParams();
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const config = TYPE_CONFIG[type as string] || TYPE_CONFIG.listened;

    useEffect((): void => {
        fetchAlbumsByStatus();
    }, [type]);

    const fetchAlbumsByStatus: () => Promise<void> = async (): Promise<void> => {
        try {
            setLoading(true);
            const token: string | null = await SecureStore.getItemAsync("userToken");
            if (!token) return;

            const decoded: any = jwtDecode(token);
            const response = await apiClient.get(`/medias/status/user/${decoded.id}`);
            const rawData = response.data.mediasStatus || [];

            const mappedAlbums = rawData
                .filter((item: any) => item.status === type && item.media)
                .map((item: any) => {
                    const m = item.media;
                    return {
                        // L'ID pour l'affichage/navigation (Format Last.fm ou UUID)
                        displayId: m.api_id || m.id,
                        // L'ID RÉEL de la DB (UUID) pour les requêtes POST/PUT
                        dbId: m.id,
                        album: m.name || m.title || "Titre inconnu",
                        artist: m.artist || "Artiste inconnu",
                        rating: m.rating || 0,
                        cover: m.cover || m.cover_url || "https://via.placeholder.com/150",
                    };
                });

            // Dédoublonnage sur le displayId
            const uniqueMap = new Map();
            mappedAlbums.forEach((a: any): void => {
                if (!uniqueMap.has(a.displayId)) uniqueMap.set(a.displayId, a);
            });

            setAlbums(Array.from(uniqueMap.values()));
        } catch (error) {
            console.error("❌ Erreur StatDetails:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header/>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                <View style={styles.headerTextContainer}>
                    <View style={styles.headerTitle}>
                        <Icon name={config.icon} size={40} color={config.color}/>
                        <Text style={[styles.title, {color: config.color}]}>
                            {config.title}
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>{config.subtitle}</Text>
                </View>

                {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={config.color}
                        style={{marginTop: 50}}
                    />
                ) : (
                    <View style={styles.grid}>
                        {albums.map((item) => (
                            <AlbumCard
                                key={item.displayId}
                                id={item.dbId}
                                title={item.album}
                                artist={item.artist}
                                rating={String(item.rating)}
                                cover={item.cover}
                                genre="Musique"
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#1C1C28"},
    scroll: {padding: 20, paddingTop: 10},
    headerTextContainer: {marginBottom: 25},
    headerTitle: {flexDirection: "row", alignItems: "center", gap: 10},
    title: {fontSize: 28, fontWeight: "bold"},
    subtitle: {color: "#888", fontSize: 16, marginTop: 5},
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    emptyText: {
        color: "#555",
        textAlign: "center",
        marginTop: 50,
        width: "100%",
    },
});

export default StatDetails;
