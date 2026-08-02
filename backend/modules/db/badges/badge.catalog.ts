export type BadgeCriteria =
    | "reviews_count"
    | "followers_count"
    | "following_count"
    | "comments_count"
    | "playlists_count"
    | "likes_given_count";

export interface BadgeItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: BadgeCriteria;
    threshold: number;
    reward_points: number;
}

/**
 * Catalogue des badges de gamification. Purement déclaratif : badgeService
 * compare les compteurs live de l'utilisateur à `threshold` pour décider
 * s'il débloque un badge (aucun état de progression stocké côté badge).
 */
export const BADGES: BadgeItem[] = [
    {id: "badge_first_review", name: "Premier avis", description: "Publie ta première critique", icon: "PenLine", criteria: "reviews_count", threshold: 1, reward_points: 20},
    {id: "badge_critic", name: "Critique confirmé", description: "Publie 10 critiques", icon: "PenLine", criteria: "reviews_count", threshold: 10, reward_points: 40},
    {id: "badge_veteran_critic", name: "Critique vétéran", description: "Publie 50 critiques", icon: "PenLine", criteria: "reviews_count", threshold: 50, reward_points: 100},

    {id: "badge_popular", name: "Populaire", description: "Atteins 10 abonnés", icon: "Users", criteria: "followers_count", threshold: 10, reward_points: 30},
    {id: "badge_influencer", name: "Influenceur", description: "Atteins 50 abonnés", icon: "Users", criteria: "followers_count", threshold: 50, reward_points: 80},
    {id: "badge_icon", name: "Icône", description: "Atteins 100 abonnés", icon: "Users", criteria: "followers_count", threshold: 100, reward_points: 150},

    {id: "badge_social", name: "Sociable", description: "Suis 10 utilisateurs", icon: "UserPlus", criteria: "following_count", threshold: 10, reward_points: 20},
    {id: "badge_talent_scout", name: "Découvreur de talents", description: "Suis 50 utilisateurs", icon: "UserPlus", criteria: "following_count", threshold: 50, reward_points: 50},

    {id: "badge_chatty", name: "Bavard", description: "Publie 25 commentaires", icon: "MessageSquare", criteria: "comments_count", threshold: 25, reward_points: 40},
    {id: "badge_debater", name: "Débatteur", description: "Publie 100 commentaires", icon: "MessageSquare", criteria: "comments_count", threshold: 100, reward_points: 90},

    {id: "badge_curator", name: "Curateur", description: "Crée 3 playlists", icon: "ListMusic", criteria: "playlists_count", threshold: 3, reward_points: 25},
    {id: "badge_music_lover", name: "Mélomane", description: "Crée 10 playlists", icon: "ListMusic", criteria: "playlists_count", threshold: 10, reward_points: 60},

    {id: "badge_supporter", name: "Supporter", description: "Aime 25 critiques", icon: "Heart", criteria: "likes_given_count", threshold: 25, reward_points: 25},
    {id: "badge_super_fan", name: "Super Fan", description: "Aime 100 critiques", icon: "Heart", criteria: "likes_given_count", threshold: 100, reward_points: 60},
];

export function getBadgeById(id: string): BadgeItem | undefined {
    return BADGES.find((b): boolean => b.id === id);
}
