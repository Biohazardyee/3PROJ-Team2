import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("✅ Connecté à PostgreSQL !");
    } catch (err) {
        console.error("❌ Erreur de connexion PostgreSQL :", err);
        process.exit(1); // Arrête l'app si la connexion échoue
    }
}

export { prisma }