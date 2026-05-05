import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import {PieChart} from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {Ionicons} from "@expo/vector-icons";
import {Router, useRouter} from "expo-router";
import Header from "@/src/components/Header";
import {AuthGuardWrapper} from "../components/AuthGuardMapper";
import StatCardStats from "../components/StatCardStats";
import apiClient from "../api/client";
import {jwtDecode} from "jwt-decode";
import * as SecureStore from "expo-secure-store";

const Stats = () => {
    const router: Router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        listened: 0,
        later: 0,
        favorite: 0,
        disliked: 0,
    });

    useEffect((): void => {
        loadUserStats();
    }, []);

    const loadUserStats: () => Promise<void> = async (): Promise<void> => {
        try {
            const token: string | null = await SecureStore.getItemAsync("userToken");
            if (!token) return;

            const decoded: any = jwtDecode(token);
            const userId = decoded.id;

            const response = await apiClient.get(`/medias/status/user/${userId}`);
            const data = response.data.mediasStatus;

            const counts = {
                listened: data.filter((m: any): boolean => m.status === "listened").length,
                later: data.filter((m: any): boolean => m.status === "later").length,
                favorite: data.filter((m: any): boolean => m.status === "favorite").length,
                disliked: data.filter((m: any): boolean => m.status === "disliked").length,
            };

            setStats(counts);
        } catch (error) {
            console.error("Erreur lors du chargement des stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const pieData: { value: number; color: string }[] = [
        {value: stats.listened, color: "#00ffa3"},
        {value: stats.later, color: "#3b82f6"},
        {value: stats.favorite, color: "#fbbf24"},
        {value: stats.disliked, color: "#f43f5e"},
    ];

    const Legend = ({item, color}: { item: string; color: string }) => (
        <View style={styles.legendItem}>
            <View style={[styles.dot, {backgroundColor: color}]}/>
            <Text style={styles.legendLabel}>{item}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, {justifyContent: "center"}]}>
                <ActivityIndicator size="large" color="#3b82f6"/>
            </View>
        );
    }

    return (
        <AuthGuardWrapper>
            <View style={styles.container}>
                <Header/>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.mainTitle}>Mes statistiques</Text>
                    </View>

                    <View style={styles.grid}>
                        <StatCardStats
                            title="Écoutés"
                            count={stats.listened.toString()}
                            icon="check-circle-outline"
                            color="#00ffa3"
                            onPress={(): void =>
                                router.push({
                                    pathname: "/statDetails",
                                    params: {type: "listened"},
                                })
                            }
                        />
                        <StatCardStats
                            title="À écouter plus tard"
                            count={stats.later.toString()}
                            icon="playlist-music"
                            color="#3b82f6"
                            onPress={(): void =>
                                router.push({
                                    pathname: "/statDetails",
                                    params: {type: "later"},
                                })
                            }
                        />
                        <StatCardStats
                            title="Favoris"
                            count={stats.favorite.toString()}
                            icon="star"
                            color="#fbbf24"
                            onPress={(): void =>
                                router.push({
                                    pathname: "/statDetails",
                                    params: {type: "favorite"},
                                })
                            }
                        />
                        <StatCardStats
                            title="Je n'aime pas"
                            count={stats.disliked.toString()}
                            icon="close-circle-outline"
                            color="#f43f5e"
                            onPress={(): void =>
                                router.push({
                                    pathname: "/statDetails",
                                    params: {type: "disliked"},
                                })
                            }
                        />
                    </View>

                    <View style={styles.chartBox}>
                        <View style={styles.chartHeaderRow}>
                            <Ionicons name="stats-chart" size={20} color="#3b82f6"/>
                            <Text style={styles.chartHeaderText}>
                                Détail des statistiques
                            </Text>
                        </View>
                        <View style={styles.pieWrapper}>
                            {stats.listened + stats.later + stats.favorite + stats.disliked >
                            0 ? (
                                <PieChart
                                    donut
                                    radius={80}
                                    innerRadius={60}
                                    data={pieData}
                                    innerCircleColor={"#2A2A38"}
                                    centerLabelComponent={() => (
                                        <Icon name="music" size={50} color="#ad46ff"/>
                                    )}
                                />
                            ) : (
                                <Text style={{color: "#888", paddingVertical: 20}}>
                                    Aucune donnée
                                </Text>
                            )}
                        </View>
                        <View style={styles.legendGrid}>
                            <Legend item="Écoutés" color="#00ffa3"/>
                            <Legend item="À écouter" color="#3b82f6"/>
                            <Legend item="Favoris" color="#fbbf24"/>
                            <Legend item="Détestés" color="#f43f5e"/>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </AuthGuardWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1C1C28",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 25,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    chartBox: {
        backgroundColor: "#2A2A38",
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    chartHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    chartHeaderText: {
        color: "#fff",
        marginLeft: 10,
    },
    pieWrapper: {
        alignItems: "center",
    },
    legendGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        margin: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendLabel: {
        color: "#fff",
        fontSize: 12,
    },
});

export default Stats;
