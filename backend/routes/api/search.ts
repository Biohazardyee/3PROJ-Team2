import { searchController } from '../../modules/external_api/search.controller.js';
import express from 'express';

var router = express.Router();

router.get('/' , function (req, res, next) {
    searchController.search(req, res, next);
});

export default router;