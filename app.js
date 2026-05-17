import express from 'express';
import userRoute from './routes/users.route.js';
import authRoute from './routes/auth.route.js';
import cartRoute from './routes/cart.route.js';
import orderRoute from './routes/order.route.js';
import productRoute from './routes/product.route.js';
import addressRoute from './routes/address.route.js';
import ratingRoute from './routes/rating.route.js';
import stripeWebhookRoute from './routes/stripe-webhook.route.js';
import wishlistRoute from './routes/wishlist.route.js';
import adminRoute from './routes/admin.route.js';
import successResponse from './middleware/success-response.js';
import errorResponse from './middleware/error-response.js';
import sequelize from './config/database.js';
import syncDatabase from './config/sync-database.js';
import cors from "cors";
import dotenv from 'dotenv';
import "./models/associations.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
let databaseReady;

async function initializeDatabase() {
  if (!databaseReady) {
    databaseReady = (async () => {
      await sequelize.authenticate();
      await syncDatabase();
    })();
  }

  return databaseReady;
}

async function ensureDatabaseReady(req, res, next) {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
}

app.use(cors({
  origin: ["http://localhost:5174", "http://localhost:5173", "https://xamadon-keithel.vercel.app"],
  credentials: true,
}));

app.use(ensureDatabaseReady);
app.use(stripeWebhookRoute);
app.use(express.json());
app.use(successResponse);
app.use('/uploads', express.static('uploads'));

app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);
app.use('/addresses', addressRoute);
app.use('/orders', orderRoute);
app.use('/ratings', ratingRoute);
app.use('/wishlist', wishlistRoute);
app.use('/admin', adminRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorResponse);

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
