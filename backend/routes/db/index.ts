import express, {NextFunction, Router} from 'express';

var router: Router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next: NextFunction): void {
    res.render('index', {title: 'Express'});
});

export default router;
