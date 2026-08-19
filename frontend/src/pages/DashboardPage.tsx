import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3333";

interface Raffle {
  id: string;
  title: string;
  slug: string;
  status: "OPEN" | "CLOSED" | "DRAWN";
  _count: {
    participants: number;
  };
}

const statusLabels: Record<Raffle["status"], string> = {
  OPEN: "Aberto",
  CLOSED: "Encerrado",
  DRAWN: "Sorteado",
};

const statusStyles: Record<Raffle["status"], string> = {
  OPEN: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  CLOSED: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  DRAWN: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingRaffleId, setDeletingRaffleId] = useState<string | null>(null);
  const [raffleToDelete, setRaffleToDelete] = useState<Raffle | null>(null);

  const loadRaffles = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/raffles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Não foi possível carregar seus sorteios.");
      }

      setRaffles(await response.json());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar seus sorteios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  const closeModal = (force = false) => {
    if (isCreating && !force) return;
    setIsModalOpen(false);
    setCreateError("");
    setTitle("");
    setDescription("");
  };

  const handleCreateRaffle = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setCreateError("");
    setIsCreating(true);

    try {
      const response = await fetch(`${API_URL}/raffles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível criar o sorteio.");
      }

      closeModal(true);
      setIsLoading(true);
      await loadRaffles();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o sorteio.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRaffle = async () => {
    if (!raffleToDelete) return;
    const raffle = raffleToDelete;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setDeleteError("");
    setDeletingRaffleId(raffle.id);

    try {
      const response = await fetch(`${API_URL}/raffles/${raffle.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível excluir o sorteio.");
      }

      setRaffles((currentRaffles) =>
        currentRaffles.filter(({ id }) => id !== raffle.id),
      );
      setRaffleToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o sorteio.",
      );
    } finally {
      setDeletingRaffleId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-8">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-violet-500/20 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(91,33,182,0.28)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
              Giveaway
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Meus Sorteios
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer rounded-full bg-linear-to-r from-violet-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110"
            >
              Criar Sorteio
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            >
              Sair da conta
            </button>
          </div>
        </header>

        {isLoading && (
          <p className="py-12 text-center text-slate-400">
            Carregando seus sorteios...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {deleteError && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {deleteError}
          </div>
        )}

        {!isLoading && !error && raffles.length === 0 && (
          <div className="rounded-3xl border border-dashed border-violet-500/30 bg-slate-900/60 px-6 py-16 text-center shadow-[0_20px_60px_rgba(91,33,182,0.12)]">
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-white">
              Você ainda não criou sorteios
            </h2>
            <p className="mt-2 text-slate-400">
              Crie seu primeiro sorteio para começar a receber inscrições.
            </p>
          </div>
        )}

        {!isLoading && !error && raffles.length > 0 && (
          <div className="grid gap-4">
            {raffles.map((raffle) => {
              const publicUrl = `${window.location.origin}/sorteio/${raffle.slug}`;

              return (
                <article
                  key={raffle.id}
                  className="rounded-3xl border border-violet-500/15 bg-slate-900/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        to={`/dashboard/sorteio/${raffle.id}`}
                        className="text-xl font-bold text-white transition hover:text-violet-300"
                      >
                        {raffle.title}
                      </Link>
                      <p className="mt-2 text-sm text-slate-400">
                        {raffle._count.participants} participante
                        {raffle._count.participants === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[raffle.status]}`}
                    >
                      {statusLabels[raffle.status]}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Link público
                    </p>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-sm text-violet-300 hover:text-violet-200"
                    >
                      {publicUrl}
                    </a>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRaffleToDelete(raffle)}
                      disabled={deletingRaffleId === raffle.id}
                      className="cursor-pointer rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingRaffleId === raffle.id
                        ? "Excluindo..."
                        : "Excluir"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-raffle-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-violet-500/20 bg-slate-900/90 p-6 shadow-[0_30px_80px_rgba(91,33,182,0.35)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
                  Novo sorteio
                </p>
                <h2
                  id="create-raffle-title"
                  className="mt-2 text-2xl font-bold text-white"
                >
                  Crie seu sorteio
                </h2>
              </div>
              <button
                type="button"
                onClick={() => closeModal()}
                disabled={isCreating}
                aria-label="Fechar modal"
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRaffle} className="mt-6 space-y-5">
              <label className="block text-sm font-medium text-slate-200">
                Título
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  minLength={3}
                  disabled={isCreating}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  placeholder="Ex.: Sorteio de lançamento"
                />
              </label>

              <label className="block text-sm font-medium text-slate-200">
                Descrição{" "}
                <span className="font-normal text-slate-500">(opcional)</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={isCreating}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  placeholder="Conte um pouco sobre este sorteio"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => closeModal()}
                  disabled={isCreating}
                  className="cursor-pointer rounded-xl px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="cursor-pointer rounded-xl bg-linear-to-r from-violet-600 to-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? "Criando sorteio..." : "Criar sorteio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {raffleToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-raffle-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900/90 p-6 shadow-[0_30px_80px_rgba(127,29,29,0.28)]">
            <div className="text-3xl">⚠️</div>
            <h2
              id="delete-raffle-title"
              className="mt-4 text-2xl font-bold text-white"
            >
              Excluir sorteio?
            </h2>
            <p className="mt-3 text-slate-300">
              Você está prestes a excluir{" "}
              <strong>{raffleToDelete.title}</strong>. Todos os participantes
              também serão removidos e esta ação não poderá ser desfeita.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setRaffleToDelete(null)}
                disabled={deletingRaffleId === raffleToDelete.id}
                className="cursor-pointer rounded-xl px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteRaffle}
                disabled={deletingRaffleId === raffleToDelete.id}
                className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingRaffleId === raffleToDelete.id
                  ? "Excluindo..."
                  : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
