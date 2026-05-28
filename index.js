const express=require('express');
const app=express();
const path=require('path');



app.use(express.json());

app.listen(3000,function(req,res){
    console.log("Arpit bhai ka dashboard chal raha hai ")
})