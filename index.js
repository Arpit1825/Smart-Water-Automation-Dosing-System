const express=require('express');
const app=express();
const path=require('path');
const PORT=process.env.PORT || 3000 ;


app.use(express.json());

app.listen(PORT,function(req,res){
    console.log("Arpit bhai ka dashboard chal raha hai ")
})