import { Router } from 'express';
import { CustomerController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { CustomerService } from './customer.service';

export class CustomerRoutes {
  static get routes(): Router {
    const router = Router();
    const customerService = new CustomerService();
    const controller = new CustomerController(customerService);

    // rutas
    router.get('/', [AuthMiddleware.validateJWT], controller.getCustomers);
    router.post('/', [AuthMiddleware.validateJWT], controller.createCustomer);
    router.put('/:id', [AuthMiddleware.validateJWT], controller.updateCustomer);
    router.delete(
      '/:id',
      [AuthMiddleware.validateJWT],
      controller.deleteCustomer
    );
    return router;
  }
}
