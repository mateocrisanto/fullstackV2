import { useEffect, useMemo, useState } from 'react';

type Game = {
  _id?: string;
  playerName: string;
  score: number;
  level: number;
  streak: number;
  status: string;
  notes: string;
  createdAt?: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
};

const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:3000/api';

const initialForm = {
  playerName: 'Player 1',
  score: 0,
  level: 1,
  streak: 0,
  status: 'active',
  notes: ''
};

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalScore = useMemo(
    () => games.reduce((sum, game) => sum + (game.score || 0), 0),
    [games]
  );

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/games`);
      const data: ApiResponse<Game[]> = await res.json();
      if (!data.ok || !data.data) {
        throw new Error(data.message || 'Could not load data');
      }
      setGames(data.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleChange = (field: keyof typeof initialForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitGame = async () => {
    if (!form.playerName.trim()) {
      setError('Player name is required');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data: ApiResponse<Game> = await response.json();

      if (!response.ok || !data.ok || !data.data) {
        throw new Error(data.message || 'Failed to save game');
      }

      setGames((prev) => [data.data as Game, ...prev]);
      setForm({ ...initialForm, playerName: form.playerName });
      setSuccess('Game saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (game: Game) => {
    if (!game._id) return;

    const nextStatus = game.status === 'active' ? 'finished' : 'active';
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/games/${game._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...game, status: nextStatus })
      });

      const data: ApiResponse<Game> = await response.json();
      if (!response.ok || !data.ok || !data.data) {
        throw new Error(data.message || 'Error updating game');
      }

      setGames((prev) =>
        prev.map((item) => (item._id === game._id ? data.data as Game : item))
      );
      setSuccess('Movement updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/games/${id}`, { method: 'DELETE' });
      const data: ApiResponse<Game> = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Error deleting game');
      }

      setGames((prev) => prev.filter((game) => game._id !== id));
      setSuccess('Run deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mini game dashboard</p>
          <h1>Galaxy Run</h1>
        </div>
        <div className="score-pill">Total score: {totalScore}</div>
      </header>

      <main className="layout">
        <section className="panel form-panel">
          <h2>New run</h2>
          <label>
            Player
            <input
              value={form.playerName}
              onChange={(e) => handleChange('playerName', e.target.value)}
            />
          </label>

          <div className="inline-fields">
            <label>
              Score
              <input
                type="number"
                value={form.score}
                onChange={(e) => handleChange('score', Number(e.target.value))}
              />
            </label>
            <label>
              Level
              <input
                type="number"
                value={form.level}
                onChange={(e) => handleChange('level', Number(e.target.value))}
              />
            </label>
          </div>

          <div className="inline-fields">
            <label>
              Streak
              <input
                type="number"
                value={form.streak}
                onChange={(e) => handleChange('streak', Number(e.target.value))}
              />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="finished">Finished</option>
              </select>
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
            />
          </label>

          <button className="primary" onClick={submitGame} disabled={loading}>
            {loading ? 'Saving...' : 'Save run'}
          </button>

          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}
        </section>

        <section className="panel list-panel">
          <div className="section-header">
            <h2>Recent runs</h2>
            <button className="secondary" onClick={fetchGames} disabled={loading}>
              Refresh
            </button>
          </div>

          {games.length === 0 && !loading ? (
            <p className="empty-state">No runs saved yet.</p>
          ) : (
            <div className="game-list">
              {games.map((game) => (
                <article key={game._id || `${game.playerName}-${game.createdAt}`} className="game-card">
                  <div className="card-top">
                    <div>
                      <h3>{game.playerName}</h3>
                      <p>{game.status}</p>
                    </div>
                    <span className="badge">{game.score} pts</span>
                  </div>

                  <div className="stats">
                    <span>Lvl {game.level}</span>
                    <span>Streak {game.streak}</span>
                  </div>

                  {game.notes && <p className="notes">{game.notes}</p>}

                  <div className="card-actions">
                    <button className="secondary" onClick={() => updateGame(game)}>
                      Toggle status
                    </button>
                    <button className="danger" onClick={() => deleteGame(game._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
