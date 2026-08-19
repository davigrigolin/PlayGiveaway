import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(router);

// Rota de teste
app.get("/ping", (req, res) => {
  res.json({ message: "Pong! O backend do SaaS de Sorteios está online." });
});

// Tratamento Global de Erros (ATENÇÃO: Ele obrigatoriamente deve ficar AQUI, depois das rotas)
app.use(errorHandler); // <-- 2. Plugamos o tratador de erros

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
