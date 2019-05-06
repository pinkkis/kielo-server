import { container } from 'tsyringe';

import { RootController } from './root';
import { RoomsController } from './rooms';
import { PublicController } from './public';
import { AdminController } from './admin';

const routes = [];
const roomsRoutes = container.resolve(RoomsController).routes;
const rootRoutes = container.resolve(RootController).routes;
const publicRoutes = container.resolve(PublicController).routes;
const adminRoutes = container.resolve(AdminController).routes;

routes.push(...publicRoutes, ...roomsRoutes, ...rootRoutes, ...adminRoutes);

export { routes };
