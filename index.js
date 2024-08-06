import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs'; 
import https from 'https'; 
import accountRoutes from './routes/account.js';
import authRoutes from './routes/auth.js';
import BankRoutes from './routes/Bank.js';
import ChangePasswordRoutes from './routes/ChangePassword.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v3/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(accountRoutes);
app.use(authRoutes);
app.use(BankRoutes);
app.use(ChangePasswordRoutes);

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

const privateKey = fs.readFileSync('/etc/nginx/ssl/selfsigned.key', 'utf8');
const certificate = fs.readFileSync('/etc/nginx/ssl/selfsigned.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server is running on port 443');
});