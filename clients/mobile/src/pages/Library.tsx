import React, {useState, useCallback} from "react";
import {Router, useFocusEffect} from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Header from "@/src/components/Header";
import PlaylistCard from "@/src/components/PlaylistCard";
import {useRouter} from "expo-router";
import {AuthGuardWrapper} from "../components/AuthGuardMapper";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

type Playlist = {
    id: string;
    title: string;
    count: number;
    image: string;
    isCreate?: boolean;
};

const {width} = Dimensions.get("window");

const Library: React.FC = () => {
    const router: Router = useRouter();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserPlaylists: () => Promise<void> = async (): Promise<void> => {
        try {
            const token: string | null = await SecureStore.getItemAsync("userToken");
            if (!token) {
                setLoading(false);
                return;
            }
            const decoded: any = jwtDecode(token);
            const userId = decoded.id;
            const response = await apiClient.get(`/playlists/user/${userId}`);

            if (response.data && response.data.playlists) {
                const formattedPlaylists: Playlist[] = response.data.playlists.map(
                    (p: any) => ({
                        id: p.id,
                        title: p.name,
                        count: p.items.length ?? 0,
                        image: p.image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500",
                    }),
                );
                setPlaylists(formattedPlaylists);
            }
        } catch (error) {
            console.error("Library Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback((): void => {
            fetchUserPlaylists();
        }, []),
    );

    const deletePlaylist: (id: string) => Promise<void> = async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/playlists/${id}`);
            setPlaylists((current: Playlist[]): Playlist[] => current.filter((p: Playlist): boolean => p.id !== id));
            Alert.alert("Succès", "Playlist supprimée.");
        } catch (error) {
            Alert.alert("Erreur", "La suppression a échoué.");
        }
    };

    const showOptions: (item: Playlist) => void = (item: Playlist): void => {
        Alert.alert(item.title, "Options de la playlist", [
            {
                text: "Modifier",
                onPress: (): void =>
                    router.push({
                        pathname: "/createPlaylist",
                        params: {id: item.id, title: item.title, isEditing: "true"},
                    }),
            },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: (): void =>
                    Alert.alert("Supprimer", "Confirmer la suppression ?", [
                        {text: "Annuler", style: "cancel"},
                        {text: "Supprimer", onPress: () => deletePlaylist(item.id)},
                    ]),
            },
            {text: "Annuler", style: "cancel"},
        ]);
    };

    const dataWithCreate: Playlist[] = [
        {id: "create-button-id", isCreate: true} as Playlist, // On le met en premier pour l'accessibilité
        ...playlists,
    ];

    const renderItem = ({item}: { item: Playlist }) => {
        if (item.isCreate) {
            return (
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.createCard}
                        onPress={(): void => router.push("/createPlaylist")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="add" size={32} color="#ec4899"/>
                        </View>
                        <Text style={styles.createLabelInner}>Nouvelle Playlist</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.card}>
                <PlaylistCard
                    title={item.title}
                    count={item.count}
                    image={item.image}
                    onPress={(): void =>
                        router.push({
                            pathname: "/playlistdetails",
                            params: {id: item.id, title: item.title},
                        })
                    }
                    onEdit={(): void => showOptions(item)}
                    onDelete={(): Promise<void> => deletePlaylist(item.id)}
                />
            </View>
        );
    };

    return (
        <AuthGuardWrapper>
            <View style={styles.container}>
                <Header/>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#ec4899"/>
                        <Text style={styles.loaderText}>Chargement de votre musique...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={dataWithCreate}
                        keyExtractor={(item: Playlist): string => item.id}
                        numColumns={2}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        ListHeaderComponent={
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.title}>Ma Bibliothèque</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.subtitle}>
                                        {playlists.length} Playlists créées
                                    </Text>
                                </View>
                            </View>
                        }
                    />
                )}
            </View>
        </AuthGuardWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f1a", // Plus sombre pour plus de profondeur
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loaderText: {
        color: "#888",
        marginTop: 15,
        fontSize: 14,
    },
    headerTextContainer: {
        paddingHorizontal: 16,
        marginTop: 25,
        marginBottom: 20,
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    badge: {
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    subtitle: {
        color: "#ec4899",
        fontSize: 13,
        fontWeight: "600",
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 40,
    },
    card: {
        flex: 1,
        margin: 8,
        maxWidth: width / 2 - 20,
    },
    createCard: {
        backgroundColor: "#1c1c2e",
        width: "100%",
        aspectRatio: 1,
        borderRadius: 20, // Plus arrondi
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        // Ombre subtile
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(236, 72, 153, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    createLabelInner: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
});

export default Library;