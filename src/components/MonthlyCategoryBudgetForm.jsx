"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function MonthlyCategoryBudgetForm() {
  const categories = [
    { value: "Food", label: "Food" },
    { value: "Travel", label: "Travel" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Utilities", label: "Utilities" },
    { value: "Other", label: "Others" }
  ];
  const [budgets, setBudgets] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.value]: "" }), {})
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({ monthStr: "", breakdown: "" });

  const handleChange = (cat, val) => {
    setBudgets(prev => ({ ...prev, [cat]: val }));
  };

  const postBudgets = async (monthStr, budgets) => {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: monthStr, budgets })
    });
    if (!res.ok) throw new Error("Failed to save budgets");
    setMessage(`Budgets saved successfully for ${monthStr}.`);
    setBudgets(categories.reduce((acc, cat) => ({ ...acc, [cat.value]: "" }), {}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const monthStr = format(selectedMonth, "MMM-yyyy");
      const resBudgets = await fetch(`/api/budgets?year=${format(selectedMonth, "yyyy")}`);
      const dataBudgets = await resBudgets.json();
      const existingBudgets = dataBudgets.filter(budget => budget.month === monthStr);
      if (existingBudgets.length) {
        const breakdown = existingBudgets
          .map(b => `${b.category}: ${b.budget}`)
          .join("\n");
        setConfirmData({ monthStr, breakdown });
        setShowConfirm(true);
        setSaving(false);
        return;
      }
      await postBudgets(monthStr, budgets);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await postBudgets(confirmData.monthStr, budgets);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ConfirmationDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Budget Already Present"
        message={`Budget for ${confirmData.monthStr} already exists:\n${confirmData.breakdown}\nDo you want to overwrite this?`}
      />
      <form onSubmit={handleSubmit} className="border shadow-md rounded-lg p-6 flex-1 bg-card">
        <h3 className="text-lg font-medium mb-4">Set Spending Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <Label className="p-1">Budget Month</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {format(selectedMonth, "MMM-yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-2">
                <MonthYearPicker value={selectedMonth} onChange={setSelectedMonth} />
              </PopoverContent>
            </Popover>
          </div>
          {categories.map(cat => (
            <div key={cat.value} className="flex flex-col">
              <Label htmlFor={cat.value} className="p-1">{cat.label}</Label>
              <Input
                id={cat.value}
                type="number"
                placeholder={`${cat.label} Budget`}
                value={budgets[cat.value]}
                onChange={e => handleChange(cat.value, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:space-x-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <div className="mt-2 md:mt-0">
            {!message && <p className="text-xs">Start adding budgets to get deep insights.</p>}
            {message && <p className="text-xs">{message}</p>}
          </div>
        </div>
      </form>
    </>
  );
}
