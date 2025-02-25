import mongoose from 'mongoose';
import { format } from 'date-fns';

const categoryBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Entertainment', 'Utilities', 'Other'],
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  month: {
    type: String, // Format: "MMM-yyyy"
    required: true,
    default: () => format(new Date(), 'MMM-yyyy'),
  },
});

export default mongoose.models.CategoryBudget ||
  mongoose.model('CategoryBudget', categoryBudgetSchema);
