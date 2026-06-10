import React from "react";
import {TouchableOpacity, Alert} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import apiClient from "../../api/client";

type Props = {
    targetUserId: string;
    reporterUserId: string;
};

export default function ReportUserButton({
                                             targetUserId,
                                             reporterUserId,
                                         }: Props) {
    const handleReport = (): void => {
        Alert.alert(
            "Signaler ce profil",
            "Voulez-vous signaler cet utilisateur ?",
            [
                {text: "Annuler", style: "cancel"},
                {
                    text: "Signaler",
                    style: "destructive",
                    onPress: async (): Promise<void> => {
                        try {
                            await apiClient.post("/reports/profile", {
                                reporter_id: reporterUserId,
                                profile_id: targetUserId,
                                reason: "inappropriate_profile",
                                reason_type: "profile",
                            });

                            Alert.alert("Merci", "Le profil a été signalé.");
                        } catch (err) {
                            console.error("Report user error:", err);
                            Alert.alert("Erreur", "Impossible de signaler ce profil.");
                        }
                    },
                },
            ],
        );
    };

    return (
        <TouchableOpacity onPress={handleReport}>
            <Ionicons name="flag-outline" size={18} color="#ef4444"/>
        </TouchableOpacity>
    );
}
