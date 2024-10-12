const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/personalBudgetDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Create Mongoose schema
const budgetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  color: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v); // Hexadecimal color validation
      },
      message: props => `${props.value} is not a valid hexadecimal color!`
    }
  }
});

// Create Mongoose model
const Budget = mongoose.model('Budget', budgetSchema);

// GET endpoint to fetch budget data
app.get('/budget', async (req, res) => {
  try {
    const budgetData = await Budget.find({});
    res.json({ myBudget: budgetData });
  } catch (err) {
    res.status(500).send("Error fetching data from database");
  }
});

// POST endpoint to add new budget data
app.post('/budget', async (req, res) => {
  const { title, value, color } = req.body;

  // Check if all required fields are present
  if (!title || !value || !color) {
    return res.status(400).send("All fields (title, value, color) are required");
  }

  const newBudgetItem = new Budget({ title, value, color });

  try {
    const savedItem = await newBudgetItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).send("Error saving the new budget data");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
