const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();
const dbConfig = require('./config/dbConfig');
const port = process.env.PORT || 5000;
app.set('view engine', 'jade');


const usersRoute = require('./routes/usersRoute');
const adminRoute = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const indexRouter = require('./routes/index');
const orderController = require('./OrderController/order');


// view engine setup

app.use('/', indexRouter);
app.use('/users', usersRoute);
app.use('/admin', adminRoute)
app.use('/payment', paymentRoutes);
app.use('/order', orderController);

app.listen(port, ()=> console.log(`listening on port ${port}`));
