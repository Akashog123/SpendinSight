'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { ReloadIcon } from '@radix-ui/react-icons';

export default function TransactionForm({ onSuccess }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    amount: parseFloat(data.amount),
                    date: new Date(data.date).toISOString()
                }),
            });

            if (!response.ok) throw new Error('Failed to save transaction');

            reset();
            onSuccess();
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 p-6 border shadow-lg p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Add New Transaction</h3>
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
                            Saving...
                        </>
                    ) : 'Add Transaction'}
                </Button>
            </form>
        </div>
    );
}