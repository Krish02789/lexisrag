import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import queryRouter from "./query";
import evaluationRouter from "./evaluation";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(queryRouter);
router.use(evaluationRouter);
router.use(statsRouter);

export default router;
