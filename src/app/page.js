'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import TransactionForm from '@/components/TransactionForm';
import EditTransactionForm from '@/components/EditTransactionForm';
import Barchart from '@/components/Barchart';
import PieChartInteractive from '@/components/PieChartInteractive';
import MonthlyCategoryBudgetForm from '@/components/MonthlyCategoryBudgetForm';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTransaction, setEditTransaction] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

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
      processCategoryData(data);
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
    setMonthlyData(Object.entries(monthlyExpenses).map(([month, total]) => ({ month, expense: total })));
  };

  // Calculate category spending from transactions over the last 12 months.
  const processCategoryData = (transactions) => {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
    const categorySums = {};
    transactions.forEach(({ amount, category, date }) => {
      const transactionDate = new Date(date);
      if (transactionDate >= twelveMonthsAgo && transactionDate <= now) {
        categorySums[category] = (categorySums[category] || 0) + amount;
      }
    });
    setCategoryData(
      Object.entries(categorySums).map(([category, total]) => ({
        category,
        expense: total,
      }))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete transaction');
      await fetchTransactions();
    } catch (err) {
      console.error(err.message);
    }
  };

  const columns = [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => 
        new Date(row.getValue('date')).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description'),
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => <div className="text-right">₹{row.getValue('amount')}</div>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.getValue('category'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTransaction(transaction)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(transaction._id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    initialState: { pagination: { pageSize: 5 } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-screen-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-screen-2xl">
      {/* Top Section - Responsive Three Columns */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:flex-[1.2]">
          <TransactionForm onSuccess={fetchTransactions} />
        </div>
        <div className="lg:flex-[1.8]">
          <Card className="border shadow-md rounded-lg h-full">
            <CardContent>
              {/* Pie Chart */}
                <PieChartInteractive data={categoryData} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:flex-[1.4]">
          <div className="flex flex-col h-full gap-4">
            <div className="flex-1">
              <MonthlyCategoryBudgetForm />
            </div>
            <div className="p-4 border shadow-md rounded-lg flex-1 bg-card">
                <div className="text-lg flex place-self-center inline-block mt-2">
                  Made with <Heart className="text-blue-500 fill-blue-500 mx-1" />  by Akash.
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <div className="border shadow-lg rounded-lg bg-card p-6 lg:flex-[1.8] lg:basis-5/9">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-medium">Transactions</h3>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Filter by <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-1">
                <Button 
                  disabled={!table.getCanPreviousPage()} 
                  title="Previous Page"
                  onClick={() => table.previousPage()}
                  variant="outline"
                >
                  <ChevronLeft />
                </Button>
                <Button 
                  disabled={!table.getCanNextPage()} 
                  title="Next Page"
                  onClick={() => table.nextPage()}
                  variant="outline"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="min-w-[100px] truncate">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="truncate max-w-[175px] min-w-0 px-4 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="lg:flex-[1.6] lg:basis-4/9">
        <Card className="border shadow-lg rounded-lg h-full">
          <CardHeader>
            <h3 className="text-lg font-medium">Monthly Spending of Last 12 months</h3>
          </CardHeader>
          <CardContent className="h-full">
          <Barchart 
            data={monthlyData} 
            chartConfig={{ expense: { label: "Total Expense: ₹", backgroundColor: "bg-card" }, barColor: "hsl(var(--chart-1))" }} 
          />
          </CardContent>
          </Card>
        </div>
      </div>
      
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