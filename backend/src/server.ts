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

app.get("/ping", (req, res) => {
  res.json({ message: "Pong! O backend do SaaS de Sorteios está online." });
});

// Deve ficar após as rotas para receber os erros lançados por elas.
app.use(errorHandler);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
