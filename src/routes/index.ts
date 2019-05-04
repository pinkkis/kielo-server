import { RootController } from './root';
import { container } from 'tsyringe';
import { RoomsController } from './rooms';
import { PublicController } from './public';

const roomsRoutes = container.resolve(RoomsController).routes;
const rootRoutes = container.resolve(RootController).routes;
const publicRoutes = container.resolve(PublicController).routes;

export const routes = [].concat(publicRoutes, roomsRoutes, rootRoutes);
