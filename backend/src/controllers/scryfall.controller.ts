import { Request, Response, NextFunction } from 'express';
import { searchCards, autocomplete, getCardById, getCardByName } from '../services/scryfall.service';
import { AppError } from '../utils/errors';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '');
    if (!q) throw new AppError('Query is required', 400);
    const page = Number(req.query.page) || 1;
    const result = await searchCards(q, page);
    res.json({ data: result.data, total: result.total_cards, hasMore: result.has_more });
  } catch (err: unknown) {
    // Scryfall returns 404 when no cards match
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 404) {
        return res.json({ data: [], total: 0, hasMore: false });
      }
    }
    next(err);
  }
}

export async function suggest(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.json({ data: [] });
    const names = await autocomplete(q);
    res.json({ data: names });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const card = await getCardById(req.params.id);
    res.json({ data: card });
  } catch (err) {
    next(err);
  }
}

export async function getByName(req: Request, res: Response, next: NextFunction) {
  try {
    const name = String(req.query.name || '');
    if (!name) throw new AppError('Name is required', 400);
    const card = await getCardByName(name);
    res.json({ data: card });
  } catch (err) {
    next(err);
  }
}
