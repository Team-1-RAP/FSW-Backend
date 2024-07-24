import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import accountRoutes from './routes/account.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use(accountRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
