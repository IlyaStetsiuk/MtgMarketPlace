import { Router } from 'express';
import { search, suggest, getById, getByName } from '../controllers/scryfall.controller';

const router = Router();

router.get('/search', search);
router.get('/autocomplete', suggest);
router.get('/cards/named', getByName);
router.get('/cards/:id', getById);

export default router;
