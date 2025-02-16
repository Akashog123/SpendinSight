import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), { status: 400 });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedTransaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedTransaction));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction ID' }), { status: 400 });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Transaction deleted' }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
