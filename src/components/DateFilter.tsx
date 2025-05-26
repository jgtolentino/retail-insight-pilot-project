
import { Button } from "@/components/ui/button";

interface DateFilterProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export const DateFilter = ({ dateRange, onDateRangeChange }: DateFilterProps) => {
  const ranges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-700 font-medium">Time Period:</span>
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={dateRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onDateRangeChange(range.value)}
          className={dateRange === range.value ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};
