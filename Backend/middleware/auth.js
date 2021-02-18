const jwt=require('jsonwebtoken');
const User=require('../models/user');
require('dotenv').config();

//JWT token is passed as a header,the token is verified and if user exits with that token and is authorized this middleware attaches the user in req.user
//Authentication middleware

const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})
        if(!user){
            throw new Error('No user Found')
        }
        req.user=user
        req.token=token
        req.data=req.body
        next()
        
    }catch(e){
        res.status(401).send('Not Authorised')

    }
}

module.exports=auth;