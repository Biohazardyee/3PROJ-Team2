import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Dimensions} from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderStart from "@/src/components/HeaderStart";

type StatCardProps =  {
  title: string;
  count: string;
  icon: string;
  color: string;
  progress: number;
}

const Card: React.FC<StatCardProps> = ({ title, count, icon, color, progress }) => (
  <Pressable style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={20} color={color} />
      <Text style={styles.cardCount}>{count}</Text>
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  </Pressable>
);

const Library = () => {
  const pieData = [
    { value: 87, color: '#00ffa3' },
    { value: 12, color: '#3b82f6' },
    { value: 34, color: '#fbbf24' },
    { value: 5, color: '#f43f5e' },
  ];

  return (
    <View style={styles.container}>
      <HeaderStart />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Ma bibliothèque</Text>
          <Text style={styles.subtitle}>Votre collection personnelle </Text>
        </View>

        <View style={styles.grid}>
          <Card title="Ecouté" count="12" icon="clock-outline" color="#3b82f6" progress={30} />
          <Card title="Compléter" count="87" icon="check-circle-outline" color="#00ffa3" progress={80} />
          <Card title="Liste de souhait" count="34" icon="playlist-music" color="#fbbf24" progress={45} />
          <Card title="Supprimer" count="5" icon="close-circle-outline" color="#f43f5e" progress={15} />
        </View>

        <View style={styles.chartBox}>
          <View style={styles.chartHeaderRow}>
            <Icon name="chart-donut" size={20} color="#3b82f6" />
            <Text style={styles.chartHeaderText}>Distribution de la bibliothèque</Text>
          </View>
          <View style={styles.pieWrapper}>
            <PieChart
              donut
              radius={80}
              innerRadius={60}
              data={pieData}
              innerCircleColor={'#1c1e2d'}
              centerLabelComponent={() => <Icon name="music" size={50} color="#ad46ff" />}
            />
          </View>
          <View style={styles.legendGrid}>
            <Legend item="Ecouté" color="#3b82f6" />
            <Legend item="Compléter" color="#00ffa3" />
            <Legend item="Liste de souhait" color="#fbbf24" />
            <Legend item="Supprimer" color="#f43f5e" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Legend = ({ item, color }: { item: string, color: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{item}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#0f111a'
 },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 20
 },
  header: { 
    marginBottom: 25
 },
  mainTitle: {
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff' 
},
  subtitle: { 
    fontSize: 14, 
    color: '#8e8e93' 
},
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
},
  card: { 
    backgroundColor: '#1c1e2d', 
    width: '48%', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15
 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
},
  cardCount: { fontSize: 22,
    fontWeight: 'bold',
    color: '#fff' 
},
  cardTitle: { 
    color: '#8e8e93', 
    marginTop: 10 
},
  progressBarBg: { 
    height: 4, 
    backgroundColor: '#2a2d3d', 
    borderRadius: 2, 
    marginTop: 10 
},
  progressBarFill: { 
    height: 4, 
    borderRadius: 2 
},
  chartBox: { 
    backgroundColor: '#1c1e2d', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 30 
},
  chartHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
},
  chartHeaderText: { 
    color: '#fff', 
    marginLeft: 10 
},
  pieWrapper: { 
    alignItems: 'center'
 },
  legendGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginTop: 20 
},
  legendItem: { 
    flexDirection: 'row',
     alignItems: 'center',
      margin: 8
     },
  dot: { 
    width: 10,
    height: 10, 
    borderRadius: 5, 
    marginRight: 5 
},
  legendLabel: { 
    color: '#fff', fontSize: 12 
}
});

export default Library;