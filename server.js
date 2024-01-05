const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
const uri = 'mongodb+srv://Shatrughn_Pal:cgyZTYlQ2E9i0Diq@cluster0.ytgctz6.mongodb.net/mydb?retryWrites=true&w=majority';

// MongoDB connection options
const mongoOptions = { useUnifiedTopology: true };

// Secret key for JWT
const secretKey = 'your-secret-key';

// Helper function to generate JWT tokens
function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach the decoded token (user information) to req.user
    req.user = decodedToken;

    next();
  });
}

// Handle the POST request for signup
app.post('/signup', async (req, res) => {
  try {
    // Extract the data from the request body
    const { fullName, email, password, mobile, role } = req.body;

    // Connect to MongoDB Atlas
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    const db = client.db('mydb');

    // Store the data in the specified collection
    const collection = db.collection('Myc');
    const result = await collection.insertOne({
      fullName,
      email,
      password,
      mobile,
      role,
    });
    const token = generateToken({ email, role });

    // Send a response back to the client
    res.status(200).json({ message: 'Signup successful' });

    // Close the MongoDB connection
    client.close();
  } catch (error) {
    console.error('Error while processing signup', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/login', async (req, res) => {
  try {
    // Extract the data from the request body
    const { email, password } = req.body;

    // Connect to MongoDB Atlas
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    const db = client.db('mydb');

    // Retrieve the user record from the database based on the provided email
    const collection = db.collection('Myc');
    const user = await collection.findOne({ email });

    if (!user) {
      // User not found
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    if (password !== user.password) {
      // Invalid password
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ email, role: user.role });

    // Successful login
    res.status(200).json({ message: 'Login successful', token,role:user.role });

    // Close the MongoDB connection
    client.close();
  } catch (error) {
    console.error('Error while processing login', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/suppliers', async (req, res) => {
  try {
    // Extract the data from the request body
    const { firstName, lastName, email, password, mobile, product } = req.body;
    const uri = 'mongodb+srv://Shatrughn_Pal:cgyZTYlQ2E9i0Diq@cluster0.ytgctz6.mongodb.net/mydb?retryWrites=true&w=majority';
   // const { firstName, lastName, email, password, mobile, product } = req.body;
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db('mydb');

    // Retrieve the highest numericId from the collection
    const collection = db.collection('suppliers');
    const highestNumericId = await collection.find().sort({ numericId: -1 }).limit(1).toArray();
    const numericId = highestNumericId.length > 0 ? highestNumericId[0].numericId + 1 : 1;

    // Store the data in the specified collection
    const result = await collection.insertOne({
      numericId,
      firstName,
      lastName,
      email,
      password,
      mobile,
      product
    });

    // Send a response back to the client
    res.status(200).json({ message: 'Supplier added successfully' });
    client.close();
  } catch (error) {
    console.error('Error while processing add supplier', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.get('/suppliers', async (req, res) => {
  try {
      
    //await client.connect();
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    //nconst db = client.db('mydb');
    //const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db('mydb');
    // Retrieve all suppliers from the collection
    const collection = db.collection('suppliers');
    const suppliers = await collection.find({}, { _id: 0 }).toArray();

    // Modify the response to include the numericId as the ID
    const modifiedSuppliers = suppliers.map(supplier => ({
      id: supplier.numericId,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      email: supplier.email,
      password: supplier.password,
      mobile: supplier.mobile,
      product: supplier.product
    }));

    // Send the suppliers as the response
    res.status(200).json(modifiedSuppliers);
    client.close();
  } catch (error) {
    console.error('Error while fetching suppliers', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Handle the PUT request for updating a supplier
app.put('/suppliers/:id', async (req, res) => {
  try {
      
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      //nconst db = client.db('mydb');
      //const client = new MongoClient(uri, { useUnifiedTopology: true });
      await client.connect();
      const id = req.params.id;
    const { firstName, lastName, email, password, mobile, product } = req.body;
  //   const client = new MongoClient(uri, { useUnifiedTopology: true });
  //   await client.connect();
    const db = client.db('mydb');
    const collection = db.collection('suppliers');

    // Create the update object
    const update = {
      $set: {
        firstName,
        lastName,
        email,
        password,
        mobile,
        product
      }
    };

    const result = await collection.updateOne({ numericId: Number(id) }, update);

    res.status(200).json({ message: 'Supplier updated successfully' });
    client.close();
  } catch (error) {
    console.error('Error updating supplier', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
// Handle the DELETE request for deleting a supplier
app.delete('/suppliers/:id', async (req, res) => {
  try {
      
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      //nconst db = client.db('mydb');
      //const client = new MongoClient(uri, { useUnifiedTopology: true });
      await client.connect();
    const id = req.params.id;

   // await client.connect();
    const db = client.db('mydb');
    const collection = db.collection('suppliers');

    const result = await collection.deleteOne({ numericId: Number(id) });

    res.status(200).json({ message: 'Supplier deleted successfully' });
    client.close();
  } catch (error) {
    console.error('Error deleting supplier', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Start the server
const port = process.env.PORT ||1998;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
