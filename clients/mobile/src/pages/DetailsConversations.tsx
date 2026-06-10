import React, {useState, useEffect, useRef} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from "react-native";
import {Router, useLocalSearchParams, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import apiClient from "../api/client";
import * as SecureStore from "expo-secure-store";
import {jwtDecode} from "jwt-decode";
import {useTranslation} from "react-i18next";

import {io, Socket} from "socket.io-client";

const SOCKET_URL: string | undefined = process.env.EXPO_PUBLIC_API_URL;

const DetailsConversations = () => {
    const {conversationId, userName} = useLocalSearchParams();
    const router: Router = useRouter();
    const {t} = useTranslation();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect((): void => {
        const getUserId = async (): Promise<void> => {
            try {
                const token: string | null = await SecureStore.getItemAsync("userToken");
                if (token) {
                    const decoded: any = jwtDecode(token);
                    setCurrentUserId(decoded.id);
                }
            } catch (e) {
                console.error("Erreur token:", e);
            }
        };
        getUserId();
    }, []);

    const fetchMessages = async (): Promise<void> => {
        if (!conversationId) return;
        try {
            const response = await apiClient.get(
                `/messages/conversation/${conversationId}`,
            );

            const formattedMessages = (response.data.messages || []).map(
                (m: any) => ({
                    ...m,
                    id: m.id || `msg-api-${Math.random()}-${Date.now()}`,
                }),
            );

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Erreur fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect((): void => {
        if (conversationId && currentUserId) fetchMessages();
    }, [conversationId, currentUserId]);

    useEffect(() => {
        if (!conversationId || !currentUserId) return;

        const setupSocket = async (): Promise<void> => {
            const token: string | null = await SecureStore.getItemAsync("userToken");

            socketRef.current = io(SOCKET_URL!, {
                auth: {token},
                transports: ["websocket"],
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            socketRef.current.on("connect", (): void => {
                socketRef.current?.emit("join_conversation", {conversationId});
            });

            if (socketRef.current.connected) {
                socketRef.current.emit("join_conversation", {conversationId});
            }

            socketRef.current.on("receive_message", (message: any): void => {
                if (message.conversation_id === conversationId) {
                    const safeMessage = {
                        ...message,
                        id: message.id || `msg-live-${Date.now()}-${Math.random()}`,
                    };

                    setMessages((prev: any[]): any[] => {
                        const exists = prev.find((m): boolean => m.id === safeMessage.id);
                        if (exists) return prev;
                        return [safeMessage, ...prev];
                    });
                }
            });
        };

        setupSocket();

        return (): void => {
            socketRef.current?.disconnect();
        };
    }, [conversationId, currentUserId]);

    const sendMessage = async (): Promise<void> => {
        if (!newMessage.trim()) return;

        if (!socketRef.current || !socketRef.current.connected) {
            console.warn("Socket non connecté, impossible d'envoyer le message");
            return;
        }

        socketRef.current.emit("send_message", {
            conversation_id: conversationId,
            content: newMessage.trim(),
        });

        setNewMessage("");
    };

    const renderMessage = ({item}: { item: any; index: number }) => {
        const isMine: boolean = item.sender_id === currentUserId;
        return (
            <View
                style={[
                    styles.messageRow,
                    isMine ? styles.myMessageRow : styles.theirMessageRow,
                ]}
            >
                <View
                    style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isMine ? styles.myText : styles.theirText,
                        ]}
                    >
                        {item.content}
                    </Text>
                    <Text
                        style={[styles.timeText, isMine ? styles.myTime : styles.theirTime]}
                    >
                        {new Date(item.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content"/>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.iconButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#4cc9f0"/>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.avatarText}>
                            {(userName as string)?.substring(0, 1).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.headerTitle}>{userName}</Text>
                </View>
                <View style={{width: 40}}/>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index: number) => item.id || index.toString()}
                    renderItem={renderMessage}
                    inverted
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={t("type_message_placeholder")}
                            placeholderTextColor="#55577e"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                !newMessage.trim() && styles.sendDisabled,
                            ]}
                            onPress={sendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Ionicons name="send" size={18} color="#000"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#0b0c14"},

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: "#0b0c14",
        borderBottomWidth: 1,
        borderColor: "#1e1f33",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2d2e4a",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarText: {color: "#fff", fontWeight: "bold"},
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    iconButton: {padding: 5},

    listContent: {paddingHorizontal: 16, paddingVertical: 20},
    messageRow: {flexDirection: "row", width: "100%", marginVertical: 6},
    myMessageRow: {justifyContent: "flex-end"},
    theirMessageRow: {justifyContent: "flex-start"},

    bubble: {
        maxWidth: "80%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: "#4cc9f0",
        borderBottomRightRadius: 4,
        shadowColor: "#4cc9f0",
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    theirBubble: {
        backgroundColor: "#16172b",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#1e1f33",
    },
    messageText: {fontSize: 16, lineHeight: 22},
    myText: {color: "#000", fontWeight: "500"},
    theirText: {color: "#fff"},

    timeText: {fontSize: 10, marginTop: 4, opacity: 0.7},
    myTime: {color: "rgba(0,0,0,0.6)", alignSelf: "flex-end"},
    theirTime: {color: "#8a8db0", alignSelf: "flex-start"},

    inputWrapper: {padding: 15, backgroundColor: "#0b0c14"},
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#16172b",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#2d2e4a",
    },
    input: {flex: 1, color: "#fff", fontSize: 16, paddingHorizontal: 10},
    sendButton: {
        backgroundColor: "#4cc9f0",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendDisabled: {backgroundColor: "#2d2e4a", opacity: 0.5},
});

export default DetailsConversations;
