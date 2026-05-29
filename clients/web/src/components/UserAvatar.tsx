import { useState } from "react";

const UserAvatar: React.FC<{ user: any }> = ({ user }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (user?.username || "Us").substring(0, 2).toUpperCase();

  if (user?.image && !imgError) {
    return (
      <img
        src={user.image}
        alt={user.username || "Avatar"}
        className="w-12 h-12 rounded-full object-cover border border-gray-700 dark:border-gray-300 shadow-sm"
        onError={() => setImgError(true)} 
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold border border-gray-800/50 text-sm">
      {initials}
    </div>
  );
};

export default UserAvatar;
