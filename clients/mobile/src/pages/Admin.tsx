import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, } from 'react-native';
import Header from "@/src/components/Header";
import { Ionicons } from '@expo/vector-icons';

type TabType = 'Users' | 'Reports' | 'Analytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Users');
  
  return (
    <View style={styles.page}>
      <Header />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-half-outline" size={40} color="#d71717" />
          </View>
          <View>
            <Text style={styles.Title}>Admin</Text>
            <Text style={styles.Title}>Tableau de bord</Text>
            <Text style={styles.Subtitle}>Gérer les utilisateurs et modérer le contenu</Text>
          </View>
        </View>

        {/* STATS CARDS (Aperçu rapide) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <StatCard label="Total Users" value="12 847" color="#ad46ff" />
          <StatCard label="Active Users" value="8 923" color="#ad46ff" />
          <StatCard label="Albums" value="45 621" color="#ad46ff" />
        </ScrollView>

        {/* NAVBAR TABS */}
        <View style={styles.navBar}>
          <TabButton label="User Management" active={activeTab === 'Users'} onPress={() => setActiveTab('Users')} />
          <TabButton label="Reports" badge="23" active={activeTab === 'Reports'} onPress={() => setActiveTab('Reports')} />
        </View>

        {/* CONTENT AREA */}
        <ScrollView style={styles.content}>
          {activeTab === 'Users' && <UsersView />}
          {activeTab === 'Reports' && <ReportsView />}
        </ScrollView>

      </View>
    </View>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.badge, { backgroundColor: color }]}>
       <Text style={styles.badgeText}>Total</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TabButton = ({ label, active, onPress, badge }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    {badge && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{badge}</Text></View>}
  </TouchableOpacity>
);

const UsersView = () => (
  <View>
    {/* Barre de recherche */}
    <View style={styles.searchRow}>
      <TextInput 
        style={styles.searchInput} 
        placeholder="Search users..." 
        placeholderTextColor="#666" 
      />
      <TouchableOpacity style={styles.bannedBtn}>
        <Text style={{color: '#fff', fontSize: 12}}>Utilisateurs bannis</Text>
      </TouchableOpacity>
    </View>

    {/* User Card Example */}
    <View style={styles.userCard}>
       <View style={styles.userInfo}>
          <View style={styles.avatar}><Text style={{color:'#fff'}}>AL</Text></View>
          <View>
            <Text style={styles.userName}>@alexdj</Text>
            <Text style={styles.userBio}>Electronic music enthusiast</Text>
            <Text style={styles.userStats}>1247 followers • 138 albums</Text>
          </View>
       </View>
       <View style={styles.cardActions}>
          <TouchableOpacity style={styles.btnSecondary}><Text style={{color:'#fff'}}>Regarder le profil</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnDanger}><Text style={{color:'#fff'}}>Bannir l'utilisateur</Text></TouchableOpacity>
       </View>
    </View>
  </View>
);

const ReportsView = () => (
  <View>
    <View style={styles.reportCard}>
       <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Report #1</Text>
          <View style={styles.pendingBadge}><Text style={{color:'#fff', fontSize: 10}}>En attente</Text></View>
       </View>
       <Text style={styles.reportDetail}>Target: <Text style={{color: '#4cc9f0'}}>@spammer01</Text></Text>
       <Text style={styles.reportDetail}>Reason: Inappropriate language in review</Text>
       <View style={styles.cardActions}>
          <TouchableOpacity style={styles.btnPrimary}><Text style={{color:'#fff'}}>Regarder le contenu</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnDanger}><Text style={{color:'#fff'}}>Faire une action</Text></TouchableOpacity>
       </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  page: {
     flex: 1,
     backgroundColor: '#0f101a'
    },
  container: {
    flex: 1, 
    padding: 15 
},
  
  topSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25 
},
  shieldIcon: { 
    width: 60, 
    height: 60, 
    backgroundColor: '#ffbdbd', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15, 
    borderWidth: 1, 
    borderColor: '#333' 
},
  Title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    lineHeight: 30 
},
  Subtitle: { 
    color: '#888',
    fontSize: 13, 
    marginTop: 5 
},
  statsScroll: { 
    maxHeight: 120, 
    marginBottom: 20 
},
  statCard: { 
    backgroundColor: '#1e1f33', 
    padding: 15, 
    borderRadius: 12, 
    marginRight: 10, 
    width: 150, 
    borderWidth: 1, 
    borderColor: '#2d2e4a' 
},
  statValue: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold',
    marginVertical: 5 
},
  statLabel: { 
    color: '#888', 
    fontSize: 12 
},
  badge: { 
    position: 'absolute', 
    right: 10, 
    top: 10, 
    paddingHorizontal: 6, 
    borderRadius: 4 
},
  badgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
},

  navBar: { 
    flexDirection: 'row', 
    backgroundColor: '#1a1b2e', 
    borderRadius: 10, 
    padding: 5, 
    marginBottom: 20 
},
  tabButton: { 
    flex: 1, 
    flexDirection: 'row', 
    paddingVertical: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 8 
},
  tabButtonActive: { 
    backgroundColor: '#2d2e4a' 
},
  tabText: { color: '#888', 
    fontSize: 12, 
    fontWeight: 'bold' 
},
  tabTextActive: { 
    color: '#fff' 
},
  tabBadge: { 
    backgroundColor: '#ad46ff', 
    marginLeft: 5, 
    borderRadius: 10, 
    paddingHorizontal: 6 
},
  tabBadgeText: { 
    color: '#fff', 
    fontSize: 10 
},
  searchRow: { 
    flexDirection: 'row',
    gap: 10, 
    marginBottom: 20 
},
  searchInput: { 
    flex: 2, 
    backgroundColor: '#1e1f33', 
    borderRadius: 8, 
    padding: 12, 
    color: '#fff', 
    borderWidth: 1, 
    borderColor: '#2d2e4a'
 },
  bannedBtn: { 
    flex: 1, 
    backgroundColor: '#1e1f33', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#2d2e4a' 
},
  userCard: { 
    backgroundColor: '#1e1f33', 
    borderRadius: 12, 
    padding: 15,
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#2d2e4a'
 },
  userInfo: { 
    flexDirection: 'row',
    marginBottom: 15 
},
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#2d2e4a', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
},
  userName: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
},
  userBio: { 
    color: '#888', 
    fontSize: 12 
},
  userStats: {
     color: '#4cc9f0', 
     fontSize: 11, 
     marginTop: 4 
},

  reportCard: {
    backgroundColor: '#1e1f33', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#ff005533' 
},
  reportHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
},
  reportTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
},
  pendingBadge: { 
    backgroundColor: '#ff0055', 
    paddingHorizontal: 8, 
    borderRadius: 4, 
    height: 18 
},
  reportDetail: { 
    color: '#ccc', 
    fontSize: 13, 
    marginBottom: 5 
},
  cardActions: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 10 
},
  btnPrimary: { 
    flex: 1, 
    backgroundColor: '#4361ee', 
    padding: 10, 
    borderRadius: 6, 
    alignItems: 'center'
 },
  btnSecondary: { 
    flex: 1, 
    backgroundColor: '#2d2e4a', 
    padding: 10, 
    borderRadius: 6, 
    alignItems: 'center' 
},
  btnDanger: { 
    flex: 1, 
    backgroundColor: '#ff0055', 
    padding: 10, 
    borderRadius: 6, 
    alignItems: 'center' 
},
  content: { flex: 1 }
});

export default AdminDashboard;