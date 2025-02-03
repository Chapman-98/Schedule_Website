// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies and allow cross-origin requests
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/calendarDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Define a Mongoose schema for a Task
const taskSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  assignment: { type: String, required: true },
  color: { type: String, required: true }
});

// Create the Task model
const Task = mongoose.model('Task', taskSchema);

// API Route: Get tasks for a specific day
app.get('/tasks/:day', async (req, res) => {
  try {
    const day = parseInt(req.params.day);
    const tasks = await Task.find({ day });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Route: Add a new task
app.post('/tasks', async (req, res) => {
  try {
    const { day, assignment, color } = req.body;
    const newTask = new Task({ day, assignment, color });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Route: Delete a task by its ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
