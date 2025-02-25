'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { DatePickerWithPresets } from '@/components/DatePickerWithPresets';
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function EditTransactionForm({ transaction, open, onOpenChange, onSuccess }) {
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount.toFixed(2),
        date: transaction.date,
        description: transaction.description,
        category: transaction.category || 'Other'
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
      <DialogContent className="bg-card">
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
                  step="1"
                  {...register('amount', {
                      required: 'Amount is required.',
                      min: { value: 1, message: 'Amount must be at least ₹1.' }
                  })}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          <div>
              <Label>Date</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field: { onChange, value } }) => (
                  <DatePickerWithPresets
                    date={value ? new Date(value) : undefined}
                    onChange={(val) => onChange(val ? val.toISOString() : val)}
                  />
                )}
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

          <div>
              <Label htmlFor="category">Category</Label>
              <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field: { onChange, value } }) => {
                      const categories = [
                          { value: 'Food', label: 'Food' },
                          { value: 'Travel', label: 'Travel' },
                          { value: 'Entertainment', label: 'Entertainment' },
                          { value: 'Utilities', label: 'Utilities' },
                          { value: 'Other', label: 'Other' },
                      ];
                      return (
                          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                              <PopoverTrigger asChild>
                                  <Button 
                                      variant="outline" 
                                      role="combobox" 
                                      aria-expanded={categoryOpen} 
                                      className="w-full justify-between"
                                  >
                                      {value ? categories.find(cat => cat.value === value)?.label : "Select category..."}
                                      <ChevronsUpDown className="opacity-50" />
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                  <Command>
                                      <CommandInput placeholder="Search category..." className="h-9" />
                                      <CommandList>
                                          <CommandEmpty>No category found.</CommandEmpty>
                                          <CommandGroup>
                                              {categories.map(cat => (
                                                  <CommandItem
                                                      key={cat.value}
                                                      value={cat.value}
                                                      onSelect={(currentValue) => {
                                                          onChange(currentValue === value ? "" : currentValue);
                                                          setCategoryOpen(false);
                                                      }}
                                                  >
                                                      {cat.label}
                                                      <Check className={cn("ml-auto", value === cat.value ? "opacity-100" : "opacity-0")} />
                                                  </CommandItem>
                                              ))}
                                          </CommandGroup>
                                      </CommandList>
                                  </Command>
                              </PopoverContent>
                          </Popover>
                      );
                  }}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}