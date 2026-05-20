import apiClient from "../api/client";

export const updateProfile = async (data: {
  username?: string;
  favorite_band?: string;
  biography?: string;
  profile_picture?: string;
}) => {
  const res = await apiClient.patch("/users/profile", data);
  return res.data;
};
