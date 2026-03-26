import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import Header from "@/src/components/Header"; 

const MessagesScreen = () => {
  return (
    <View style={styles.safeArea}>
      <Header />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* titre */}
        <View style={styles.titleWrapper}>
          <Text style={styles.glitchTitleSub}>Messages</Text>
        </View>

        {/* BARRE DE RECHERCHE */}
        <TextInput 
          placeholder="Search conversations..." 
          placeholderTextColor="#666" 
          style={styles.searchInput} 
        />

        {/* LISTE TEST */}
        <View style={styles.chatList}>
          <ChatItem 
            name="Alex DJ" 
            msg="Hey! Tu as vu le dernier album de Techno ?" 
            time="2m ago" 
            unread={2} 
            initials="AL"
          />
          <ChatItem 
            name="Beatmaster" 
            msg="Le mix est prêt pour le live de ce soir 🔥" 
            time="1h ago" 
            initials="BE"
          />
          <ChatItem 
            name="Support Team" 
            msg="Votre rapport #12 a été traité." 
            time="5h ago" 
            initials="ST"
            isSystem
          />
          <ChatItem 
            name="Luna Park" 
            msg="On se capte plus tard !" 
            time="Yesterday" 
            initials="LP"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const ChatItem = ({ name, msg, time, unread, initials, isSystem }: any) => {
  const navigation = useNavigation<any>(); 

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.chatItem, unread && styles.chatItemUnread]}

      // Redirection vers la page lorsqu'il y aura le back
      onPress={() => navigation.navigate('ChatDetail', { userName: name })}
    >
      {/* Avatar avec bordure bleu si unread */}
      <View style={[
        styles.avatarCircle, 
        isSystem ? {backgroundColor: '#ff0055'} : {backgroundColor: '#2d2e4a'},
        unread && { borderColor: '#4361ee', borderWidth: 2 }
      ]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMsg} numberOfLines={1}>{msg}</Text>
          {unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#0f101a' 
},
  scrollContent: {
    paddingHorizontal: 20, 
    paddingBottom: 40 
},

  titleWrapper: { 
    marginVertical: 25
 },
  glitchTitle: { 
    color: '#fff', 
    fontSize: 34, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: -1 
},
  glitchTitleSub: { 
    color: '#4cc9f0', 
    fontSize: 34, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginTop: -10, 
    letterSpacing: -1 
},

  searchInput: { 
    backgroundColor: '#1e1f33', 
    borderRadius: 15, 
    padding: 16, 
    color: '#fff', 
    borderWidth: 1, 
    borderColor: '#2d2e4a',
    marginBottom: 25,
    fontSize: 15
  },

  chatList: { gap: 12 },

  chatItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#1e1f33', 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#2d2e4a' 
  },
  chatItemUnread: { 
    borderColor: '#4361ee55', 
    backgroundColor: '#1a1b2e',
    elevation: 5,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  avatarCircle: { 
    width: 58, 
    height: 58, 
    borderRadius: 29, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  chatInfo: { 
    flex: 1 
},
  chatHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
},
  userName: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 17 
},
  timeText: { 
    color: '#555', 
    fontSize: 12 
},
  
  chatFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
},
  lastMsg: { 
    color: '#999', 
    fontSize: 14, 
    flex: 1, 
    marginRight: 10 
},
  unreadBadge: { 
    backgroundColor: '#4361ee', 
    minWidth: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 4
  },
  unreadText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: '900' 
}
});

export default MessagesScreen;