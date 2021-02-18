const mongoose=require('mongoose');


const userSchema=mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    patternStatus:{
        type:Boolean,
        default:false
    },
    balance:{
        type:Number,
        default:100000
    },
    tokens:[
        {
            token:{
                type:String
            }
        }
    ]
})


const User=mongoose.model('User',userSchema);
module.exports=User;