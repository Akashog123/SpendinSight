import dbConnect from '@/lib/db';
import CategoryBudget from '@/models/CategoryBudget';

// GET: Retrieve budgets for a specific month
export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    // Use 'year' query parameter, defaulting to current year if not provided
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    // Create regex to match month strings ending with "-{year}" or simply "{year}"
    const yearRegex = new RegExp(`-${year}$`);
    const budgets = await CategoryBudget.find({ month: { $regex: yearRegex } });
    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch budgets' }), { status: 500 });
  }
}

// POST: Create or update budgets
export async function POST(request) {
  await dbConnect();
  try {
    const { month, budgets } = await request.json();
    const results = [];
    for (const category in budgets) {
      const amount = parseFloat(budgets[category]);
      if (isNaN(amount)) continue;
      const updated = await CategoryBudget.findOneAndUpdate(
        { category, month },
        { budget: amount },
        { upsert: true, new: true }
      );
      results.push(updated);
    }
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save budgets' }), {
      status: 500,
    });
  }
}
