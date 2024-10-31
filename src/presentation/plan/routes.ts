import { Router } from 'express';
import { PlanController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { PlanService } from './plan.service';

export class PlanRoutes {
  static get routes(): Router {
    const router = Router();
    const planService = new PlanService();
    const controller = new PlanController(planService);

    // rutas
    router.get('/', [AuthMiddleware.validateJWT], controller.getPlans);
    router.post('/', [AuthMiddleware.validateJWT], controller.createPlan);
    router.put('/:id', [AuthMiddleware.validateJWT], controller.updatePlan);
    router.delete(
      '/:id',
      [AuthMiddleware.validateJWT],
      controller.deletePlan
    );
    return router;
  }
}
