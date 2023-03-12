const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRound = 10;

mongoose.connect('mongodb://127.0.0.1:27017/userDB').catch((err)=>{ 
    if(!err){
        console.log("Successfully connected");
    }else{
        console.log("Connection Failed!!");
    }
});

const RegLogData = mongoose.model('RegLogData', new mongoose.Schema({
    name : String,
    email : String,
    password: String
}));

const createDoc = async (name, email, password) =>{

    const isFound = await RegLogData.findOne({email: email}).exec();

    if(!isFound){


        bcrypt.genSalt(saltRound, (err, salt)=>{
            bcrypt.hash(password, salt, (err, hash)=>{
                const doc = new RegLogData({
                    name: name,
                    email: email,
                    password: hash
                })
                const isSave = doc.save();
            })
        })

        return false
    }
    else{
        return true;
    }
}

const server = express();

server.use(cors())
server.use(bodyParser.json());

server.post('/register', async (req, res)=>{

    const { name, email, password } = req.body;

    const isReg = await createDoc(name, email, password);
    if(isReg){
        res.json({"message" : "User already exist"});
    }
    else{
        res.json({"message" : "Registration Successfull", "status" : "true"})
    }
    
})

server.post('/login', async (req, res)=>{

    const { email, password } = req.body;
    const Found = await RegLogData.findOne({email: email}).exec();


    if(Found){
        bcrypt.compare(password, Found.password, (err, result)=>{
            if(result){
                res.json({"message" : "LoggedIn", "user": Found, "isFound":true});
            }else{
                res.json({"message" : "Password not match"});
            }
        })
    }else{
        res.json({"message" : "Account not found", "isFound":false});
    }

    
})

server.get('/', (req, res)=>{
    res.send("Hello World");
})










server.listen(5000, ()=>{
    console.log("Server started");
})