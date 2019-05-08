import 'reflect-metadata';
import { config } from 'dotenv';

config();

import { container } from 'tsyringe';
import { KieloApp } from './models/KieloApp';

const app = container.resolve(KieloApp);
app.start();
