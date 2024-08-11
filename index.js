import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import ResetPasswordRoute from './src/routes/ResetPasswordRoutes.js';
import authRoutes from './src/routes/auth.js';
import BankRoutes from './src/routes/Bank.js';
import ChangePasswordRoutes from './src/routes/ChangePassword.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v3/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(ResetPasswordRoute);
app.use(authRoutes);
app.use(BankRoutes);
app.use(ChangePasswordRoutes);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});