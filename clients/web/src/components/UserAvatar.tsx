import {useEffect, useState} from "react";
import apiClient from "../api/client.ts";

const UserAvatar = ({ userId, username, sizeClass }: { userId?: string, username?: string, sizeClass: string }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAvatar = async () => {
      if (!userId) return;
      try {
        const res = await apiClient.get(`/users/public/${userId}`);
        const userData = res.data.user || res.data;

        if (isMounted && userData.profile_picture) {
          const formattedUrl = userData.profile_picture.startsWith("data:")
              ? userData.profile_picture
              : `data:image/jpeg;base64,${userData.profile_picture}`;
          setAvatarUrl(formattedUrl);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'avatar", error);
      }
    };

    fetchAvatar();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (avatarUrl) {
    return (
        <img
            src={avatarUrl}
            alt={username || "Avatar"}
            className={`${sizeClass} rounded-full object-cover shrink-0 shadow-sm`}
        />
    );
  }

  return (
      <div className={`${sizeClass} rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 shrink-0`}>
        {(username || "A").slice(0, 2).toUpperCase()}
      </div>
  );
};

export default UserAvatar;
