import express from 'express';
import { createProperty, getProperties } from '../controllers/propertyController';

const router = express.Router();

router.post('/', createProperty);
router.get('/', getProperties);

export default router;
