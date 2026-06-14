import { useState } from "react";
import { reportService } from "../api/reportService";

export const useReport = (userId: string | null) => {
  const [loading, setLoading] = useState(false);

  const sendReport = async (payload: {
    reason: string;
    reason_type: "review" | "profile" | "comment";
    review_id?: string;
    profile_id?: string;
    comment_id?: string;
  }) => {
    if (!userId) return;

    setLoading(true);
    try {
      await reportService.create({
        reporter_id: userId,
        ...payload,
      });
    } finally {
      setLoading(false);
    }
  };

  return { sendReport, loading };
};
