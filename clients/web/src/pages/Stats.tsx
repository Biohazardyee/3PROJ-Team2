import React, { ReactNode, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlbumCard } from "../components/AlbumCard";

type StatCardData = {
  id: string;
  label: string;
  value: number;
  progress: number;
  colorClass: string;
  bgClass: string;
  icon: ReactNode;
};

// Interface correspondant à la structure retournée par votre backend (Prisma include media)
type UserMediaStatusResponse = {
  user_id: string;
  media_id: string;
  status: string;
  created_at: string;
  media: {
    id: string;
    title: string;
    artist: string;
    image: string;
    rating: number;
    year: number;
    description: string;
  } | null;
};

const Stats: React.FC = () => {
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState<string>("completed");
  const [mediaStatuses, setMediaStatuses] = useState<UserMediaStatusResponse[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // À ADAPTER : Récupérez l'ID de l'utilisateur connecté (via un hook d'auth, un context, localStorage...)
  // Exemple fictif : const { user } = useAuth(); const userId = user?.id;
  const userId = "VOTRE_USER_ID_CONNECTE";

  // 1. Fetch des données depuis l'API Express
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ajustez le préfixe de l'URL (/api) selon la configuration de votre proxy ou routeur de l'application
        const response = await fetch(`/api/status/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Ajoutez votre token d'authentification si authGuard est activé :
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données statistiques.",
          );
        }

        const data = await response.json();
        // L'API renvoie { message: "...", mediasStatus: [...] }
        setMediaStatuses(data.mediasStatus || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    if (userId && userId !== "VOTRE_USER_ID_CONNECTE") {
      fetchUserStats();
    }
  }, [userId]);

  // 2. Calcul dynamique des compteurs par statut (gère la casse de la DB au cas où)
  const counts = {
    completed: 0,
    listening: 0,
    wishlist: 0,
    dropped: 0,
  };

  mediaStatuses.forEach((item) => {
    const statusKey = item.status?.toLowerCase() as keyof typeof counts;
    if (statusKey in counts) {
      counts[statusKey]++;
    }
  });

  const totalAlbums =
    counts.completed + counts.listening + counts.wishlist + counts.dropped;

  const getPercentage = (count: number) => {
    if (totalAlbums === 0) return 0;
    return Math.round((count / totalAlbums) * 100);
  };

  // 3. Remplissage des cartes statistiques avec les vraies valeurs calculées
  const STATS_CARDS: StatCardData[] = [
    {
      id: "completed",
      label: t("status_completed"),
      value: counts.completed,
      progress: getPercentage(counts.completed),
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-400",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "listening",
      label: t("status_listening"),
      value: counts.listening,
      progress: getPercentage(counts.listening),
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "wishlist",
      label: t("status_wishlist"),
      value: counts.wishlist,
      progress: getPercentage(counts.wishlist),
      colorClass: "text-amber-400",
      bgClass: "bg-amber-400",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    {
      id: "dropped",
      label: t("status_dropped"),
      value: counts.dropped,
      progress: getPercentage(counts.dropped),
      colorClass: "text-rose-500",
      bgClass: "bg-rose-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const FILTERS = [
    {
      id: "completed",
      label: t("status_completed"),
      count: counts.completed,
      icon: "✅",
    },
    {
      id: "listening",
      label: t("status_listening"),
      count: counts.listening,
      icon: "🎧",
    },
    {
      id: "wishlist",
      label: t("status_wishlist"),
      count: counts.wishlist,
      icon: "⭐",
    },
    {
      id: "dropped",
      label: t("status_dropped"),
      count: counts.dropped,
      icon: "❌",
    },
  ];

  // 4. Calcul du camembert SVG dynamique (Slices imbriquées à l'aide de strokeDashoffset cumulés)
  const pieOrder = ["completed", "wishlist", "listening", "dropped"];
  let accumulatedPercentage = 0;

  const pieSlices = pieOrder.map((id) => {
    const count = counts[id as keyof typeof counts];
    const percentage = getPercentage(count);
    const offset = accumulatedPercentage;
    accumulatedPercentage += percentage;

    let colorClass = "text-emerald-400";
    if (id === "wishlist") colorClass = "text-amber-400";
    if (id === "listening") colorClass = "text-blue-500";
    if (id === "dropped") colorClass = "text-rose-500";

    return { id, percentage, offset: -offset, colorClass };
  });

  // 5. Filtrage et extraction des albums pour l'affichage de la grille
  const displayedAlbums = mediaStatuses
    .filter(
      (item) =>
        item.status?.toLowerCase() === activeFilter.toLowerCase() && item.media,
    )
    .map((item) => {
      const album = item.media!;
      return {
        id: album.id,
        title: album.title,
        artist: album.artist,
        image: album.image,
        rating: album.rating,
        year: album.year,
      };
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white dark:text-gray-900">
        <p className="text-xl animate-pulse">
          Chargement de vos statistiques...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-rose-500">
        <p className="text-xl">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[2048px] mx-auto w-full space-y-6 min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">
          {t("stats_title")}
        </h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">
          {t("stats_subtitle")}
        </p>
      </div>

      {/* Cartes des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATS_CARDS.map((stat) => (
          <div
            key={stat.id}
            className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl p-5 shadow-sm transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={stat.colorClass}>{stat.icon}</div>
              <div className="text-3xl font-bold text-white dark:text-gray-900">
                {stat.value}
              </div>
            </div>
            <div className="text-sm text-slate-400 dark:text-gray-500 mb-3">
              {stat.label}
            </div>
            <div className="w-full bg-slate-800 dark:bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`${stat.bgClass} h-full rounded-full`}
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl p-6 shadow-sm transition-colors">
        <h2
          className="text-lg font-bold flex items-center gap-2 mb-8 text-white dark:text-gray-900"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {t("stats_detail_title")}
        </h2>

        <div className="flex flex-col items-center justify-center">
          {/* Camembert */}
          <div className="relative w-64 h-64">
            <svg
              viewBox="0 0 36 36"
              className="w-full h-full transform -rotate-90"
            >
              {/* Cercle de fond gris */}
              <path
                className="text-slate-800 dark:text-gray-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />

              {/* Portions dynamiques du camembert */}
              {totalAlbums > 0 &&
                pieSlices.map((slice) => (
                  <path
                    key={`slice-${slice.id}`}
                    className={slice.colorClass}
                    strokeDasharray={`${slice.percentage}, 100`}
                    strokeDashoffset={slice.offset}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    transition-all="true"
                    duration-300="true"
                  />
                ))}
            </svg>

            {/* Icône de musique au centre du camembert */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800 dark:bg-gray-100 p-4 rounded-full shadow-lg border border-slate-700 dark:border-gray-200 text-blue-500 dark:text-blue-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-medium">
            {STATS_CARDS.map((stat) => (
              <div
                key={`legend-${stat.id}`}
                className={`flex items-center gap-2 ${stat.colorClass}`}
              >
                <div className={`w-3 h-3 rounded-sm ${stat.bgClass}`}></div>{" "}
                {stat.label} ({stat.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row flex-wrap bg-slate-900 dark:bg-white rounded-xl p-1 border border-slate-800 dark:border-gray-200 shadow-sm transition-colors mb-6">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-semibold text-sm transition-all ${
              activeFilter === filter.id
                ? "bg-slate-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
                : "text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800/50 dark:hover:bg-gray-50"
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            <span className="opacity-75">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* AlbumCard dynamique */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedAlbums.map((album) => (
          <AlbumCard
            key={album.id}
            id={album.id}
            title={album.title}
            artist={album.artist}
            cover={album.image}
            rating={album.rating}
            year={album.year}
          />
        ))}
      </div>

      {/* Message affiché si une catégorie est vide */}
      {displayedAlbums.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {t("no_album_category")}
        </div>
      )}
    </div>
  );
};

export default Stats;
