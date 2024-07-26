import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import accountRoutes from './routes/account.js';
import authRoutes from './routes/auth.js'

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use(accountRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
