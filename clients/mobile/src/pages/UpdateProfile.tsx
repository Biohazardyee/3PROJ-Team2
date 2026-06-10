import React, {useEffect, useState, useRef} from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import {updateProfile} from "../api/user";
import BackButton from "../components/BackButton";
import * as ImagePicker from "expo-image-picker";
import {Ionicons} from "@expo/vector-icons";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";

const UpdateProfile = () => {
    const [username, setUsername] = useState("");
    const [favoriteBand, setFavoriteBand] = useState("");
    const [biography, setBiography] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [loading, setLoading] = useState(false);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<any>(null);


    const USERNAME_MAX: number = 20;
    const BIO_MAX: number = 150;

    const searchArtists = (text: string): void => {
        setFavoriteBand(text);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (text.length > 2) {
            setIsSearching(true);

            searchTimeout.current = setTimeout(async (): Promise<void> => {
                try {
                    const response = await apiClient.get(`/api/search?query=${text}`);

                    const albums =
                        response.data.searchResults?.results?.albummatches?.album || [];

                    const uniqueArtists = [...new Set(albums.map((a: any) => a.artist))];

                    setSuggestions(uniqueArtists.map((name) => ({name})).slice(0, 5));

                    setShowSuggestions(true);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    useEffect((): void => {
        const loadUser = async (): Promise<void> => {
            try {
                const token: string | null = await SecureStore.getItemAsync("userToken");
                if (!token) return;

                const decoded: any = jwtDecode(token);
                const userId = decoded.id;

                const res = await apiClient.get(`/users/public/${userId}`);
                const user = res.data.user || res.data;

                setUsername(user.username || "");
                setFavoriteBand(user.favorite_band || "");
                setBiography(user.biography || "");
                setProfilePicture(user.profile_picture || "");
            } catch (e) {
                console.error("Erreur load profile:", e);
            }
        };

        loadUser();
    }, []);

    const pickImage = async (): Promise<void> => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission refusée", "Accès aux images requis");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const img = result.assets[0];

            setProfilePicture(img.base64 || img.uri);
        }
    };

    const handleSave = async (): Promise<void> => {
        try {
            setLoading(true);

            await updateProfile({
                username,
                favorite_band: favoriteBand,
                biography,
                profile_picture: profilePicture,
            });

            Alert.alert("Succès", "Profil mis à jour");
        } catch (err) {
            console.error(err);
            Alert.alert("Erreur", "Impossible de mettre à jour le profil");
        } finally {
            setLoading(false);
        }
    };

    const renderAvatar = () => {
        if (profilePicture) {
            return (
                <Image
                    source={{
                        uri: profilePicture.startsWith("data")
                            ? `data:image/jpeg;base64,${profilePicture}`
                            : profilePicture,
                    }}
                    style={styles.avatar}
                />
            );
        }

        return (
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                    {username?.substring(0, 2).toUpperCase() || "U"}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <BackButton/>

            <Text style={styles.title}>Modifier le profil</Text>
            <Text style={styles.subtitle}>Personnalise tes informations</Text>

            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                {renderAvatar()}
                <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={16} color="white"/>
                </View>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.label}>
                    Username ({username.length}/{USERNAME_MAX})
                </Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={(text: string) =>
                        text.length <= USERNAME_MAX && setUsername(text)
                    }
                />

                <Text style={styles.label}>Favorite band</Text>

                <TextInput
                    style={styles.input}
                    value={favoriteBand}
                    onChangeText={searchArtists}
                    placeholderTextColor="#666"
                />

                {showSuggestions && (
                    <View style={styles.suggestions}>
                        {isSearching ? (
                            <ActivityIndicator color="#4A90E2"/>
                        ) : (
                            suggestions.map((item, i: number) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={(): void => {
                                        setFavoriteBand(item.name);
                                        setShowSuggestions(false);
                                    }}
                                    style={styles.suggestionItem}
                                >
                                    <Ionicons name="musical-notes" color="#aaa" size={16}/>
                                    <Text style={{color: "white", marginLeft: 10}}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                <Text style={styles.label}>
                    Biography ({biography.length}/{BIO_MAX})
                </Text>

                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={biography}
                    onChangeText={(text: string) => text.length <= BIO_MAX && setBiography(text)}
                    multiline
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && {opacity: 0.6}]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white"/>
                ) : (
                    <Text style={styles.buttonText}>Sauvegarder</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f1e",
        padding: 20,
    },

    title: {
        color: "white",
        fontSize: 26,
        fontWeight: "800",
        marginTop: 10,
    },

    subtitle: {
        color: "#888",
        marginBottom: 20,
    },

    suggestions: {
        backgroundColor: "#1c1c2e",
        borderRadius: 12,
        marginTop: 5,
        borderWidth: 1,
        borderColor: "#2a2a40",
        overflow: "hidden",
    },

    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a40",
    },

    card: {
        backgroundColor: "#1c1c2e",
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#2a2a40",
    },

    label: {
        color: "#9ca3af",
        marginBottom: 6,
        marginTop: 12,
        fontSize: 13,
    },

    input: {
        backgroundColor: "#2a2a40",
        borderRadius: 10,
        padding: 12,
        color: "white",
        borderWidth: 1,
        borderColor: "#2a2a40",
    },

    textArea: {
        height: 100,
        textAlignVertical: "top",
    },

    button: {
        backgroundColor: "#4A90E2",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },

    buttonText: {
        color: "white",
        fontWeight: "700",
    },

    avatarContainer: {
        alignSelf: "center",
        marginTop: 20,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "#4A90E2",
    },

    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 60,
        backgroundColor: "#4A90E2",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "white",
        fontSize: 28,
        fontWeight: "800",
    },

    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#4A90E2",
        padding: 6,
        borderRadius: 12,
    },
});

export default UpdateProfile;
