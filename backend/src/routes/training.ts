import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate', async (req, res) => {
  const { level, purpose, accessories } = req.body;

  try {
    const prompt = `Generate 2 swimming training plans for a ${level} level swimmer. 
    Purpose: ${purpose}
    Available accessories: ${accessories.join(', ')}
    
    Each plan should include:
    1. Total duration
    2. A sequence of exercises with distances and descriptions
    3. Appropriate use of the available accessories
    4. Rest periods between exercises
    
    Format the response as a JSON array with 2 plans.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const generatedPlans = JSON.parse(completion.choices[0].message.content || '[]');
    res.json({ plans: generatedPlans });
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

export default router; 