import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/components/Header";

// Simulation de données
const Listnotifications = [
    { id: '1',
        user: '@alexdj',
        action: 'liked your review of "Midnight Pulse"',
        time: '5 minutes ago',
        type: 'heart',
        color: '#ec4899',
        initial: 'AL'
    },

    { id: '2',
        user: '@beatmaster',
        action: 'commented on your review',
        time: '1 hour ago',
        type: 'chatbubble',
        color: '#3b82f6',
        initial: 'BE'
    },

    { id: '3',
        user: '@musiclover92',
        action: 'started following you',
        time: '3 hours ago',
        type: 'person-add',
        color: '#10b981',
        initial: 'MU'
    },

    { id: '4',
        user: '@technohead',
        action: 'rated "Electric Soul" 5 stars',
        time: '1 day ago',
        type: 'star',
        color: '#f59e0b',
        initial: 'TE'
    },

    { id: '5',
        user: '@soundwave',
        action: 'liked your list "Late Night Vibes"',
        time: '2 days ago',
        type: 'heart',
        color: '#ec4899',
        initial: 'SO'
    },

];

export default function Notifications() {

    const [filter, setFilter] = React.useState('Tout'); 

    const filteredNotifications = Listnotifications.filter(item => {
        if (filter === 'Tout') return true;
        if (filter === 'Non lue') return parseInt(item.id) <= 3;
        if (filter === 'Mentions') return item.action.includes('commented'); 
        return true;
    });

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.Content}>

                {/* Haut de la page */}
                <View style={styles.TopPage}>
                    <Text style={styles.Title}>Notifications</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.markRead}>Marquer tout comme lu</Text>
                </TouchableOpacity>
                <Text style={styles.unreadText}>3 notifications non lue</Text>

                {/* Filtres */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, filter === 'Tout' && styles.activeTab]}
                        onPress={() => setFilter('Tout')}
                    >
                        <Text style={filter === 'Tout' ? styles.activeTabText : styles.tabText}>Tout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, filter === 'Non lue' && styles.activeTab]}
                        onPress={() => setFilter('Non lue')}
                    >
                        <Text style={filter === 'Non lue' ? styles.activeTabText : styles.tabText}>Non lue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, filter === 'Mentions' && styles.activeTab]}
                        onPress={() => setFilter('Mentions')}
                    >
                        <Text style={filter === 'Mentions' ? styles.activeTabText : styles.tabText}>Mentions</Text>
                    </TouchableOpacity>
                </View>

                {/* Les Notifications */}
                {filteredNotifications.map((item) => (
                    <View key={item.id} style={styles.notificationCard}>
                        <View style={styles.iconPlace}>
                            <View style={[styles.Icon, { backgroundColor: '#1e1e2d' }]}>
                                <Ionicons name={item.type as any} size={16} color={item.color} />
                            </View>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.initial}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.Body}>
                            <Text style={styles.message}>
                                <Text style={styles.userName}>
                                    {item.user}
                                </Text>
                                {item.action}
                            </Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>

                        {/* Notification non lue */}
                        {parseInt(item.id) <= 3 && <View style={styles.unreadDot} />}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1,
        backgroundColor: '#1C1C28'
    },

    Content: { padding: 20
    },

    TopPage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },

    Title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold'
    },

    markRead: {
        color: '#94a3b8',
        fontSize: 14
    },

    unreadText: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 5
    },

    tabs: {
        flexDirection: 'row',
        backgroundColor: '#1e1e2d',
        borderRadius: 12,
        padding: 4,
        marginVertical: 25
    },

    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },

    activeTab: {
        backgroundColor: '#2d2d3f'
    },

    tabText: {
        color: '#94a3b8',
        fontWeight: '600'
    },

    activeTabText: {
        color: 'white',
        fontWeight: 'bold'
    },

    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#1c1c24',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d2d3f'
    },
    iconPlace: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    Icon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2d2d3f',
        justifyContent: 'center',
        alignItems: 'center'
    },

    avatarText: {
        color: '#3b82f6',
        fontWeight: 'bold'
    },

    Body: { flex: 1,
        marginLeft: 15
    },

    message: {
        color: '#d1d5db',
        fontSize: 15,
        lineHeight: 20
    },

    userName: {
        color: 'white',
        fontWeight: 'bold'
    },

    time: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 4
    },

    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        marginLeft: 10
    }

});