import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3333";

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface RaffleDetails {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "OPEN" | "CLOSED" | "DRAWN";
  participants: Participant[];
}

const statusLabels: Record<RaffleDetails["status"], string> = {
  OPEN: "Aberto",
  CLOSED: "Encerrado",
  DRAWN: "Sorteado",
};

const statusStyles: Record<RaffleDetails["status"], string> = {
  OPEN: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  CLOSED: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  DRAWN: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
};

export default function RaffleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [raffle, setRaffle] = useState<RaffleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [drawQuantity, setDrawQuantity] = useState(1);
  const [drawError, setDrawError] = useState("");
  const [closeError, setCloseError] = useState("");
  const [winner, setWinner] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [winners, setWinners] = useState<
    {
      id: string;
      name: string;
      email: string;
    }[]
  >([]);

  const normalizeDrawQuantity = (value: number | string, maxValue: number) => {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (!Number.isFinite(parsedValue)) {
      return 1;
    }

    const integerValue = Math.trunc(parsedValue);
    return Math.min(Math.max(integerValue, 1), Math.max(maxValue, 1));
  };

  useEffect(() => {
    const loadRaffle = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/raffles/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.error || "Não foi possível carregar o sorteio.",
          );
        }

        setRaffle(await response.json());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o sorteio.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRaffle();
  }, [id, navigate]);

  const copyPublicLink = async () => {
    if (!raffle) return;

    await navigator.clipboard.writeText(
      `${window.location.origin}/sorteio/${raffle.slug}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDrawRaffle = async () => {
    if (!raffle || isDrawing) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsDrawing(true);
    setDrawError("");

    try {
      const response = await fetch(`${API_URL}/raffles/${raffle.id}/draw`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: drawQuantity }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível realizar o sorteio.");
      }

      const data = await response.json();
      const selectedWinners = data.winners ?? [data.winner].filter(Boolean);

      setWinner(selectedWinners[0] ?? null);
      setWinners(selectedWinners);
      setRaffle((currentRaffle) =>
        currentRaffle ? { ...currentRaffle, status: "DRAWN" } : currentRaffle,
      );
      setIsDrawModalOpen(false);
      setDrawQuantity(1);
    } catch (err) {
      setDrawError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o sorteio.",
      );
    } finally {
      setIsDrawing(false);
    }
  };

  const handleCloseRaffle = async () => {
    if (!raffle || isClosing) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsClosing(true);
    setCloseError("");
    setDrawError("");

    try {
      const response = await fetch(`${API_URL}/raffles/${raffle.id}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || "Não foi possível encerrar as inscrições.",
        );
      }

      setRaffle((currentRaffle) =>
        currentRaffle ? { ...currentRaffle, status: "CLOSED" } : currentRaffle,
      );
      setIsCloseModalOpen(false);
    } catch (err) {
      setCloseError(
        err instanceof Error
          ? err.message
          : "Não foi possível encerrar as inscrições.",
      );
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-400">
        Carregando sorteio...
      </main>
    );
  }

  if (error || !raffle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Não foi possível abrir o sorteio
          </h1>
          <p className="mt-3 text-slate-400">
            {error || "Sorteio não encontrado."}
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </main>
    );
  }

  const publicUrl = `${window.location.origin}/sorteio/${raffle.slug}`;

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-8">
      <section className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer text-sm font-medium text-slate-200 transition hover:text-white"
          >
            ← Voltar ao Dashboard
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
          >
            Sair da conta
          </button>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                Detalhes do sorteio
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {raffle.title}
              </h1>
              {raffle.description && (
                <p className="mt-3 max-w-2xl text-slate-400">
                  {raffle.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[raffle.status]}`}
              >
                {statusLabels[raffle.status]}
              </span>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {raffle.status === "OPEN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCloseError("");
                      setIsCloseModalOpen(true);
                    }}
                    disabled={isClosing}
                    className="cursor-pointer rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isClosing ? "Encerrando..." : "Encerrar Inscrições"}
                  </button>
                )}
                {raffle.status !== "DRAWN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawError("");
                      setIsDrawModalOpen(true);
                    }}
                    disabled={isDrawing}
                    className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/60"
                  >
                    {isDrawing ? "Sorteando..." : "Realizar Sorteio"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {(drawError || closeError) && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {drawError || closeError}
            </div>
          )}

          {(winner || winners.length > 0) && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
                {winners.length > 1
                  ? "Vencedores do sorteio"
                  : "Vencedor do sorteio"}
              </p>

              {winners.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {winners.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-emerald-500/20 bg-slate-950/20 p-4"
                    >
                      <h2 className="text-xl font-bold text-emerald-200">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-sm text-emerald-100/90">
                        {item.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-2xl font-bold text-emerald-200">
                    {winner?.name}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-100/90">
                    {winner?.email}
                  </p>
                </>
              )}
            </div>
          )}

          <div className="mt-6 rounded-xl bg-slate-800 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Link público
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-violet-300 hover:text-violet-200"
              >
                {publicUrl}
              </a>
              <button
                type="button"
                onClick={copyPublicLink}
                className="cursor-pointer rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:bg-slate-700"
              >
                {copied ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <p className="text-sm font-medium text-slate-400">
            Total de inscritos
          </p>
          <p className="mt-2 text-4xl font-bold text-violet-300">
            {raffle.participants.length}
          </p>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-bold">Participantes</h2>
          </div>

          {raffle.participants.length === 0 ? (
            <p className="p-8 text-center text-slate-400">
              Ainda não há participantes neste sorteio.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nome</th>
                    <th className="px-6 py-4 font-semibold">E-mail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {raffle.participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 font-medium">
                        {participant.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {participant.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">
              Encerrar inscrições?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Essa ação encerrará as inscrições para este sorteio. Você poderá
              realizar o sorteio depois, mas novos participantes não poderão se
              inscrever.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseRaffle}
                disabled={isClosing}
                className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isClosing ? "Encerrando..." : "Sim, encerrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">
              Realizar sorteio agora?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Essa ação irá sortear participantes entre os inscritos e marcar o
              sorteio como realizado. Não será possível desfazer.
            </p>

            <div className="mt-5">
              <label
                htmlFor="drawQuantity"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Quantidade de ganhadores
              </label>
              <input
                id="drawQuantity"
                type="number"
                min={1}
                max={raffle.participants.length}
                value={drawQuantity}
                onChange={(event) => {
                  const nextValue =
                    event.target.value === "" ? 1 : event.target.value;
                  setDrawQuantity(
                    normalizeDrawQuantity(
                      nextValue,
                      raffle.participants.length || 1,
                    ),
                  );
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-violet-500"
              />
              <p className="mt-2 text-xs text-slate-400">
                Máximo permitido: {raffle.participants.length} participante
                {raffle.participants.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDrawModalOpen(false)}
                className="cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDrawRaffle}
                disabled={isDrawing}
                className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-600/60"
              >
                {isDrawing ? "Sorteando..." : "Sim, sortear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
