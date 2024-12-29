import mongoose from 'mongoose';

const trainingPlanSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  purpose: {
    type: String,
    required: true,
    enum: ['Just for Fun', 'Exercise', 'Competition']
  },
  accessories: [{
    type: String,
    enum: ['Fins', 'Snorkel', 'Hand Fins', 'Pullbuoy', 'Kickboard']
  }],
  plan: {
    duration: String,
    exercises: [{
      type: String,
      distance: String,
      description: String
    }]
  }
});

export default mongoose.model('TrainingPlan', trainingPlanSchema); 