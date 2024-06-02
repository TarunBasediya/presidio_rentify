import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const mongoUrl = process.env.MONGO_URL;

// Allowed origins
const allowedOrigins = [
    'https://665be7171ce667f0412f8a92--glowing-kitten-b5c84f.netlify.app',
    'https://glowing-kitten-b5c84f.netlify.app'
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Connect to MongoDB
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,  // Ensure TLS is used
    tlsAllowInvalidCertificates: false,  // Do not allow invalid certificates
    tlsAllowInvalidHostnames: false  // Do not allow invalid hostnames
});

// Middleware to parse JSON requests
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['buyer', 'seller'] },
});

const User = mongoose.model('User', userSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    rent: { type: Number, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Property = mongoose.model('Property', propertySchema);

// Register Route
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, role } = req.body;
    
    try {
        console.log('Registering user:', { firstName, lastName, email, phoneNumber, role });
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const user = new User({ firstName, lastName, email, phoneNumber, password: hashedPassword, role });
        await user.save();
        console.log('User registered successfully:', user);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(400).json({ error: error.message });
    }
    res.on('finish', () => {
        console.log('Response Headers:', res.getHeaders());
    });
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Login attempt for:', email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        console.log('User found:', user);
        console.log('Password to compare:', password);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('User logged in successfully:', user);
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Middleware to authenticate user
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Seller Route to post property
app.post('/properties', auth, async (req, res) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const property = new Property({ ...req.body, seller: req.user.userId });
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Buyer Route to get properties
app.get('/properties', auth, async (req, res) => {
    try {
        const properties = await Property.find().populate('seller', 'firstName lastName email phoneNumber');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to serve static files (like your React app's build folder)
app.use(express.static(path.join(__dirname, 'C:\\Users\\USER\\Documents\\Presidio_challenge\\presidio\\build')));

// Catch-all route to serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'C:\\Users\\USER\\Documents\\Presidio_challenge\\presidio\\build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
