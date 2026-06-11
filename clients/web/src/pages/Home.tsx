import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Search, SlidersHorizontal, Loader2, ChevronDown} from "lucide-react";
import {useTranslation} from "react-i18next";
import {AlbumCard} from "../components/AlbumCard";
import apiClient from "../api/client";

const Home: React.FC = () => {
    const {t} = useTranslation();

    const [searchQuery, setSearchQuery] = useState("");
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSort, setSelectedSort] = useState("popular");
    const [searchMode, setSearchMode] = useState<"artist" | "album">("artist");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Variable réutilisable pour le placeholder
    const PLACEHOLDER_IMAGE = "/melodia_placeholder.png";

    const handleSearch = async (pageNumber: number = 1) => {
        const query = searchQuery.trim();
        if (!query) return;
        setLoading(true);

        try {
            let url: string =
                searchMode === "artist"
                    ? `/api/artists/info/top-albums?artist=${encodeURIComponent(query)}&page=${pageNumber}`
                    : `/api/search?query=${encodeURIComponent(query)}&page=${pageNumber}`;

            const response = await apiClient.get(url);
            let rawData = [];
            if (searchMode === "artist") {
                rawData = response.data?.topAlbums?.topalbums?.album || [];
            } else {
                rawData =
                    response.data?.searchResults?.results?.albummatches?.album || [];
            }

            const fetchedAlbums = rawData.map((a: any) => {
                const artistName =
                    typeof a.artist === "string"
                        ? a.artist
                        : a.artist?.name || t("unknown_artist");
                const apiId = a.mbid || `album:${artistName}:${a.name}`;
                return {
                    id: apiId,
                    title: a.name,
                    artist: artistName,
                    // 💡 Fallback si l'image de l'API est absente ou vide
                    cover:
                        a.image?.find((img: any) => img.size === "extralarge")?.["#text"] ||
                        a.image?.[2]?.["#text"] ||
                        PLACEHOLDER_IMAGE,
                    rating: 0,
                    year: a.year || null,
                    mbid: a.mbid || null,
                };
            });

            let finalData = fetchedAlbums;
            try {
                const syncResponse = await apiClient.post("/medias/sync-search", {
                    albums: fetchedAlbums.map((album: any) => ({
                        api_id: album.id,
                        name: album.title,
                        artist: album.artist,
                        cover: album.cover,
                        mbid: album.mbid,
                    })),
                });

                const syncedAlbums =
                    syncResponse.data.medias || syncResponse.data || [];

                if (Array.isArray(syncedAlbums) && syncedAlbums.length > 0) {
                    finalData = syncedAlbums.map((s: any) => ({
                        id: s.id,
                        apiId: s.api_id,
                        title: s.name,
                        artist: s.artist,
                        // 💡 Fallback au cas où la BDD contient une chaîne vide ou nulle
                        cover: s.cover || PLACEHOLDER_IMAGE,
                        rating: s.rating !== undefined ? Number(s.rating) : 0,
                        year: s.year || null,
                        mbid: s.mbid || null,
                    }));
                }
            } catch (err) {
                console.warn("La synchronisation des résultats a échoué", err);
            }

            if (pageNumber === 1) {
                setAlbums(applySort(finalData, selectedSort));
            } else {
                setAlbums((prev) => {
                    const existingIds = new Set(prev.map((a) => a.id));
                    const uniqueNewData = finalData.filter(
                        (a: { id: any }) => !existingIds.has(a.id),
                    );
                    return applySort([...prev, ...uniqueNewData], selectedSort);
                });
            }

            setHasMore(finalData.length >= 50);
            setPage(pageNumber);
        } catch (error) {
            console.error("❌ Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(false);
    }, [searchQuery, searchMode]);

    const applySort = (data: any[], sortType: string) => {
        let sorted = [...data];
        if (sortType === "rating") {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortType === "az") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
        return sorted;
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSort(value);
        setAlbums(applySort(albums, value));
    };

    return (
        <div
            className="p-8 max-w-7xl mx-auto w-full min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">
                    {t("explore_title")}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-lg">
                    {t("explore_subtitle")}
                </p>
            </div>

            <div
                className="bg-[#1C1C28] dark:bg-white p-6 rounded-2xl mb-6 shadow-lg border border-gray-800 dark:border-gray-200">
                <div className="flex flex-col lg:flex-row gap-6 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold mb-2 text-gray-300 dark:text-gray-600">
                            {t("search_label")}
                        </label>
                        <div
                            className="flex items-center bg-[#2A2A38] dark:bg-gray-100 rounded-lg px-4 py-2.5 border border-gray-700 dark:border-gray-200 focus-within:border-indigo-500 transition-colors">
                            <Search size={18} className="text-gray-400"/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
                                placeholder={t("search_album_placeholder")}
                                className="bg-transparent text-white dark:text-gray-900 outline-none w-full text-sm placeholder-gray-500 ml-3"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-1/4">
                        <label className="block text-sm font-semibold mb-2 text-gray-300 dark:text-gray-600">
                            {t("sort_label")}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedSort}
                                onChange={handleSortChange}
                                className="w-full bg-[#2A2A38] dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-700 dark:border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none text-sm cursor-pointer focus:border-indigo-500 transition-colors"
                            >
                                <option value="popular">{t("sort_popular")}</option>
                                <option value="az">{t("sort_az")}</option>
                                <option value="rating">{t("sort_rating")}</option>
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleSearch(1)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-6 py-2.5 rounded-lg transition-colors text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                    >
                        {loading && page === 1 ? (
                            <Loader2 size={16} className="animate-spin"/>
                        ) : (
                            <Search size={16}/>
                        )}
                        {loading && page === 1 ? t("searching_label") : t("search_label")}
                    </button>

                    <button
                        onClick={() =>
                            setSearchMode(searchMode === "artist" ? "album" : "artist")
                        }
                        className="flex items-center gap-2 bg-[#2A2A38] dark:bg-gray-100 border border-gray-700 dark:border-gray-200 px-5 py-2.5 rounded-lg hover:bg-[#343446] dark:hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-300 dark:text-gray-600"
                    >
                        <SlidersHorizontal size={16}/>
                        {t("search_mode")}:{" "}
                        {searchMode === "artist" ? t("mode_artist") : t("mode_album")}
                    </button>
                </div>
            </div>

            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                {albums.length > 0
                    ? t("results_count_plural", {count: albums.length})
                    : t("no_result_found")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albums.map((album, index) => {
                    // 💡 Sécurité supplémentaire lors de l'injection dans l'URL
                    const albumCover = album.cover || PLACEHOLDER_IMAGE;

                    const params = new URLSearchParams({
                        artist: album.artist,
                        album: album.title,
                        cover: albumCover,
                        mbid: album.mbid || "",
                    }).toString();

                    return (
                        <Link
                            to={`/album/${album.id}?${params}`}
                            key={`${album.id}-${index}`}
                            className="block transition-transform duration-200 hover:scale-[1.02]"
                        >
                            <AlbumCard
                                id={album.id}
                                title={album.title}
                                artist={album.artist}
                                cover={albumCover}
                                rating={album.rating}
                                year={album.year}
                            />
                        </Link>
                    );
                })}
            </div>

            {albums.length > 0 && hasMore && (
                <div className="flex justify-center mt-12 pb-10">
                    <button
                        onClick={() => handleSearch(page + 1)}
                        disabled={loading}
                        className="flex items-center gap-3 bg-[#2A2A38] hover:bg-[#343446] dark:bg-gray-100 dark:hover:bg-gray-200 border border-gray-700 dark:border-gray-200 px-10 py-3.5 rounded-xl transition-all text-sm font-bold text-gray-300 dark:text-gray-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin text-indigo-500"/>
                        ) : (
                            <span>{t("show_more")}</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;