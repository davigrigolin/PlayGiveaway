import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // 1. Pega o token enviado no cabeçalho da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token JWT não informado." });
  }

  // O token normalmente chega no formato: "Bearer eyJhbGciOiJIUzI1..."
  // Vamos separar pelo espaço e pegar só a segunda parte (o token em si)
  const [, token] = authHeader.split(" ");

  try {
    // 2. Verifica se o token é válido usando a nossa senha secreta
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret);

    // 3. Se deu tudo certo, extrai o ID do usuário (que salvamos no 'sub' do token lá no login)
    const { sub } = decoded as { sub: string };

    // Injeta o ID do usuário na requisição para que os controllers saibam QUEM está fazendo a ação
    req.user = {
      id: sub,
    };

    // 4. Libera a passagem para a rota destino
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token JWT inválido ou expirado." });
  }
}
