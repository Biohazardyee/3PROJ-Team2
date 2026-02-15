import express, {Router} from 'express';
import {Request, Response, NextFunction} from 'express';
import MediaController from '../../modules/db/medias/media.controller.js';
import MediaStatusController from '../../modules/db/medias/media.status.controller.js';

var router: Router = express.Router();

router.post('/', function (req: Request, res: Response, next: NextFunction): void {
    MediaController.add(req, res, next);
});

router.get('/:id', function (req: Request, res: Response, next: NextFunction): void {
    MediaController.getById(req, res, next);
});

router.get('/', function (req: Request, res: Response, next: NextFunction): void {
    MediaController.getAll(req, res, next);
});

router.put('/:id', function (req: Request, res: Response, next: NextFunction): void {
    MediaController.update(req, res, next);
});

router.delete('/:id', function (req: Request, res: Response, next: NextFunction): void {
    MediaController.delete(req, res, next);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/status', function (req: Request, res: Response, next: NextFunction): void {
    MediaStatusController.add(req, res, next);
});

router.get('/', function (req: Request, res: Response, next: NextFunction): void {
    MediaStatusController.getAll(req, res, next);
})

router.get('/status/:user_id/:media_id', function (req: Request, res: Response, next: NextFunction): void {
    MediaStatusController.getById(req, res, next);
});

router.put('/status/:user_id/:media_id', function (req: Request, res: Response, next: NextFunction): void {
    MediaStatusController.update(req, res, next);
});

router.delete('/status/:user_id/:media_id', function (req: Request, res: Response, next: NextFunction): void {
    MediaStatusController.delete(req, res, next);
});

export default router;
