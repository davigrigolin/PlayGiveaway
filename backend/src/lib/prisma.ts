import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config"; // Garante que as variáveis do arquivo .env sejam carregadas

// Configura o pool de conexão nativo do PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Inicia o Prisma Client utilizando o adaptador
export const prisma = new PrismaClient({ adapter });
