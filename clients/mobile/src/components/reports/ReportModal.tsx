import React, {useState} from "react";
import {Modal, View, Text, TouchableOpacity, Pressable} from "react-native";
import {useTranslation} from "react-i18next";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    loading?: boolean;
};

export default function ReportModal({
                                        visible,
                                        onClose,
                                        onSubmit,
                                        loading,
                                    }: Props) {
    const {t} = useTranslation();
    const [selected, setSelected] = useState<string>("");

    const reasons = [
        {key: "spam", label: t("report_spam")},
        {key: "hate", label: t("report_hate")},
        {key: "inappropriate", label: t("report_inappropriate")},
        {key: "other", label: t("report_other")},
    ];

    const handleSubmit = (): void => {
        if (!selected) return;
        onSubmit(selected);
        setSelected("");
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable
                style={{flex: 1, backgroundColor: "#000000aa"}}
                onPress={onClose}
            >
                <View
                    style={{
                        marginTop: "auto",
                        backgroundColor: "#1a1d29",
                        padding: 20,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                >
                    <Text style={{color: "white", fontSize: 18, marginBottom: 10}}>
                        {t("report_title")}
                    </Text>

                    {reasons.map((r) => (
                        <TouchableOpacity key={r.key} onPress={() => setSelected(r.key)}>
                            <Text
                                style={{
                                    color: selected === r.key ? "#ec4899" : "#94a3b8",
                                    paddingVertical: 8,
                                }}
                            >
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{
                            marginTop: 15,
                            backgroundColor: "#ec4899",
                            padding: 12,
                            borderRadius: 10,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{color: "white"}}>
                            {loading ? t("report_sending") : t("report_send")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
}
