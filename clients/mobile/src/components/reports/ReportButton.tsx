import React, {useState} from "react";
import {TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import ReportModal from "./ReportModal";
import {useReport} from "../../hook/useReport";

type Props = {
    userId: string | null;
    targetId: string;
    type: "review" | "profile" | "comment";
};

export default function ReportButton({userId, targetId, type}: Props) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const {sendReport, loading} = useReport(userId);

    const handleSubmit = async (reason: string): Promise<void> => {
        await sendReport({
            reason,
            reason_type: type,
            ...(type === "review" && {review_id: targetId}),
            ...(type === "profile" && {profile_id: targetId}),
            ...(type === "comment" && {comment_id: targetId}),
        });

        setOpen(false);
    };

    return (
        <>
            <TouchableOpacity onPress={() => { if (!userId) { router.push("/restriction"); return; } setOpen(true); }}>
                <Ionicons name="flag-outline" size={18} color="#94a3b8"/>
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
