import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "@/src/components/Header";
import StatCard from "@/src/components/StatCard";
import { AuthGuardWrapper } from "../components/AuthGuardMapper";

const Stats = () => {
  const router = useRouter();

  const pieData = [
    { value: 87, color: "#00ffa3" },
    { value: 12, color: "#3b82f6" },
    { value: 34, color: "#fbbf24" },
    { value: 5, color: "#f43f5e" },
  ];

  const Legend = ({ item, color }: { item: string; color: string }) => (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{item}</Text>
    </View>
  );

  return (
    <AuthGuardWrapper>
      <View style={styles.container}>
        <Header />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.mainTitle}>Mes statistiques</Text>
          </View>

          <View style={styles.grid}>
            <StatCard
              title="Écoutés"
              count="12"
              icon="check-circle-outline"
              color="#00ffa3"
              onPress={() => router.push("/listeningstat")}
            />

            <StatCard
              title="À écouter plus tard"
              count="34"
              icon="playlist-music"
              color="#4747ff"
              onPress={() => router.push("/listeninglaterstat")}
            />

            <StatCard
              title="Favoris"
              count="34"
              icon="star"
              color="#fbbf24"
              onPress={() => router.push("/favoritestat")}
            />

            <StatCard
              title="Je n'aime pas"
              count="5"
              icon="close-circle-outline"
              color="#f43f5e"
              onPress={() => router.push("/dontlikestat")}
            />
          </View>

          <View style={styles.chartBox}>
            <View style={styles.chartHeaderRow}>
              <Ionicons name="stats-chart" size={20} color="#3b82f6" />
              <Text style={styles.chartHeaderText}>
                Détail des statistiques
              </Text>
            </View>
            <View style={styles.pieWrapper}>
              <PieChart
                donut
                radius={80}
                innerRadius={60}
                data={pieData}
                innerCircleColor={"#2A2A38"}
                centerLabelComponent={() => (
                  <Icon name="music" size={50} color="#ad46ff" />
                )}
              />
            </View>
            <View style={styles.legendGrid}>
              <Legend item="Écoutés" color="#00ffa3" />
              <Legend item="À écouter plus tard" color="#3b82f6" />
              <Legend item="Favoris" color="#fbbf24" />
              <Legend item="Je n'aime pas" color="#f43f5e" />
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
