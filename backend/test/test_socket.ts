import { io } from "socket.io-client";


// PROD ONLY (ne pas push avec un token)
const TOKEN: string | undefined = "";

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN
    }
});

socket.on("connect", ():void => {
    console.log("✅ Connected:", socket.id);

    socket.emit("join_conversation", {
        conversationId: "A REMPLACER"
    });


    setTimeout(() => {
        socket.emit("send_message", {
            conversation_id: "A REMPLACER",
            content: "test2"
        });
    }, 2000);
});


socket.on("receive_message", (message):void => {
    console.log("📩 New message:", message);
});

socket.on("connect_error", (err):void => {
    console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", ():void => {
    console.log("❌ Disconnected");
});