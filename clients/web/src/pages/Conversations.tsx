import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Search, MoreVertical, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

interface BackendUser {
  id: string;
  username: string;
  profile_picture?: string;
}

interface BackendMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface BackendConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1?: BackendUser;
  user2?: BackendUser;
  messages?: BackendMessage[];
  _count?: { messages: number };
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
}

const BACKEND_URL = "https://doe-rational-bobcat.ngrok-free.app";

const Conversations: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<BackendConversation[]>([]);
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);

  // Rétablissement du socket local pour assurer la connexion
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  // Sécurisation stricte de l'interlocuteur
  const getOtherUser = useCallback(
    (conv: BackendConversation) => {
      if (conv.user1 && String(conv.user1.id) === String(userId))
        return conv.user2;
      if (conv.user2 && String(conv.user2.id) === String(userId))
        return conv.user1;
      return String(conv.user1_id) === String(userId) ? conv.user2 : conv.user1;
    },
    [userId],
  );

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await apiClient.get(`/conversations/user/${userId}`);
      const data: BackendConversation[] =
        res.data.conversations || res.data || [];

      const processed = data.map((conv) => {
        const lastMsg =
          conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

        // Utilisation du compteur de la BDD (résout le bug du rafraîchissement)
        const unreadCount = conv._count?.messages || 0;

        return {
          ...conv,
          unreadCount,
          lastMessage: lastMsg
            ? lastMsg.content
            : t("no_messages_yet", "Aucun message"),
          time:
            lastMsg && lastMsg.created_at
              ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
        };
      });

      setConversations(processed);
    } catch (e) {
      console.error("Erreur chargement des conversations:", e);
    } finally {
      setLoadingConv(false);
    }
  }, [userId, t]);

  // Initialisation User
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserId(decoded.id || decoded.userId);
      } catch (e) {
        console.error("Token invalide:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setLoadingConv(true);
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  // INITIALISATION DU SOCKET - 100% Garanti
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    const newSocket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Écoute des événements temps réel
  useEffect(() => {
    if (!socket || !userId) return;

    socket.on("receive_message", (message: BackendMessage) => {
      if (
        String(message.conversation_id) === String(selectedConvIdRef.current)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(message.id)))
            return prev;
          return [...prev, message].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
        });

        // Marque comme lu en temps réel si on est dans la discussion
        if (String(message.sender_id) !== String(userId)) {
          socket.emit("mark_as_read", {
            conversation_id: message.conversation_id,
          });
        }
      }
    });

    socket.on("update_conversation_list", (message: BackendMessage) => {
      setConversations((prevConvs) => {
        const index = prevConvs.findIndex(
          (conv) => String(conv.id) === String(message.conversation_id),
        );

        if (index === -1) {
          setTimeout(() => fetchConversations(), 50);
          return prevConvs;
        }

        const updated = [...prevConvs];
        const isCurrentActive =
          String(message.conversation_id) === String(selectedConvIdRef.current);
        const isFromMe = String(message.sender_id) === String(userId);

        const currentUnread = updated[index].unreadCount || 0;
        const newUnread = !isCurrentActive && !isFromMe ? currentUnread + 1 : 0;

        updated[index] = {
          ...updated[index],
          lastMessage: message.content,
          time: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unreadCount: newUnread,
        };

        const [movedConv] = updated.splice(index, 1);
        return [movedConv, ...updated];
      });
    });

    socket.on(
      "conversation_marked_read",
      (data: { conversation_id: string }) => {
        setConversations((prev) =>
          prev.map((conv) =>
            String(conv.id) === String(data.conversation_id)
              ? { ...conv, unreadCount: 0 }
              : conv,
          ),
        );
      },
    );

    return () => {
      socket.off("receive_message");
      socket.off("update_conversation_list");
      socket.off("conversation_marked_read");
    };
  }, [socket, userId, fetchConversations]);

  useEffect(() => {
    if (!socket || !selectedConvId) return;

    setConversations((prev) =>
      prev.map((conv) =>
        String(conv.id) === String(selectedConvId)
          ? { ...conv, unreadCount: 0 }
          : conv,
      ),
    );

    socket.emit("mark_as_read", { conversation_id: selectedConvId });
    socket.emit("join_conversation", { conversation_id: selectedConvId });

    return () => {
      socket.emit("leave_conversation", { conversation_id: selectedConvId });
    };
  }, [socket, selectedConvId]);

  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(
          `/messages/conversation/${selectedConvId}`,
        );
        const rawMessages = res.data.messages || [];
        const sortedMessages = rawMessages.sort(
          (a: BackendMessage, b: BackendMessage) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        setMessages(sortedMessages);
      } catch (e) {
        console.error("Erreur de récupération des messages:", e);
      }
    };

    fetchMessages();
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => String(c.id) === String(selectedConvId));
  }, [conversations, selectedConvId]);

  const activeChatUser = useMemo(() => {
    return selectedConversation ? getOtherUser(selectedConversation) : null;
  }, [selectedConversation, getOtherUser]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const otherUser = getOtherUser(conv);
      const lowerQuery = searchQuery.toLowerCase();
      return (
        otherUser?.username.toLowerCase().includes(lowerQuery) ||
        conv.lastMessage?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [conversations, searchQuery, getOtherUser]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConvId || !socket) return;

    socket.emit("send_message", {
      conversation_id: selectedConvId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  const getAvatarText = (username?: string) =>
    username ? username.substring(0, 2).toUpperCase() : "??";

  return (
    <div className="flex h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-slate-900 overflow-hidden font-sans transition-colors duration-300">
      <aside
        className={`w-full md:w-80 lg:w-96 border-r border-slate-800 dark:border-slate-200 flex flex-col ${selectedConvId ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-6">
          <h1
            className="text-3xl font-bold text-white dark:text-gray-900 mb-6"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {t("messages_title")}
          </h1>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder={t("search_conv_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConv ? (
            <div className="p-6 text-center text-sm text-slate-500">
              {t("loading", "Chargement...")}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const usernameDisplay = otherUser
                ? `@${otherUser.username}`
                : t("unknown_user", "Utilisateur anonyme");
              const hasUnread = (conv.unreadCount ?? 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-[#1a1d26] dark:hover:bg-slate-100 ${String(selectedConvId) === String(conv.id) ? "bg-[#1a1d26] dark:bg-slate-100 border-l-4 border-blue-500" : "border-l-4 border-transparent"}`}
                >
                  <div className="relative flex-shrink-0">
                    {otherUser?.profile_picture ? (
                      <img
                        src={otherUser.profile_picture}
                        alt={usernameDisplay}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700 dark:border-indigo-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#2a2e3d] dark:bg-indigo-100 flex items-center justify-center text-blue-400 dark:text-blue-600 font-bold border border-slate-700 dark:border-indigo-200">
                        {getAvatarText(otherUser?.username)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-sm truncate ${hasUnread ? "font-black text-white dark:text-blue-600" : "font-bold text-slate-300 dark:text-gray-900"}`}
                      >
                        {usernameDisplay}
                      </span>
                      <span
                        className={`text-[10px] ${hasUnread ? "font-bold text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                      >
                        {conv.time}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <p
                        className={`text-xs truncate flex-1 ${hasUnread ? "font-semibold text-slate-200 dark:text-slate-900" : "text-slate-400 dark:text-slate-600"}`}
                      >
                        {conv.lastMessage}
                      </p>
                      {hasUnread && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center shadow-sm animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
          {!loadingConv && filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("no_conv_found")}
            </div>
          )}
        </div>
      </aside>

      <main
        className={`flex-1 flex flex-col bg-[#0f1117] dark:bg-white ${!selectedConvId ? "hidden md:flex" : "flex"}`}
      >
        {selectedConversation ? (
          <>
            <header className="p-4 border-b border-slate-800 dark:border-slate-200 flex justify-between items-center bg-[#0f1117]/50 dark:bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-white dark:hover:text-gray-900"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div
                  onClick={() =>
                    activeChatUser?.id &&
                    navigate(`/profil/${activeChatUser.id}`)
                  }
                  className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    {activeChatUser?.profile_picture ? (
                      <img
                        src={activeChatUser.profile_picture}
                        alt={activeChatUser.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 dark:border-indigo-200 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#2a2e3d] dark:bg-indigo-100 flex items-center justify-center text-blue-400 dark:text-blue-600 text-sm font-bold border border-slate-700 dark:border-indigo-200 transition-transform group-hover:scale-105">
                        {getAvatarText(activeChatUser?.username)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white dark:text-gray-900 group-hover:underline">
                      {activeChatUser
                        ? `@${activeChatUser.username}`
                        : t("unknown_user", "Utilisateur anonyme")}
                    </h2>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white dark:hover:text-gray-900 transition-colors">
                <MoreVertical size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {messages.map((msg) => {
                const isMe = String(msg.sender_id) === String(userId);
                const messageTime = new Date(msg.created_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" },
                );

                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] flex flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none shadow-md" : "bg-[#1a1d26] dark:bg-slate-100 text-slate-200 dark:text-gray-800 border border-slate-800 dark:border-slate-200 rounded-tl-none"}`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1">
                      {messageTime}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 bg-[#0f1117] dark:bg-white">
              <div className="flex items-center gap-2 bg-[#1a1d26] dark:bg-slate-100 border border-slate-800 dark:border-slate-200 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition-all">
                <input
                  type="text"
                  placeholder={t("type_message_placeholder")}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 dark:text-gray-900"
                />
                <button
                  onClick={handleSendMessage}
                  className="text-blue-500 hover:text-blue-400 p-1 transition-transform hover:scale-110"
                >
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-[#1a1d26] dark:bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-800 dark:border-slate-200 shadow-xl">
              <Search size={32} className="text-slate-600" />
            </div>
            <h2
              className="text-2xl font-bold text-white dark:text-gray-900 mb-2"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {t("select_conv_title")}
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default Conversations;
