import { Router } from 'express';
import { PlanetaryHoursController } from '../controllers/PlanetaryHoursController.js';
import { LocationController } from '../controllers/LocationController.js';

const router = Router();
const hoursController = new PlanetaryHoursController();
const locationController = new LocationController();

router.get('/hours', (req, res) => hoursController.getPlanetaryHours(req, res));
router.get('/locations/search', (req, res) => locationController.searchCities(req, res));

export default router;
