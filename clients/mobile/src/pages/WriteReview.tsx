import React, {useEffect, useState} from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Header from "@/src/components/Header";
import {Router, useLocalSearchParams, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";
import {useTranslation} from "react-i18next";

const WriteReview = () => {
    const { t } = useTranslation();
    const router: Router = useRouter();

    const {id, title, artist, cover, reviewId, editMode} =
        useLocalSearchParams();

    const [rating, setRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState("");
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect((): void => {
        const fetchReviewIfEdit = async (): Promise<void> => {
            if (!reviewId) return;

            try {
                const res = await apiClient.get(`/reviews/${reviewId}`);
                const reviewData = res.data.review;

                setRating(reviewData.rating);
                setReviewTitle(reviewData.title);
                setReview(reviewData.content);
            } catch (err) {
                console.error("Erreur fetch review:", err);
                Alert.alert(t("error"), t("review_load_error"));
            }
        };

        fetchReviewIfEdit();
    }, [reviewId]);

    const handlePublish = async (): Promise<void> => {
        if (rating === 0 || reviewTitle.trim() === "" || review.trim() === "") {
            Alert.alert("Oups !", t("review_fill_fields"));
            return;
        }

        setLoading(true);

        try {
            const userId: string | null = await SecureStore.getItemAsync("userId");

            if (!userId) {
                Alert.alert(t("error"), t("review_session_expired"));
                return;
            }

            const payload = {
                user_id: userId,
                media_id: id as string,
                rating,
                title: reviewTitle.trim(),
                content: review.trim(),
            };

            if (editMode === "true" && reviewId) {
                await apiClient.put(`/reviews/${reviewId}`, payload);

                Alert.alert(t("success"), t("review_update_success"));
                router.back();
                return;
            }

            await apiClient.post("/reviews", payload);

            Alert.alert(t("success"), t("review_publish_success"));
            router.back();
        } catch (error: any) {
            console.error(error);

            const msg = error.response?.data?.message || t("error");
            Alert.alert(t("error"), msg);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={(): void => setRating(index)}
                        disabled={loading}
                    >
                        <Ionicons
                            name={index <= rating ? "star" : "star-outline"}
                            size={32}
                            color={index <= rating ? "#e24ada" : "#444"}
                            style={{marginRight: 8}}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.safeArea}>
            <Header/>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>{t("write_comment")}</Text>
                        <Text style={styles.subtitle}>{t("placeholder_comment")}</Text>
                    </View>
                </View>

                <View style={styles.albumCard}>
                    <Image
                        source={{
                            uri: (cover as string) || "https://via.placeholder.com/80",
                        }}
                        style={styles.albumArt}
                    />
                    <View style={{flex: 1}}>
                        <Text style={styles.albumName} numberOfLines={1}>
                            {title || "Album Inconnu"}
                        </Text>
                        <Text style={styles.artistName} numberOfLines={1}>
                            {artist || "Artiste Inconnu"}
                        </Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>{t("rating")} *</Text>
                    {renderStars()}

                    <Text style={styles.label}>{t("review_title_label")}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("review_title_placeholder")}
                        placeholderTextColor="#666"
                        value={reviewTitle}
                        onChangeText={setReviewTitle}
                        maxLength={100}
                        editable={!loading}
                    />
                    <Text style={styles.charCount}>
                        {(reviewTitle || "").length} / 100 caractères
                    </Text>

                    <Text style={styles.label}>{t("review_content_label")}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder={t("review_content_placeholder")}
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={6}
                        value={review}
                        onChangeText={setReview}
                        editable={!loading}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelText}>{t("cancel")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.publishButton, loading && {opacity: 0.7}]}
                        onPress={handlePublish}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff"/>
                        ) : (
                            <>
                                <Ionicons
                                    name="save-outline"
                                    size={20}
                                    color="#fff"
                                    style={{marginRight: 8}}
                                />
                                <Text style={styles.publishText}>
                                    {editMode === "true" ? t("review_edit_button") : t("review_publish_button")}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0f111a",
    },
    container: {
        padding: 20,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        letterSpacing: 0.5,
    },
    subtitle: {
        color: "#8e8e93",
        fontSize: 14,
        marginTop: 4,
    },
    albumCard: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: 25,
    },
    albumArt: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
    },
    albumName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    artistName: {
        color: "#4A90E2",
        fontSize: 14,
    },
    formContainer: {
        marginBottom: 30,
    },
    label: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        marginTop: 20,
    },
    starsContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.07)",
        borderRadius: 8,
        padding: 15,
        color: "#fff",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    charCount: {
        color: "#666",
        fontSize: 12,
        marginTop: 5,
        textAlign: "left",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingBottom: 40,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        marginRight: 15,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    cancelText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    publishButton: {
        flexDirection: "row",
        backgroundColor: "#3b82f6",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: "center",
        minWidth: 150,
        justifyContent: "center",
    },
    publishText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default WriteReview;