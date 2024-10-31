import { Router } from 'express';

import { Authroutes } from './auth/routes';
import { BranchRoutes } from './branch/routes';
import { StaffRoutes } from './staff/routes';
import { RoleRoutes } from './role/routes';
import { PermissionRoutes } from './permission/routes';
import { StudentRoutes } from './student/routes';
import { TeacherRoutes } from './teacher/routes';
import { TutorRoutes } from './tutor/routes';
import { BusinessRoutes } from './business/routes';
import { PlanRoutes } from './plan/routes';
import { SubscriptionRoutes } from './subscription/routes';
export class AppRoutes {


  static get routes(): Router {

    const router = Router();

    // Definir las rutas
    router.use('/api/auth', Authroutes.routes);
    router.use('/api/branch', BranchRoutes.routes);
    router.use('/api/staff', StaffRoutes.routes);
    router.use('/api/role', RoleRoutes.routes);
    router.use('/api/permission', PermissionRoutes.routes);
    router.use('/api/student', StudentRoutes.routes);
    router.use('/api/teacher', TeacherRoutes.routes);
    router.use('/api/tutor', TutorRoutes.routes);
    router.use('/api/business', BusinessRoutes.routes);
    router.use('/api/plan', PlanRoutes.routes);
    router.use('/api/subscription', SubscriptionRoutes.routes);

    return router;
  }
}
