import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReportModal from "./ReportModal";
import { useReport } from "../../hook/useReport";

type Props = {
  userId: string | null;
  targetId: string;
  type: "review" | "profile" | "comment";
};

export default function ReportButton({ userId, targetId, type }: Props) {
  const [open, setOpen] = useState(false);
  const { sendReport, loading } = useReport(userId);

  const handleSubmit = async (reason: string) => {
    await sendReport({
      reason,
      reason_type: type,
      ...(type === "review" && { review_id: targetId }),
      ...(type === "profile" && { profile_id: targetId }),
      ...(type === "comment" && { comment_id: targetId }),
    });

    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Ionicons name="flag-outline" size={18} color="#94a3b8" />
      </TouchableOpacity>

      <ReportModal
        visible={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
}
