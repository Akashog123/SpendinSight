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
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);