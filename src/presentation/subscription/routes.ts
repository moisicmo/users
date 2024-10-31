import { Router } from 'express';
import { SubscriptionController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { SubscriptionService } from './subscription.service';

export class SubscriptionRoutes {
  static get routes(): Router {
    const router = Router();
    const subscriptionservice = new SubscriptionService();
    const controller = new SubscriptionController(subscriptionservice);

    // rutas
    router.get('/', [AuthMiddleware.validateJWT], controller.getSubcriptions);
    router.post('/', [AuthMiddleware.validateJWT], controller.createSubscription);
    router.put('/:id', [AuthMiddleware.validateJWT], controller.updateSubscription);
    router.delete(
      '/:id',
      [AuthMiddleware.validateJWT],
      controller.deleteSubscription
    );
    return router;
  }
}
