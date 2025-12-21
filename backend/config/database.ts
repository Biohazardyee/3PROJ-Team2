import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("✅ Connecté à PostgreSQL !");
    } catch (err) {
        console.error("❌ Erreur de connexion PostgreSQL :", err);
        process.exit(1); // Arrête l'app si la connexion échoue
    }
}
