require('module-alias/register');
import { PrismaClient } from '@prisma/client'
import { AppRoutes } from '@/presentation/router';
import { Server } from '@/server';
import { envs } from '@/config';

async function main() {
  const prisma = new PrismaClient();

  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  try {
    await server.start();
  } catch (error) {
    console.error('Error starting the server:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
