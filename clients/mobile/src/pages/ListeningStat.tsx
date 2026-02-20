import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from "@/src/components/Header";
import { StatusBar } from 'expo-status-bar';
import AlbumCard from "@/src/components/AlbumCard";

// Données fictives pour les albums
const ALBUMS = [
    { id: "1",
        title: "D&P à vie",
        artist: "Jul",
        rating: '4.8',
        year : '2025',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj",
    },
    { id: "2",
        title: "Destin",
        artist: "Ninho",
        rating: '4.5',
        year : '2019',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj",
    },
    { id: "3",
        title: "BDLM",
        artist: "Tiakola",
        rating: '4.6',
        year : '2024',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj",
    },
    { id: "4",
        title: "Maestro",
        artist: "Lartiste",
        rating: '5',
        year : '2016',
        genre : 'Rap',
        cover: "https://lh3.googleusercontent.com/Aku7dOqopdBsl_Qaqc2ClW4ZU4tlIaaiMaV1wqiYw4mUVj2FYMX3kRfBYA3OyHqyOV6IlmxDtX5U9pXN=w544-h544-l90-rj"
    },
];


const ListeningStat: React.FC = () => {

    return (
        <View style={styles.container}>
            {/* Ne fonctionne pas probablement à cause de Expo go */}
            <StatusBar style='light' backgroundColor='#1C1C28' translucent={false}/>
            <Header />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header Text */}
                <View style={styles.headerTextContainer}>
                    <View style={styles.headerTitle}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={40}
                            color="#00ffa3"
                        />
                        <Text style={styles.title}>Écoutés</Text>
                    </View>
                    <Text style={styles.subtitle}>Ce que vous avez écoutés</Text>
                </View>

                <View style={styles.grid}>
                    {ALBUMS.map((item) => (
                        <AlbumCard
                            key={item.id}
                            title={item.title}
                            artist={item.artist}
                            rating={item.rating}
                            year={item.year}
                            genre={item.genre}
                            cover={item.cover}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#1C1C28'
    },
    scroll: {
        padding: 20,
        paddingTop: 10
    },
    headerTextContainer: {
        marginBottom: 25
    },
    title: {
        color: '#00ffa3',
        fontSize: 32,
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 5
    },

    filterCard: {
        backgroundColor: '#252532',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2a2a35',
    },
    label: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A38',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 45,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchInput: {
        color: 'white',
        flex: 1
    },

    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2A2A38',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 45,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 10,
    },

    dropdownText: {
        color: 'white'
    },

    // Nouveaux styles pour le volet
    dropdownMenu: {
        backgroundColor: '#2A2A38',
        borderRadius: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden'
    },

    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },

    menuItemText: {
        color: '#ccc',
        fontSize: 14
    },

    filterButton: {
        flexDirection: 'row',
        backgroundColor: '#2A2A38',
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#333',
    },

    filterButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },

    resultsText: {
        color: '#888',
        marginVertical: 20
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    albumCard: {
        width: '48%',
        backgroundColor: '#1c1c27',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a35',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        position: 'relative'
    },
    albumImage: {
        height: '100%',
        width: '100%'
    },
    genreBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF006E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    buttonContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },


    addButton: {
        backgroundColor: '#4f46e5',
        flex: 1,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },


    heartButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    genreText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
    albumInfo: {
        padding: 12
    },
    albumTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15
    },
    albumArtist: { color: '#888',
        fontSize: 12,
        marginTop: 2 },
    albumFooter: { flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    ratingBox: { flexDirection: 'row',
        alignItems: 'center'
    },
    ratingText: { color: 'white',
        marginLeft: 5,
        fontSize: 12,
        fontWeight: 'bold'
    },
    yearText: {
        color: '#555',
        fontSize: 12 },
});

export default ListeningStat;