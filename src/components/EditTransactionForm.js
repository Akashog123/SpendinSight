'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReloadIcon } from '@radix-ui/react-icons';

export default function EditTransactionForm({ transaction, open, onOpenChange, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount.toFixed(2),
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date).toISOString()
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update transaction');
      
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        {...register('amount', {
                            required: 'Amount is required',
                            min: { value: 0.01, message: 'Amount must be at least $0.01' }
                        })}
                    />
                    {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                </div>

                <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        {...register('date', { required: 'Date is required' })}
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        {...register('description', {
                            required: 'Description is required',
                            maxLength: { value: 100, message: 'Description too long (max 100 chars)' }
                        })}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : 'Update Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}