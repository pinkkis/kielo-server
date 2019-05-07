import { container } from 'tsyringe';

import { RootController } from './RootController';
import { RoomsController } from './RoomsController';
import { PublicController } from './PublicController';
import { AdminController } from './AdminController';

const routes = [];
const roomsRoutes = container.resolve(RoomsController).routes;
const rootRoutes = container.resolve(RootController).routes;
const publicRoutes = container.resolve(PublicController).routes;
const adminRoutes = container.resolve(AdminController).routes;

routes.push(...publicRoutes, ...roomsRoutes, ...rootRoutes, ...adminRoutes);

export { routes };
