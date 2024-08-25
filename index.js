import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import ResetPasswordRoute from './src/routes/ResetPasswordRoutes.js';
import ResetPinRoute from './src/routes/ResetPinRoutes.js';
import BankRoutes from './src/routes/BankRoutes.js';
import ChangePasswordRoutes from './src/routes/ChangePasswordRoutes.js';
import AccountRoutes from './src/routes/AccountRoutes.js';
import AddAccountRoutes from './src/routes/AddAccountRoutes.js';
import RegistrationRoute from './src/routes/RegistrationRoutes.js'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v3/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(ResetPasswordRoute);
app.use(ResetPinRoute);
app.use(BankRoutes);
app.use(ChangePasswordRoutes);
app.use(AccountRoutes);
app.use(AddAccountRoutes);
app.use(RegistrationRoute);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});