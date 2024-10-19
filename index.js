const express = require('express');
// import express from 'express';
const app = express();
const cors = require('cors');
// import { cors } from 'cors'
require('dotenv').config();
// import dotenv from 'dotenv';
// dotenv.config();
const bodyParser = require('body-parser');
// import bodyParser from 'body-parser';
// import mongoose from 'mongoose';
// import __dirname from 'path';

// import process from 'process';
let mongoose = require('mongoose');


mongoose.connect("mongodb+srv://Grace-ecom:Grace-ecom@ecommerce.cebwllj.mongodb.net/?retryWrites=true&w=majority&appName=Ecommerce");

const Schema = mongoose.Schema;

// try {

// } catch (e) {
// console.log(e)
// }

// USER SCHEMA
const userSchema = new Schema({
  username: { type: String, required: true }
})
let userModel = mongoose.model("user", userSchema);


// SCHEMA FOR EXERCISES
const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: new Date() }

})
let exerciseModel = mongoose.model("exercise", exerciseSchema);




app.use(cors())
app.use(express.static('public'))
app.use('/', bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/users', (req, res) => {
  let username = req.body.username;
  let newUser = userModel({ username: username });
  newUser.save();
  res.json(newUser);
})



app.get('/api/users', (req, res) => {
  userModel.find({}).then((users) => {
    res.json(users);

  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body)

  let userId = req.params._id;
  let exerciseObj = {
    userId: userId,
    description: req.body.description,
    duration: req.body.duration
  }

  if (req.body.date != '') {

    exerciseObj.date = req.body.date;

  }

  let newExercise = new exerciseModel(exerciseObj);



  //To return the user object, we need to find the user first.

  userModel.findById(userId).then((userFound) => {

    if(!userFound) {
      return res.status(404).json({error: "User not found"})
    }


    newExercise.save();
    res.json({
      _id: userFound._id,
      username: userFound.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString() //We cant parse in a date object, we need to convert it to date string
    })

  })

});


app.get('/api/users:_id/logs', (req, res) => {
  let userId = req.params._id;

  let responseObj = {};

  let limitParam = req.query.limit; //how do we know a query parameter
  let toParam = req.query.to;
  let fromParam = req.query.from;

  // Let limitParam be in String if it's in Interger
  limitParam = limitParam ? parseInt(limitParam) : limitParam

  let queryObj = {
    userId: userId
  }

  if (fromParam || toParam) {
    queryObj.date = {};
    if (fromParam) {
      queryObj.date['$gte'] = fromParam;
    }
    if (toParam) {
      queryObj.date['$lte'] = toParam;
    }
  }


  //Let's find the user by id provided in params


  userModel.findById(userId).then((userFound) => {


    let username = userFound.username;
    let userId = userFound._id;


    responseObj = {
      _id: userId,
      username: username
    }



    exerciseModel.find(
      // userId: userId
      queryObj
    ).limit(limitParam).then(
      (exercises) => {

        // For any dates returned to be String

        exercises = exercises.map((x) => {
          return {
            description: x.description,
            duration: x.duration,
            date: x.date.toDateString()
          }
        })

        responseObj.log = exercises;
        responseObj.count = exercises.length;
        res.json(responseObj);

      }
    )


  })

})



















const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
