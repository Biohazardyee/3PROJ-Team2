import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading?: boolean;
};

const reasons = [
  { key: "spam", label: "Spam" },
  { key: "hate", label: "Contenu haineux" },
  { key: "inappropriate", label: "Inapproprié" },
  { key: "other", label: "Autre" },
];

export default function ReportModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [selected, setSelected] = useState<string>("");

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSelected("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{ flex: 1, backgroundColor: "#000000aa" }}
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
          <Text style={{ color: "white", fontSize: 18, marginBottom: 10 }}>
            Signaler
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
            <Text style={{ color: "white" }}>
              {loading ? "Envoi..." : "Envoyer"}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
