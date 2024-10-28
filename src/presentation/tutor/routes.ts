import { Router } from 'express';
import { TutorController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TutorService } from './tutor.service';
export class TutorRoutes {
  static get routes(): Router {
    const router = Router();
    const service = new TutorService();
    const controller = new TutorController(service);

    // rutas
    router.get('/', [AuthMiddleware.validateJWT], controller.getTutors);
    router.post('/', [AuthMiddleware.validateJWT], controller.createTutor);
    router.put('/:id', [AuthMiddleware.validateJWT], controller.updateTutor);
    router.delete('/:id', [AuthMiddleware.validateJWT], controller.deleteTutor);
    return router;
  }
}
