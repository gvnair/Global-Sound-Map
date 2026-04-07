import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordingsRouter from "./recordings";
import followsRouter from "./follows";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recordingsRouter);
router.use(followsRouter);

export default router;
