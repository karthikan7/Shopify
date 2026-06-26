const mongoose =require('mongoose');

const userschema=new mongoose.Schema({

    name :{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    verified:{
        type:Boolean,
        default:false
    },
})

const user=mongoose.model('user',userschema);
module.exports=user;