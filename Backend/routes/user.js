const express=require('express');
require('dotenv').config()
var TypingDnaClient = require('typingdnaclient');
const User = require('../models/user');
const jwt=require('jsonwebtoken');
var typingDnaClient = new TypingDnaClient(process.env.TYPINGDNA_API_KEY,process.env.TYPINGDNA_API_SECRET)
const auth=require('../middleware/auth');
var multer  = require('multer')
const router=express.Router();
const path = require('path');
const fs=require('fs');
var ffmetadata = require("ffmetadata");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, req.user._id.toString()+ file.originalname);
    }
});

const upload = multer({ storage: storage});



router.post('/capturepattern',auth,async(req,res)=>{
    const user=req.user;
    const typingPattern=req.body.typingPattern;

    const _id=user._id.toString()



    typingDnaClient.save(_id, typingPattern, async(err,result)=>{
        if(err){
            res.status(500).json({
                data:{
                    message:'Internal Server Error'
                }
            })
        }
        user.patternStatus=true;
        await user.save();
        res.status(200).json({
            data:result
        })
    });

})

router.post('/createuser',async(req,res)=>{

    try{

        const check=await User.findOne({email:req.body.email});

        if(check){
            res.status(400).json({
                data:{
                    message:'User Already exists.Please Login'
                }
            })
        }
        const user=new User(req.body);
        const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
        user.tokens=user.tokens.concat({token})
        await user.save();
        res.status(200).json({
            data:{
                token,
                email:user.email,
                name:user.name,
                status:user.patternStatus,
                balance:user.balance
            }
        })
        
    }catch(e){
        res.status(500).json({
            data:{
                message:'Internal Server Error'
            }
        })
    }

})

router.post('/login',async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{
        const user=await User.findOne({email});
        if(!user){
            res.status(404).json({
                data:{
                    message:'User Not found.Please register first.'
                }
            })
        }
        if(user.password === password){
            const token =jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
            user.tokens=user.tokens.concat({token})
            await user.save();
            res.status(200).json({
                data:{
                    token,
                    email:user.email,
                    name:user.name,
                    status:user.patternStatus,
                    balance:user.balance
                }
            })

        }else{
            res.status(401).json({
                data:{
                    message:'Invalid Credentials'
                }
            })
        }
    }catch(err){
        res.status(200).json({
            data:err
        })
    }
})

router.post('/verifyuser',auth,async(req,res)=>{
    const user= req.user;
    const typingPattern=req.body.typingPattern;
    const quality=2;//recommended by TypingDNA
    typingDnaClient.verify(user._id.toString(), typingPattern, quality, (err,result)=>{
        if(err){
            res.status(500).json({
                data:{
                    message:'Internal Server Error'
                }
            })
        }

        if(result.success === 1){
            res.status(200).json({
                data:result
            })
        }

        if(result.success === 0){
            res.status(401).json({
                data:{
                    message:'Typing Pattern Does not match.Malicious'
                }
            })
        }

        

        
    });

})

router.post('/debit',auth,async(req,res)=>{
    const amount=req.body.amount;
    const user=req.user;
    const typingPattern=req.body.typingPattern;
    const quality=2;//recommended by TypingDNA

    typingDnaClient.verify(user._id.toString(), typingPattern, quality, async(err,result)=>{
        if(err){
            res.status(500).json({
                data:{
                    message:'Internal Server Error'
                }
            })
        }

        if(result.success === 0){
            res.status(401).json({
                data:{
                    message:'Typing Pattern Does not match.'
                }
            })
        }

        if(result.success === 1){
            if(user.balance < amount){
                res.status(400).json({
                    data:{
                        message:'Insufficient Balance'
                    }
                })
                return;
            }
            try{
        
                user.balance=user.balance-amount;
                await user.save();
                res.status(200).json({
                    data:{
                        balance: user.balance,
                        message:'Transaction Successfull',
                        result
        
                    }
                })
            }catch(e){
                res.status(500).json({
                    data:{
                        message:e
                    }
                })
            }
        }

        

        
    });

    
    
    

})

router.post('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.status(200).json({
            data:{
                message:'Logged out successfully'
            }
        })
    }catch(e){
        res.status(500).json({
            data:{
                message:'Internal Server Error'
            }
        })
    }
})

router.post('/submitform',auth,upload.single('file'),async(req,res)=>{
    

    const user=req.user;
    console.log(user);
    const typingPattern=req.body.typingPattern;
    console.log(typeof(typingPattern))
    console.log(typingPattern)
    const quality=2;//recommended by TypingDNA

    typingDnaClient.verify(user._id.toString(), typingPattern, quality, async(err,result)=>{
        if(err){
            res.status(500).json({
                data:{
                    message:'Internal Server Error'
                }
            })
            
        }

        if(result.success === 0){
            console.log(result)
            res.status(401).json({
                data:{
                    message:'Typing Pattern Does not match.'
                }
            })
            //delete file
        }

        if(result.success === 1){
            console.log('success')
            
            res.status(200).json({
                data:{
                    message:'Form Submitted to the bank successfully',
                }
            })
                    
        }

        

        
    });

    
    
    


})



module.exports=router;