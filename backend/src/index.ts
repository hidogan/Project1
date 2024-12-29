import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import trainingRoutes from './routes/training';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Training API' });
});

app.use('/api/training', trainingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 