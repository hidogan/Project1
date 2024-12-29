import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  preferences: {
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    purpose: {
      type: String,
      enum: ['Just for Fun', 'Exercise', 'Competition'],
    },
    accessories: [{
      type: String,
      enum: ['Fins', 'Snorkel', 'Hand Fins', 'Pullbuoy', 'Kickboard'],
    }],
  },
  savedTrainingPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingPlan',
  }],
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema); 