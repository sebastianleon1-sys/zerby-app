import express from 'express';
import cors from 'cors';
import { logErrors, errorHandler } from './middlewares/error.handler.js';

// Importar rutas
import authRouter from './api/auth.routes.js';
import proveedorRouter from './api/proveedores.routes.js';
import clienteRouter from './api/clientes.routes.js';
import anuncioRouter from './api/anuncios.routes.js';
import reviewRouter from './api/reviews.routes.js';

const app = express();

app.use(cors()); // Permite conexiones desde otros dominios
app.use(express.json()); // Permite a Express entender JSON

// --- Rutas de la API ---
app.use('/api/auth', authRouter);
app.use('/api/proveedores', proveedorRouter);
app.use('/api/clientes', clienteRouter);
app.use('/api/anuncios', anuncioRouter);
app.use('/api/reviews', reviewRouter);

app.use(logErrors);
app.use(errorHandler);

export default app;