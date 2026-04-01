import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, ArrowUpDown, Pencil, Trash2, Download } from "lucide-react";
import { Transaction, Category, TransactionType } from "@/types/finance";

const ALL_CATEGORIES: Category[] = [
  "Salary", "Freelance", "Investment", "Food & Dining", "Shopping",
  "Transportation", "Entertainment", "Utilities", "Healthcare", "Education", "Travel", "Rent", "Other",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function TransactionForm({ initial, onSubmit, onCancel }: {
  initial?: Transaction;
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    date: initial?.date || new Date().toISOString().split("T")[0],
    description: initial?.description || "",
    amount: initial?.amount?.toString() || "",
    type: initial?.type || ("expense" as TransactionType),
    category: initial?.category || ("Other" as Category),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) return;
    onSubmit({
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Date</Label>
          <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <Label className="text-sm">Amount</Label>
          <Input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label className="text-sm">Description</Label>
        <Input placeholder="Transaction description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Type</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as TransactionType }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as Category }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Update" : "Add"} Transaction</Button>
      </div>
    </form>
  );
}

export function TransactionsSection() {
  const { filteredTransactions, filters, setFilters, role, addTransaction, editTransaction, deleteTransaction } = useFinance();
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAdmin = role === "admin";

  const toggleSort = () => {
    setFilters(f => ({
      ...f,
      sortOrder: f.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const exportCSV = () => {
    const headers = "Date,Description,Amount,Type,Category\n";
    const rows = filteredTransactions.map(t => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Transactions</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
                  <TransactionForm
                    onSubmit={(data) => { addTransaction(data); setAddOpen(false); }}
                    onCancel={() => setAddOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={exportCSV}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v as any }))}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={v => setFilters(f => ({ ...f, category: v as any }))}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ALL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.sortBy} onValueChange={v => setFilters(f => ({ ...f, sortBy: v as any }))}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="amount">By Amount</SelectItem>
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={toggleSort} title="Toggle sort order">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Transaction list */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-1">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === "income" ? "bg-income" : "bg-expense"}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{t.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${t.type === "income" ? "text-income" : "text-expense"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog open={editingId === t.id} onOpenChange={(open) => setEditingId(open ? t.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
                          <TransactionForm
                            initial={t}
                            onSubmit={(data) => { editTransaction(t.id, data); setEditingId(null); }}
                            onCancel={() => setEditingId(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-expense hover:text-expense" onClick={() => deleteTransaction(t.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
