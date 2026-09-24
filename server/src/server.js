const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('./db');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const gameSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    level: { type: Number, required: true },
    streak: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

const Game = mongoose.model('Game', gameSchema);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Game API active' });
});

app.get('/api/games', async (_req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 }).limit(20);
    res.json({ ok: true, data: games });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error loading games', error: error.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { playerName, score, level, streak, status, notes } = req.body;

    if (!playerName || !score || !level) {
      return res.status(400).json({ ok: false, message: 'playerName, score and level are required' });
    }

    const game = await Game.create({
      playerName,
      score: Number(score),
      level: Number(level),
      streak: Number(streak || 0),
      status: status || 'active',
      notes: notes || ''
    });

    res.status(201).json({ ok: true, data: game });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error saving game', error: error.message });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const updated = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ ok: false, message: 'Game not found' });
    }
    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error updating game', error: error.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const deleted = await Game.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: 'Game not found' });
    }
    res.json({ ok: true, data: deleted });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error deleting game', error: error.message });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    app.listen(port, () => {
      console.log(`Server running in fallback mode on http://localhost:${port}`);
    });
  }
};

startServer();

module.exports = { app, Game };
