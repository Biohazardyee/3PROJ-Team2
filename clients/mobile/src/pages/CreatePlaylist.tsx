import React, {useState, useEffect} from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import {
    useRouter,
    useLocalSearchParams,
    Router,
    UnknownOutputParams,
} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";
import {useTranslation} from "react-i18next";
import apiClient from "../api/client";
import * as FileSystem from "expo-file-system/legacy";
import {useTheme} from "../context/ThemeContext";

const CreatePlaylist = () => {
    const {t} = useTranslation();
    const {theme, isDarkMode} = useTheme();
    const router: Router = useRouter();
    const params: UnknownOutputParams = useLocalSearchParams();

    const [name, setName] = useState((params.title as string) || "");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEditing: boolean = params.isEditing === "true";
    const isPublicParam: boolean = params.is_public === "true";
    const [isPublic, setIsPublic] = useState<boolean>(isPublicParam);

    const pickImage = async (): Promise<void> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    useEffect((): void => {
        const loadPlaylist = async (): Promise<void> => {
            if (!isEditing || !params.id) return;
            try {
                const res = await apiClient.get(`/playlists/${params.id}`);
                const playlist = res.data.playlist;
                setName(playlist.name);
                setIsPublic(playlist.is_public);
                setImage(playlist.image_url || null);
            } catch (e) {
                console.error(e);
            }
        };
        loadPlaylist();
    }, []);

    useEffect((): void => {
        if (params.is_public !== undefined) setIsPublic(params.is_public === "true");
    }, []);

    const handleSave = async (): Promise<void> => {
        if (!name.trim()) return;
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync("userToken");
            if (!token) { Alert.alert(t("error"), t("session_expired")); return; }
            const decoded: any = jwtDecode(token);
            const userId = decoded.id;

            let base64Image: string | undefined;
            if (image) {
                base64Image = image.startsWith("data:image")
                    ? image
                    : `data:image/jpeg;base64,${await FileSystem.readAsStringAsync(image, {encoding: FileSystem.EncodingType.Base64})}`;
            }

            if (isEditing) {
                const updateData: any = {name: name.trim(), is_public: isPublic};
                if (base64Image) updateData.image_url = base64Image;
                await apiClient.put(`/playlists/${params.id}`, updateData);
                Alert.alert(t("success"), t("playlist_update_success"));
            } else {
                await apiClient.post("/playlists", {name: name.trim(), user_id: userId, is_public: isPublic, image_url: base64Image});
                Alert.alert(t("success"), t("playlist_create_success"));
            }
            router.replace("/library");
        } catch (e: any) {
            console.error("Erreur sauvegarde playlist:", e);
            Alert.alert(t("error"), e.response?.data?.message || t("playlist_save_error"));
        } finally {
            setLoading(false);
        }
    };

    const canSave = !!name.trim() && !loading;

    return (
        <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, {backgroundColor: theme.surface}]} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                            <Ionicons name="close" size={20} color={theme.text}/>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={[styles.pageTitle, {color: theme.text}]}>
                        {isEditing ? t("edit_playlist") : t("new_playlist")}
                    </Text>

                    {/* Image picker */}
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.imageWrapper}>
                        <View style={[styles.imagePicker, {backgroundColor: theme.surface}]}>
                            {image ? (
                                <Image source={{uri: image}} style={styles.pickerImage}/>
                            ) : (
                                <View style={styles.pickerPlaceholder}>
                                    <View style={styles.musicIconBg}>
                                        <Ionicons name="musical-notes" size={40} color="#6C5CE7"/>
                                    </View>
                                    <Text style={[styles.pickerHint, {color: theme.subText}]}>{t("add_cover")}</Text>
                                </View>
                            )}
                        </View>
                        <View style={[styles.cameraBadge, {backgroundColor: "#6C5CE7", borderColor: theme.background}]}>
                            <Ionicons name="camera" size={14} color="#fff"/>
                        </View>
                    </TouchableOpacity>

                    {/* Name input */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, {color: theme.subText}]}>
                            {t("playlist_name_placeholder", "Nom de la playlist").toUpperCase()}
                        </Text>
                        <View style={[styles.inputCard, {backgroundColor: theme.surface, borderColor: name ? "#6C5CE7" : theme.border}]}>
                            <Ionicons name="pencil-outline" size={18} color={name ? "#6C5CE7" : theme.placeholder} style={{marginRight: 10}}/>
                            <TextInput
                                style={[styles.input, {color: theme.text}]}
                                placeholder={t("playlist_name_placeholder")}
                                placeholderTextColor={theme.placeholder}
                                value={name}
                                onChangeText={setName}
                                autoFocus={!isEditing}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Visibility */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, {color: theme.subText}]}>
                            {t("tab_all", "Visibilité").toUpperCase()}
                        </Text>
                        <View style={styles.visRow}>
                            <TouchableOpacity
                                style={[
                                    styles.visCard,
                                    {backgroundColor: theme.surface, borderColor: isPublic ? "#6C5CE7" : theme.border},
                                    isPublic && styles.visCardActive,
                                ]}
                                onPress={() => setIsPublic(true)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.visIconBg, {backgroundColor: isPublic ? "rgba(108,92,231,0.15)" : theme.background}]}>
                                    <Ionicons name="globe-outline" size={22} color={isPublic ? "#6C5CE7" : theme.subText}/>
                                </View>
                                <Text style={[styles.visTitle, {color: isPublic ? "#6C5CE7" : theme.text}]}>
                                    {t("playlist_public")}
                                </Text>
                                {isPublic && (
                                    <View style={styles.visCheck}>
                                        <Ionicons name="checkmark-circle" size={16} color="#6C5CE7"/>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.visCard,
                                    {backgroundColor: theme.surface, borderColor: !isPublic ? "#6C5CE7" : theme.border},
                                    !isPublic && styles.visCardActive,
                                ]}
                                onPress={() => setIsPublic(false)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.visIconBg, {backgroundColor: !isPublic ? "rgba(108,92,231,0.15)" : theme.background}]}>
                                    <Ionicons name="lock-closed-outline" size={22} color={!isPublic ? "#6C5CE7" : theme.subText}/>
                                </View>
                                <Text style={[styles.visTitle, {color: !isPublic ? "#6C5CE7" : theme.text}]}>
                                    {t("playlist_private")}
                                </Text>
                                {!isPublic && (
                                    <View style={styles.visCheck}>
                                        <Ionicons name="checkmark-circle" size={16} color="#6C5CE7"/>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Create button */}
                    <TouchableOpacity
                        style={[styles.createBtn, {opacity: canSave ? 1 : 0.4}]}
                        onPress={handleSave}
                        disabled={!canSave}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff"/>
                        ) : (
                            <>
                                <Ionicons name={isEditing ? "save-outline" : "add-circle-outline"} size={20} color="#fff" style={{marginRight: 8}}/>
                                <Text style={styles.createBtnText}>
                                    {isEditing ? t("save_changes_btn") : t("create_playlist_btn")}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {flex: 1},

    scroll: {paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48},

    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 28,
        letterSpacing: -0.5,
    },

    // Image picker
    imageWrapper: {
        alignSelf: "center",
        marginBottom: 36,
        position: "relative",
    },
    imagePicker: {
        width: 160,
        height: 160,
        borderRadius: 20,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#6C5CE7",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: {width: 0, height: 6},
        elevation: 8,
    },
    pickerImage: {width: "100%", height: "100%"},
    pickerPlaceholder: {alignItems: "center", gap: 12},
    musicIconBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(108,92,231,0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    pickerHint: {fontSize: 13, fontWeight: "500"},
    cameraBadge: {
        position: "absolute",
        bottom: -6,
        right: -6,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
        elevation: 4,
    },

    // Section
    section: {marginBottom: 28},
    sectionLabel: {fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 10},

    // Input
    inputCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    input: {flex: 1, fontSize: 16, fontWeight: "500"},

    // Visibility
    visRow: {flexDirection: "row", gap: 12},
    visCard: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: "center",
        gap: 10,
        position: "relative",
    },
    visCardActive: {
        shadowColor: "#6C5CE7",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 3},
        elevation: 3,
    },
    visIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    visTitle: {fontSize: 14, fontWeight: "700"},
    visCheck: {position: "absolute", top: 8, right: 8},

    // Create button
    createBtn: {
        backgroundColor: "#6C5CE7",
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#6C5CE7",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4},
        elevation: 6,
    },
    createBtnText: {color: "#fff", fontWeight: "800", fontSize: 16},
});

export default CreatePlaylist;
