import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Giveaway {
  title: string;
  description: string | null;
  status: string;
  winner?: string | null;
  winners?: string[];
}

export default function GiveawayPage() {
  const { slug } = useParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Novos estados para controlar o visual durante o envio
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [isLoadingGiveaway, setIsLoadingGiveaway] = useState(true);
  const [giveawayError, setGiveawayError] = useState("");

  useEffect(() => {
    const loadGiveaway = async () => {
      setIsLoadingGiveaway(true);
      setGiveawayError("");

      try {
        const response = await fetch(`http://localhost:3333/raffles/${slug}`);

        if (response.status === 404) {
          setGiveawayError(
            "Este sorteio não existe ou não está mais disponível.",
          );
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar o sorteio.");
        }

        setGiveaway(await response.json());
      } catch (err) {
        console.error(err);
        setGiveawayError(
          "Não foi possível carregar o sorteio. Tente novamente mais tarde.",
        );
      } finally {
        setIsLoadingGiveaway(false);
      }
    };

    loadGiveaway();
  }, [slug]);

  if (isLoadingGiveaway) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/80 p-8 text-center shadow-[0_30px_80px_rgba(91,33,182,0.28)] backdrop-blur-xl">
          <div className="mb-4 text-5xl">🎯</div>
          <p className="text-slate-300">Carregando sorteio...</p>
        </div>
      </main>
    );
  }

  if (giveawayError || !giveaway) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/80 p-8 text-center shadow-[0_30px_80px_rgba(91,33,182,0.28)] backdrop-blur-xl">
          <div className="mb-4 text-5xl">🔎</div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Sorteio não encontrado
          </h1>
          <p className="text-slate-300">
            {giveawayError || "Este sorteio não está disponível."}
          </p>
        </div>
      </main>
    );
  }

  const winnersList =
    giveaway?.winners && giveaway.winners.length > 0
      ? giveaway.winners
      : giveaway?.winner
        ? [giveaway.winner]
        : [];

  const handleParticipate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa qualquer erro anterior

    const participantName = name.trim();
    const participantEmail = email.trim();

    if (participantName.length < 2) {
      setError("Digite um nome com pelo menos 2 caracteres.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail)) {
      setError("Digite um e-mail válido, como nome@exemplo.com.");
      return;
    }

    setIsLoading(true);

    try {
      // Aqui fazemos a chamada real para o seu backend.
      // OBS: Ajuste a porta (ex: 3333, 3000) de acordo com onde sua API está rodando!
      const response = await fetch(
        `http://localhost:3333/api/giveaways/${slug}/participate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: participantName,
            email: participantEmail,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha na comunicação com o servidor");
      }

      // Se deu tudo certo, mostramos a mensagem de sucesso
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao tentar participar. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Se a inscrição deu certo, mostramos uma tela de sucesso limpa
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-violet-500/20 bg-slate-900/80 p-8 text-center shadow-[0_30px_80px_rgba(91,33,182,0.28)] backdrop-blur-xl">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-emerald-400">
            Inscrição Confirmada!
          </h2>
          <p className="text-slate-300">
            Boa sorte! Seus dados foram registrados com sucesso no sorteio.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-violet-500/20 bg-slate-900/80 shadow-[0_30px_80px_rgba(76,29,149,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-violet-500/20 bg-linear-to-br from-violet-500/15 via-slate-900 to-slate-900 p-8 lg:border-b-0 lg:border-r">
          <div className="mb-6 inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-violet-200">
            Giveaway
          </div>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {giveaway.title}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-300">
            {giveaway.description ||
              "Preencha seus dados abaixo para participar. O resultado será gerado de forma justa e aleatória."}
          </p>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              Status
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  giveaway.status === "OPEN"
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
                    : giveaway.status === "DRAWN"
                      ? "bg-violet-500/10 text-violet-300 ring-violet-500/20"
                      : "bg-amber-500/10 text-amber-300 ring-amber-500/20"
                }`}
              >
                {giveaway.status === "OPEN"
                  ? "Aberto"
                  : giveaway.status === "DRAWN"
                    ? "Sorteado"
                    : "Encerrado"}
              </span>
              <span className="text-sm text-slate-400">
                {giveaway.status === "OPEN"
                  ? "Inscrições abertas"
                  : giveaway.status === "DRAWN"
                    ? "Resultado disponível"
                    : "Inscrições encerradas"}
              </span>
            </div>
          </div>

          {giveaway.status === "DRAWN" && winnersList.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-400/30 bg-linear-to-br from-emerald-500/15 via-slate-900 to-violet-500/10 p-5 shadow-lg shadow-emerald-950/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-xl text-emerald-300">
                  🏆
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                    {winnersList.length > 1 ? "Vencedores" : "Vencedor"}
                  </p>
                  <p className="text-sm text-slate-300">
                    {winnersList.length} selecionado
                    {winnersList.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {winnersList.map((winnerName, index) => (
                  <div
                    key={`${winnerName}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-slate-950/20 px-3 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-100">
                        {winnerName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          {giveaway.status !== "OPEN" ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-center">
              <div>
                <div className="mb-3 text-4xl">🔒</div>
                <h2 className="mb-2 text-xl font-bold text-amber-300">
                  {giveaway.status === "DRAWN"
                    ? "Sorteio Finalizado"
                    : "Inscrições Encerradas"}
                </h2>
                <p className="text-sm text-slate-300">
                  {giveaway.status === "DRAWN"
                    ? "Este sorteio já foi realizado. Os vencedores acima estão confirmados."
                    : "Este sorteio não está mais recebendo novos participantes."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                  Participar
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Inscreva-se agora
                </h2>
              </div>

              <form onSubmit={handleParticipate} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Seu E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                    placeholder="seu.melhor@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Enviando..." : "Quero Participar"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
