import express from 'express';
import { logger } from '../utils/logger';
import { aiService } from '../services/ai';

// In-memory storage for saved plans (replace with database in production)
let savedPlans: any[] = [];

// Helper function to parse AI response into structured exercises
function parseAIResponseToExercises(aiResponse: string) {
  const exercises = [];
  
  // Split response into sections (each exercise block)
  const sections = aiResponse.split(/\n\n+/);
  
  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim());
    let exercise: any = {};
    
    for (const line of lines) {
      if (line.toLowerCase().startsWith('exercise name:')) {
        exercise.name = line.split(':')[1].trim();
      } else if (line.toLowerCase().startsWith('sets:')) {
        exercise.sets = parseInt(line.split(':')[1]) || 1;
      } else if (line.toLowerCase().startsWith('reps:')) {
        exercise.reps = parseInt(line.split(':')[1]) || 1;
      } else if (line.toLowerCase().startsWith('notes:')) {
        exercise.notes = line.split(':')[1].trim();
      }
    }
    
    // Only add if we have at least a name
    if (exercise.name) {
      // Ensure defaults for missing values
      exercise.sets = exercise.sets || 1;
      exercise.reps = exercise.reps || 1;
      exercise.notes = exercise.notes || '';
      exercises.push(exercise);
    }
  }

  // If no exercises were parsed, create a default structure
  if (exercises.length === 0) {
    console.warn('Failed to parse exercises from AI response, using default structure');
    console.log('AI Response:', aiResponse);
    
    exercises.push({
      name: 'Warm-up',
      sets: 1,
      reps: 1,
      notes: 'Easy freestyle and breathing exercises (5-10 minutes)'
    });

    exercises.push({
      name: 'Main Set',
      sets: 3,
      reps: 1,
      notes: aiResponse.substring(0, 200) // Use first 200 chars of AI response as notes
    });

    exercises.push({
      name: 'Cool-down',
      sets: 1,
      reps: 1,
      notes: 'Easy swimming and stretching (5-10 minutes)'
    });
  }

  return exercises;
}

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    notes?: string;
  }>;
  level: string;
  goals: string[];
  daysPerWeek: number;
  duration: number;
  createdAt: Date;
}

const router = express.Router();

// Get all training plans
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all training plans');
    res.json(savedPlans);
  } catch (error) {
    logger.error('Error fetching training plans:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: 'Failed to fetch training plans' });
  }
});

// Create new training plan
router.post('/', async (req, res) => {
  try {
    const planData = req.body;
    logger.info('Creating new training plan:', { planData });

    // Validate input
    if (!planData.level || !planData.goals || !planData.daysPerWeek || !planData.duration) {
      logger.warn('Invalid training plan data received:', { planData });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate prompt for AI
    const prompt = `Create a swimming training plan with the following requirements:
    - Level: ${planData.level}
    - Goals: ${planData.goals.join(', ')}
    - Days per week: ${planData.daysPerWeek}
    - Duration per session: ${planData.duration} minutes

    Please provide a structured plan with specific exercises, sets, and reps. Format each exercise as:
    Exercise Name: [name]
    Sets: [number]
    Reps: [number]
    Notes: [description]`;

    // Use template type based on plan complexity
    const templateType = planData.duration > 60 ? 'detailed' : 
                        planData.duration <= 30 ? 'quick' : 
                        'creative';

    logger.info('Using template type:', { templateType });

    try {
      logger.info('Calling AI service with prompt:', { promptLength: prompt.length });
      const aiResponse = await aiService.generateTrainingPlan(prompt, templateType);
      logger.info('Received AI response:', { 
        responseLength: aiResponse.content.length,
        model: aiResponse.model,
        provider: aiResponse.provider
      });
      
      // Parse AI response and create exercises
      logger.info('Parsing AI response into exercises');
      let exercises;
      try {
        exercises = parseAIResponseToExercises(aiResponse.content);
        logger.info('Successfully parsed exercises:', { 
          exerciseCount: exercises.length,
          firstExercise: exercises[0],
          rawContent: aiResponse.content.substring(0, 200) + '...' // Log first 200 chars
        });
      } catch (parseError) {
        logger.error('Error parsing AI response:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          stack: parseError instanceof Error ? parseError.stack : undefined,
          rawContent: aiResponse.content
        });
        throw new Error('Failed to parse AI response into exercises');
      }

      const generatedPlan = {
        id: `plan-${Date.now()}`,
        name: `${planData.level} Swimming Plan - ${planData.daysPerWeek}x per week`,
        description: `A ${planData.duration} minute swimming plan for ${planData.level} level, focusing on ${planData.goals.join(', ')}`,
        exercises,
        daysPerWeek: planData.daysPerWeek,
        duration: planData.duration,
        level: planData.level,
        goals: planData.goals,
        createdAt: new Date(),
        provider: aiResponse.provider,
        model: aiResponse.model,
        templateType
      };

      logger.info('Successfully created training plan:', { planId: generatedPlan.id });
      res.status(201).json(generatedPlan);
    } catch (error: any) {
      logger.error('AI Service error:', {
        error: error instanceof Error ? error.message : 'Unknown AI service error',
        stack: error instanceof Error ? error.stack : undefined,
        requestBody: planData
      });
      return res.status(503).json({ 
        error: 'Training plan generation service is currently unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error: any) {
    logger.error('Error creating training plan:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
    });
    res.status(500).json({ 
      error: 'Failed to create training plan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Save a training plan
router.post('/save', async (req, res) => {
  try {
    const plan = req.body;
    logger.info('Saving training plan:', { planId: plan.id });

    // Validate the plan
    if (!plan.id || !plan.name || !plan.exercises) {
      return res.status(400).json({ error: 'Invalid plan data' });
    }

    // Check if plan already exists
    const existingPlanIndex = savedPlans.findIndex(p => p.id === plan.id);
    if (existingPlanIndex !== -1) {
      // Update existing plan
      savedPlans[existingPlanIndex] = plan;
    } else {
      // Add new plan
      savedPlans.push(plan);
    }

    logger.info('Successfully saved training plan:', { planId: plan.id });
    res.status(200).json({ message: 'Plan saved successfully' });
  } catch (error) {
    logger.error('Error saving training plan:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: 'Failed to save training plan' });
  }
});

// Get specific training plan
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Fetching training plan:', { planId: id });

    const plan = savedPlans.find(p => p.id === id);
    if (!plan) {
      logger.warn('Training plan not found:', { planId: id });
      return res.status(404).json({ error: 'Training plan not found' });
    }

    logger.info('Successfully fetched training plan:', { planId: id });
    res.json(plan);
  } catch (error) {
    logger.error('Error fetching training plan:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      planId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to fetch training plan' });
  }
});

// Delete training plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Deleting training plan:', { planId: id });

    const planIndex = savedPlans.findIndex(p => p.id === id);
    if (planIndex === -1) {
      logger.warn('Training plan not found for deletion:', { planId: id });
      return res.status(404).json({ error: 'Training plan not found' });
    }

    savedPlans = savedPlans.filter(p => p.id !== id);
    logger.info('Successfully deleted training plan:', { planId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting training plan:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      planId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to delete training plan' });
  }
});

export default router; 