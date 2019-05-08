import 'reflect-metadata';
import 'dotenv';
import { container } from 'tsyringe';
import { KieloApp } from './models/KieloApp';

const app = container.resolve(KieloApp);
app.start();
