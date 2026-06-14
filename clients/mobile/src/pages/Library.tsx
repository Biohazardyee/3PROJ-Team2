import React, {useState, useCallback} from "react";
import {useTranslation} from "react-i18next";
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
import {useTheme} from "../context/ThemeContext";

type Playlist = {
    id: string;
    title: string;
    count: number;
    image: string;
    isCreate?: boolean;
    is_public: boolean;
};

const {width} = Dimensions.get("window");

const Library: React.FC = () => {
    const {t} = useTranslation();
    const router: Router = useRouter();
    const {theme} = useTheme();
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
                        count: p.items?.length ?? 0,
                        image:
                            p.image_url ||
                            "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500",
                        is_public: p.is_public,
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

    const deletePlaylist: (id: string) => Promise<void> = async (
        id: string,
    ): Promise<void> => {
        try {
            await apiClient.delete(`/playlists/${id}`);
            setPlaylists((current: Playlist[]): Playlist[] =>
                current.filter((p: Playlist): boolean => p.id !== id),
            );
            Alert.alert(t("success"), t("playlist_deleted_success"));
        } catch (error) {
            Alert.alert(t("error"), t("playlist_delete_error"));
        }
    };

    const showOptions: (item: Playlist) => void = (item: Playlist): void => {
        Alert.alert(item.title, t("playlist_options_title"), [
            {
                text: t("modify"),
                onPress: (): void =>
                    router.push({
                        pathname: "/createplaylist",
                        params: {
                            id: item.id,
                            title: item.title,
                            isEditing: "true",
                            is_public: String(item.is_public),
                        },
                    }),
            },
            {
                text: t("delete"),
                style: "destructive",
                onPress: (): void =>
                    Alert.alert(t("delete"), t("delete_playlist_confirm"), [
                        {text: t("cancel"), style: "cancel"},
                        {text: t("delete"), onPress: () => deletePlaylist(item.id)},
                    ]),
            },
            {text: t("cancel"), style: "cancel"},
        ]);
    };

    const dataWithCreate: Playlist[] = [
        {id: "create-button-id", isCreate: true} as Playlist,
        ...playlists,
    ];

    const renderItem = ({item}: { item: Playlist }) => {
        if (item.isCreate) {
            return (
                <View style={styles.card}>
                    <TouchableOpacity
                        style={[styles.createCard, {backgroundColor: theme.card, borderColor: theme.border}]}
                        onPress={(): void => router.push("/createplaylist")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="add" size={32} color="#ec4899"/>
                        </View>
                        <Text style={[styles.createLabelInner, {color: theme.text}]}>{t("new_playlist")}</Text>
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
            <View style={[styles.container, {backgroundColor: theme.background}]}>
                <Header/>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#ec4899"/>
                        <Text style={[styles.loaderText, {color: theme.subText}]}>
                            {t("msg_loading_music")}
                        </Text>
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
                                <Text style={[styles.title, {color: theme.text}]}>{t("my_playlists_title")}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.subtitle}>
                                        {playlists.length} {t("library_playlists_created")}
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
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loaderText: {
        marginTop: 15,
        fontSize: 14,
    },
    headerTextContainer: {
        paddingHorizontal: 16,
        marginTop: 25,
        marginBottom: 20,
    },
    title: {
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
        width: "100%",
        aspectRatio: 1,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
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
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
});

export default Library;
