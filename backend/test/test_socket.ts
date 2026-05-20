import { io } from "socket.io-client";


const TOKEN: string | undefined = "";

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN
    }
});

socket.on("connect", ():void => {

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



socket.on("connect_error", (err):void => {
    console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", ():void => {
    console.log("❌ Disconnected");
});