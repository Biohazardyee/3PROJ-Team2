import {createContext, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({children}: { children: React.ReactNode }) => {
    const socket_url = import.meta.env.VITE_API_URL
    const [socket, setSocket] = useState<Socket | null>(null);

    const token: string | null = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setSocket(null);
            return;
        }

        const newSocket = io(socket_url, {
            auth: {token},
            transports: ["websocket"],
        });

        setSocket(newSocket);

        return (): void => {
            newSocket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
