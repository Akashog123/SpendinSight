'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TransactionForm from '@/components/TransactionForm';
import DeleteButton from '@/components/DeleteButton';
import EditTransactionForm from '@/components/EditTransactionForm';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
      processMonthlyData(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (transactions) => {
    const monthlyExpenses = {};
    transactions.forEach(({ amount, date }) => {
      const month = new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + amount;
    });
    setMonthlyData(Object.entries(monthlyExpenses).map(([name, total]) => ({ name, total })));
  };

  return (
    <div className="container mx-auto p-4 max-w-screen-2xl">
  {/* Top Section - Form + Chart */}
  <div className="lg:flex lg:gap-6">
    {/* Add Transaction Form */}
    <div className="lg:w-1/2 p-3">
      <TransactionForm onSuccess={fetchTransactions} />
    </div>
    {/* Monthly Expenses Chart */}
    <div className="lg:w-1/2 p-3">
      <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
      <div className="h-[313px] mb-8 p-6 border shadow-lg p-4 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{
                  background: "rgb(31 41 55)",
                  border: "1px solid rgb(75 85 99)",
                  borderRadius: "0.5rem",
                  color: "rgb(249 250 251)",
                }}/>
              <Bar dataKey="total" fill="rgb(50, 218, 176)" />
            </BarChart>
          </ResponsiveContainer>
          </div>
    </div>
  </div>

      {loading ? (
        <div className="text-center p-4 mt-6">Loading transactions...</div>
      ) : (
        <div className="mt-6 rounded-xl shadow-xl overflow-hidden">
      <div className="p-3">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        <Table className="border-collapse w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                  <TableCell className="text-center">
                    <Button  
                      className="mr-2 bg-[#545769] hover:bg-[#2c2f3b] p-2"
                      onClick={() => setEditTransaction(transaction)}
                    >
                      Edit
                    </Button>
                    <DeleteButton 
                      transactionId={transaction._id} 
                      onDelete={fetchTransactions}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
    </div>
  )}
      {editTransaction && (
        <EditTransactionForm
          transaction={editTransaction}
          open={!!editTransaction}
          onOpenChange={(open) => !open && setEditTransaction(null)}
          onSuccess={() => {
            fetchTransactions();
            setEditTransaction(null);
          }}
        />
      )}
    </div>
  );
}