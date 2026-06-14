import apiClient from "@/src/api/client";

export const reportService = {
  create: async (data: {
    reporter_id: string;
    reason: string;
    reason_type: "review" | "profile" | "comment";
    review_id?: string;
    profile_id?: string;
    comment_id?: string;
  }) => {
    return apiClient.post("/reports", data);
  },
};
