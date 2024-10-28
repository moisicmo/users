import { PrismaClient } from '@prisma/client';
import { bcryptAdapter, envs } from '../src/config';

async function main() {
  const prisma = new PrismaClient();

  try {
    
    //  CREA UNA FUNCIÓN; a partir de una Subscription crea Payment, PaymentState e Invoice
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION create_payment_on_subscription()
      RETURNS TRIGGER AS $$
      DECLARE
          plan_billing_cycle INTEGER;
          payment_id INTEGER;
      BEGIN
          -- Obtener el billingCycle del plan correspondiente
          SELECT "billingCycle" INTO plan_billing_cycle
          FROM "Plans"
          WHERE id = NEW."planId";

          -- Crear un pago
          INSERT INTO "Payments" ("subscriptionId", "referenceCode", "description", "start", "end", "amount", "updatedAt")
          VALUES (
              NEW.id,
              CONCAT('SUB', NEW.id),
              'Suscripción automática',
              CURRENT_DATE,
              CURRENT_DATE + plan_billing_cycle,
              0,
              CURRENT_TIMESTAMP
          )
          RETURNING id INTO payment_id;

          -- Crear estados de pago
          INSERT INTO "PaymentStates" ("paymentId","TypePaymentState","updatedAt")
          VALUES
              ( payment_id, 'PENDIENTE', CURRENT_TIMESTAMP ),
              ( payment_id, 'FINALIZADO', CURRENT_TIMESTAMP );

          -- Crear una factura
          INSERT INTO "Invoices" ("paymentId","nameInvoice","numberDocument","updatedAt")
          VALUES
              ( payment_id, 'apellido', '123456', CURRENT_TIMESTAMP );

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // ASIGNA UN TRIGGER A LA TABLA Subscriptions,
    // DONDE LLAMA LA FUNCIÓN create_payment_on_subscriptioN
    // DESPUES DE CREAR UN Subscription
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trigger_create_payment_on_subscription
      AFTER INSERT ON "Subscriptions"
      FOR EACH ROW
      EXECUTE FUNCTION create_payment_on_subscription();
    `);

    // CREAR PLANES
    const plans = await prisma.plans.createManyAndReturn({
      data: [
        {
          name: 'Inicial',
          price: 0.0,
          discountPrice: 0.0,
          typePlan: 'BASICO',
          billingCycle: 30,
          state: true,
        },
        {
          name: 'Moderado',
          price: 50.0,
          discountPrice: 0.0,
          typePlan: 'PREMIUM',
          billingCycle: 30,
          state: true,
        },
        {
          name: 'Pro',
          price: 100.0,
          discountPrice: 0.0,
          typePlan: 'EMPRESARIAL',
          billingCycle: 30,
          state: true,
        }
      ]
    });

    // CREAR NEGOCIO
    const business = await prisma.businesses.create({
      data: {
        typeBusiness: 'ADMINISTRACION',
        name: 'HOLU',
        url: 'www.holu.com',
      },
    });

    // CREAR SUSCRIPCIÓN
    await prisma.subscriptions.create({
      data: {
        businessId: business.id,
        planId: plans[0].id,
        state: true,
        updatedAt: new Date(),
      }
    });

    // CREAR SUCURSALES
    const branches = await prisma.branches.createManyAndReturn({
      data: [
        {
          businessId: business.id,
          name: 'Batallón Colorados',
          address: 'Batallón Colorados 1010',
          phone: '24629219',
        },
        {
          businessId: business.id,
          name: '20 de octubre',
          address: '20 de octubre 232',
          phone: '1234929',
        },
      ],
    });

    // CREAR ROLES Y PERMISOS
    const role = await prisma.roles.create({
      data: {
        businessId: business.id,
        name: 'administrador',
        permissions: {
          create: [
            {
              businessId: business.id,
              name: 'crear',
              module: 'crear',
            },
            {
              businessId: business.id,
              name: 'editar',
              module: 'editar',
            },
          ],
        },
      },
    });

    // CREAR USUARIO
    const user = await prisma.users.create({
      data: {
        dni: envs.DNI,
        name: envs.NAME_SEED,
        lastName: envs.LAST_NAME_SEED,
        password: bcryptAdapter.hash(envs.EMAIL_SEED),
        branches:{
          connect:branches.map((branch) => ({ id: branch.id })),
        }
      },
    });

    // CREAR CONTACTO
    await prisma.contacts.create({
      data: {
        userId: user.id,
        data: envs.EMAIL_SEED,
        validated: true,
      },
    });

    // CREAR STAFF
    await prisma.staffs.create({
      data: {
        userId: user.id,
        roleId: role.id,
        superStaff: true,
      },
    });

    console.log('Datos de semilla insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
