import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Entertainment', 'Utilities', 'Other'],
    default: 'Other',
  },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);