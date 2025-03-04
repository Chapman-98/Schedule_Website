const express = require('express');
const cors = require('cors');
const fs = require('fs')
const mongoose = require('mongoose')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());


mongoose.connect('mongodb://localhost:27017/schedule_assignments');
  
  const assignmentSchema = new mongoose.Schema(
  {
    month: Number,
    day: Number,
    style: String,
    assignmentName: String
  });
  
const Assignment = mongoose.model('Assignment', assignmentSchema);


app.get('/data', async (req, res) => 
{
  try
  {
    const data = await Assignment.find({})
    res.json({message: 'Hello from GET /data', data: data});
  }
  catch(err)
  {
    res.status(500).json({err: err.message})
  }
});


app.post('/data', (req, res) => 
{
  const receivedData = req.body;
  console.log('Received POST data:', receivedData);
  console.log('Month:', receivedData.month);
  res.json({message: 'Data received successfully', data: receivedData});

  const assignment = new Assignment(
  {
    month: receivedData.month,
    day: receivedData.day,
    style: receivedData.style,
    assignmentName: receivedData.assignmentName
  });

  assignment.save()
    .then(doc => 
    {
      console.log('Saved document:', doc);
    })
    .catch(err => 
    {
      console.error('Error saving document:', err);
    });
});

app.listen(PORT, () => 
{
  console.log('Server is running on port ${PORT}');
});