import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  await dbConnect();
  const transactions = await Transaction.find().sort({ date: -1 });
  return new Response(JSON.stringify(transactions), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const transaction = await Transaction.create(body);
  return new Response(JSON.stringify(transaction), { status: 201 });
}