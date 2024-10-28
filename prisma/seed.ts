import { PrismaClient } from '@prisma/client';
import { bcryptAdapter, envs } from '../src/config';

async function main() {
  const prisma = new PrismaClient();

  try {
    // CREAR PLANES
    const plans = await prisma.plans.createManyAndReturn({
      data: [
        {

          name: 'Inicial',
          price: 0.0,
          discountPrice: 0.0,
          typePlan: 'BASICO',
          billingCycle: 'MENSUAL',
          state: true,
        },
        {
          name: 'Moderado',
          price: 50.0,
          discountPrice: 0.0,
          typePlan: 'BASICO',
          billingCycle: 'MENSUAL',
          state: true,
        },
        {
          name: 'Pro',
          price: 100.0,
          discountPrice: 0.0,
          typePlan: 'BASICO',
          billingCycle: 'MENSUAL',
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
        start: new Date(),
        end: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        state: true,
      }
    });

    // CREAR SUCURSALES
    await prisma.branches.createManyAndReturn({
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
