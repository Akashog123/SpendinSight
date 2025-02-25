"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthYearPicker({ value, onChange }) {
  const months = [
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" },
  ];

  // Initialize the year range so the grid shows 12 years (3 rows × 4 cols)
  const initialYear = value.getFullYear();
  const [yearRangeStart, setYearRangeStart] = useState(initialYear - (initialYear % 12));
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  const handleMonthSelect = (monthValue) => {
    const newDate = new Date(value);
    newDate.setMonth(monthValue);
    onChange(newDate);
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(value);
    newDate.setFullYear(year);
    onChange(newDate);
  };

  const prevYearRange = () => setYearRangeStart(yearRangeStart - 12);
  const nextYearRange = () => setYearRangeStart(yearRangeStart + 12);

  return (
    <div className="space-y-4">
      {/* Months Grid */}
      <div className="grid grid-cols-4 gap-2">
        {months.map((m) => (
          <Button
            key={m.value}
            variant={value.getMonth() === m.value ? "default" : "outline"}
            onClick={() => handleMonthSelect(m.value)}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {/* Year Grid with Pagination */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={prevYearRange}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Select Year</div>
          <Button variant="ghost" size="sm" onClick={nextYearRange}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {years.map((y) => (
            <Button
              key={y}
              variant={value.getFullYear() === y ? "default" : "outline"}
              onClick={() => handleYearSelect(y)}
            >
              {y}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
