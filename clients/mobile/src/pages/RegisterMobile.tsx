import {Router, useRouter} from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import {ButtonMobile} from "../components/ButtonMobile";
import {InputMobile} from "../components/InputMobile";
import {Ionicons} from "@expo/vector-icons";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import {ParsedURL} from "expo-linking";
import {WebBrowserAuthSessionResult} from "expo-web-browser";
import {useTranslation} from "react-i18next";

WebBrowser.maybeCompleteAuthSession();

const RegisterMobile: React.FC = () => {
    const router: Router = useRouter();
    const {t} = useTranslation();

    // State pour les champs du formulaire
    const [email, setEmail] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [favorite_band, setfavorite_band] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);


    const handleOAuth: (provider: "google" | "discord") => Promise<void> = async (provider: "google" | "discord"): Promise<void> => {
        try {
            const redirectUri: string = AuthSession.makeRedirectUri({
                scheme: "projetsupcontentmobile",
            });

            const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/oauth/auth/${provider}?platform=mobile&redirect_uri=${encodeURIComponent(redirectUri)}`;

            const result: WebBrowserAuthSessionResult = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUri,
            );

            if (result.type === "success" && result.url) {
                const parsedUrl: ParsedURL = Linking.parse(result.url);

                const token = parsedUrl.queryParams?.token as string;
                const error = parsedUrl.queryParams?.error as string;

                if (error) {
                    Alert.alert(
                        "Compte existant",
                        "Cet email est déjà lié à un autre compte.",
                    );
                    return;
                }

                if (token) {
                    await SecureStore.setItemAsync("userToken", token);
                    router.replace("/onboarding");
                } else {
                    Alert.alert("Erreur", "Aucun token reçu après l'authentification.");
                }
            }
        } catch (error) {
            console.error("Erreur OAuth:", error);
            Alert.alert("Erreur", "La connexion a échoué.");
        }
    };

    const handleRegister: () => Promise<void> = async (): Promise<void> => {
        if (!email || !username || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }
        setIsLoading(true);

        try {
            const response = await apiClient.post("/users/signin", {
                email,
                username,
                password,
                favorite_band,
            });

            const {token} = response.data;

            if (token) {
                await SecureStore.setItemAsync("userToken", token);
                router.push("/onboarding");
            } else {
                Alert.alert("Succès", "Compte créé, veuillez vous connecter.");
                router.push("/login");
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                "Erreur lors de la création du compte.";
            Alert.alert("Erreur", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    {/* Logo */}
                    <Image
                        source={require("@/assets/images/logo.png")}
                        style={styles.logoImage}
                    />
                    <Text style={styles.title}>{t("register_title")}</Text>
                    <Text style={styles.subtitle}>{t("register_subtitle")}</Text>
                </View>

                <InputMobile
                    label={t("register_email_label")}
                    placeholder="votre@email.com"
                    icon="mail-outline"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <InputMobile
                    label={t("register_username_label")}
                    placeholder="fan"
                    icon="person-circle-outline"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <InputMobile
                    label={t("register_password_label")}
                    placeholder="••••••••"
                    icon="lock-closed-outline"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <View style={{zIndex: 1000}}>
                    {showSuggestions && suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <ScrollView
                                style={{maxHeight: 200}}
                                keyboardShouldPersistTaps="handled"
                            >
                                {suggestions.map((item, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.suggestionItem}
                                        onPress={(): void => {
                                            setfavorite_band(item.name);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                <ButtonMobile
                    title={t("register_submit_btn")}
                    style={{marginTop: 10}}
                    onPress={handleRegister}
                    disabled={isLoading}
                />

                <View style={styles.separator}>
                    <View style={styles.line}/>
                    <Text style={styles.sepText}>{t("register_separator")}</Text>
                    <View style={styles.line}/>
                </View>

                <View style={styles.socialRow}>
                    <ButtonMobile variant="social" onPress={(): Promise<void> => handleOAuth("google")}>
                        <Ionicons name="logo-google" size={24} color="#FFF"/>
                    </ButtonMobile>

                    <ButtonMobile
                        variant="social"
                        onPress={(): Promise<void> => handleOAuth("discord")}
                        style={{marginHorizontal: 10}}
                    >
                        <Ionicons name="logo-discord" size={24} color="#FFF"/>
                    </ButtonMobile>

                    <ButtonMobile variant="social">
                        <Ionicons name="logo-facebook" size={24} color="#FFF"/>
                    </ButtonMobile>
                </View>

                <TouchableOpacity
                    onPress={(): void => router.push("/login")}
                    style={styles.footer}
                >
                    <Text style={styles.footerText}>
                        {t("register_already_account")} <Text style={styles.link}>{t("register_login_link")}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1C1C28",
    },

    scroll: {
        padding: 25,
    },
    logoImage: {
        width: 80,
        height: 80,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },

    logo: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },

    title: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
    },

    subtitle: {
        color: "#888",
        fontSize: 14,
        marginTop: 5,
    },
    suggestionsContainer: {
        backgroundColor: "#2D2D3F",
        borderRadius: 8,
        marginTop: -10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#3b82f6",
        overflow: "hidden",
    },
    suggestionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    suggestionText: {
        color: "#FFF",
        fontSize: 14,
    },

    separator: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 25,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#333",
    },

    sepText: {
        color: "#555",
        marginHorizontal: 10,
        fontSize: 12,
    },

    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    footer: {
        marginTop: 30,
        alignItems: "center",
    },

    footerText: {
        color: "#888",
    },

    link: {
        color: "#3b82f6",
        fontWeight: "bold",
    },
});

export default RegisterMobile;
