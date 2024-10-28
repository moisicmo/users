import { Router } from 'express';
import { TeacherController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TeacherService } from './teacher.service';

export class TeacherRoutes {
  static get routes(): Router {
    const router = Router();
    const teacherService = new TeacherService();
    const controller = new TeacherController(teacherService);

    // rutas
    router.get('/', [AuthMiddleware.validateJWT], controller.getTeachers);
    router.post('/', [AuthMiddleware.validateJWT], controller.createTeacher);
    router.put('/:id', [AuthMiddleware.validateJWT], controller.updateTeacher);
    router.delete(
      '/:id',
      [AuthMiddleware.validateJWT],
      controller.deleteTeacher
    );
    return router;
  }
}
