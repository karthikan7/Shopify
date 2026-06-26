require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const connectDB    = require('./config/db');

const userroute    = require('./routes/authroutes');
const productroute = require('./routes/productroute');
const orderroute   = require('./routes/orderroute');
const paymentroute = require('./routes/paymentroutes');
const Analytic     = require('./routes/analyticsroutes');

connectDB();

const app = express();

const corsOptions = {
  origin:             process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials:        true,
  methods:            ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders:     ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.send('Backend is running'));

app.use('/auth',      userroute);
app.use('/products',  productroute);
app.use('/order',     orderroute);
app.use('/payment',   paymentroute);
app.use('/analytics', Analytic);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
