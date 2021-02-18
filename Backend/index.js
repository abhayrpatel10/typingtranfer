const express=require('express');
const morgan=require('morgan');
const helmet=require('helmet');
const cors=require('cors');

const userRoutes=require('./routes/user');


const app=express();

require('./db/connection');

app.use(morgan('combined'));
app.use(helmet());
app.use(cors())

app.use(express.json());

app.use(userRoutes);

const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log('Listening on port '+port);
})

