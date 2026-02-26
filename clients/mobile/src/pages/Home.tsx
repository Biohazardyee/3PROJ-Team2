import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
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

// Données pour les filtres
const GENRES = [
    { label: 'All Genres', value: 'all' },
    { label: 'Techno', value: 'techno' },
    { label: 'House', value: 'house' },
    { label: 'Electro', value: 'electro' },
    { label: 'EDM', value: 'edm' },
];

const SORT_OPTIONS = [
    { label: 'Most Popular', value: 'popular' },
    { label: 'Most Recent', value: 'recent' },
    { label: 'Highest Rated', value: 'rated' },
    { label: 'Title A-Z', value: 'az' },
];

const Home: React.FC = () => {
    // États pour les menus déroulants
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const [selectedGenre, setSelectedGenre] = useState('Tous les Genres');
    const [selectedSort, setSelectedSort] = useState('Les plus populaires');

    return (

        <View style={styles.container}>
            {/* Ne fonctionne pas probablement à cause de Expo go */}
            <StatusBar style='light' backgroundColor='#1C1C28' translucent={false}/>
            <Header />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header Text */}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Explorer</Text>
                    <Text style={styles.subtitle}>Découvrez votre prochain album préféré !</Text>
                </View>

                {/* Rechercher et Filtrer */}
                <View style={styles.filterCard}>
                    <Text style={styles.label}>Rechercher</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Rechercher des albums etc..."
                            placeholderTextColor="#888"
                            style={styles.searchInput}
                        />
                    </View>

                    {/* VOLET GENRE */}
                    <Text style={styles.label}>Genre</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => {
                            setIsGenreOpen(!isGenreOpen);
                            setIsSortOpen(false);
                        }}
                    >
                        <Text style={styles.dropdownText}>{selectedGenre}</Text>
                        <Ionicons name={isGenreOpen ? "chevron-up" : "chevron-down"} size={18} color="#888" />
                    </TouchableOpacity>

                    {isGenreOpen && (
                        <View style={styles.dropdownMenu}>
                            {GENRES.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setSelectedGenre(item.label);
                                        setIsGenreOpen(false);
                                    }}
                                >
                                    <Text style={styles.menuItemText}>{item.label}</Text>
                                    {selectedGenre === item.label && <Ionicons name="checkmark" size={18} color="#4f46e5" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* VOLET TRIER */}
                    <Text style={styles.label}>Trier par</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => {
                            setIsSortOpen(!isSortOpen);
                            setIsGenreOpen(false);
                        }}
                    >
                        <Text style={styles.dropdownText}>{selectedSort}</Text>
                        <Ionicons name={isSortOpen ? "chevron-up" : "chevron-down"} size={18} color="#888" />
                    </TouchableOpacity>

                    {isSortOpen && (
                        <View style={styles.dropdownMenu}>
                            {SORT_OPTIONS.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setSelectedSort(item.label);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    <Text style={styles.menuItemText}>{item.label}</Text>
                                    {selectedSort === item.label && <Ionicons name="checkmark" size={18} color="#4f46e5" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.filterButtonText}>Filtrer</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.resultsText}>{ALBUMS.length} albums trouvés</Text>

                <View style={styles.grid}>
                    {ALBUMS.map((item) => (
                        <AlbumCard
                            key={item.id}
                            id={item.id}
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
        color: 'white',
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

export default Home;