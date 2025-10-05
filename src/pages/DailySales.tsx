import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSheetRange, saveDailySales } from "@/lib/api";
import { format, parse } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const TIME_OPTIONS = ["HH", "D", "LN"] as const;
const PMNT_OPTIONS = ["Cash", "PPay", "Master", "Visa"] as const;

const DailySales = () => {
  const [rows, setRows] = useState(
    Array.from({ length: 30 }, () => ({ ord: "", time: "", amount: "", payment: "", covers: "" }))
  );
  const { sheet: sheetParam } = useParams();
  const initialDate = sheetParam ? parse(sheetParam, "ddMMyy", new Date()) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const selectedSheet = useMemo(() => (selectedDate ? format(selectedDate, "ddMMyy") : undefined), [selectedDate]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOrd, setShowOrd] = useState(false);

  useEffect(() => {
    async function load() {
      if (!selectedSheet) return;
      try {
        setLoading(true);
        const res = await fetchSheetRange(selectedSheet, `A2:E${30 + 1}`);
        const vals = (res.values || []) as string[][];
        const mapped = Array.from({ length: 30 }, (_, i) => {
          const row = vals[i] || [];
          const ord = row[0] || "";
          const time = TIME_OPTIONS.includes(row[1] as any) ? row[1] : "";
          const amount = row[2] || "";
          const payment = PMNT_OPTIONS.includes(row[3] as any) ? row[3] : "";
          const covers = row[4] || "";
          return { ord, time, amount, payment, covers };
        });
        setRows(mapped);
      } catch (e: any) {
        const msg = e?.message || "Failed to load sheet";
        if (msg.includes("404") || msg.toLowerCase().includes("sheet not found")) {
          toast.error("Sheet not found. Please select a different date.");
        } else {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedSheet]);

  const onChange = (idx: number, key: keyof (typeof rows)[number], value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value } as any;
      return next;
    });
  };

  const onSave = async () => {
    try {
      const toSave = rows.reduce((acc: any[], r, i) => {
        const filled = r.ord || r.time || r.amount || r.payment || r.covers;
        if (filled) {
          acc.push({ ...r, ord: r.ord || String(i + 1) });
        }
        return acc;
      }, []);
      if (toSave.length === 0) {
        toast.info("No rows to save.");
        return;
      }
      await saveDailySales(toSave as any, selectedSheet);
      toast.success("Report saved to Google Sheet.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save report");
    }
  };

  const isRowFilled = (r: { ord?: any; time?: any; amount?: any; payment?: any; covers?: any }) =>
    Boolean(r.ord || r.time || r.amount || r.payment || r.covers);

  const lastFilledIndex = (() => {
    let idx = -1;
    for (let i = 0; i < rows.length; i++) {
      if (isRowFilled(rows[i])) idx = i;
    }
    return idx;
  })();

  const insertionIndex = lastFilledIndex + 1; // place buttons after last filled; 0 if none filled
  const visibleCount = Math.max(1, Math.min(rows.length, lastFilledIndex + 2));

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="sm:bg-card sm:rounded-lg sm:shadow-lg sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-primary">
            Daily Sales Report
          </h1>
          <Button className="fixed bottom-6 right-6 z-50" onClick={() => navigate("/")}>Home</Button>

          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground">Date:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-40 justify-start">
                  {selectedDate ? format(selectedDate, "dd/MM/yy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d || selectedDate)}
                  className="rounded-md"
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="sm:hidden"
              onClick={() => setShowOrd((v) => !v)}
            >
              {showOrd ? "Hide Ord #" : "Show Ord #"}
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedSheet && navigate(`/eod-report/${selectedSheet}`)}
              disabled={!selectedSheet}
              className="w-full sm:w-auto"
            >
              View EOD Report
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedSheet && navigate(`/whatsapp/${selectedSheet}`)}
              disabled={!selectedSheet}
            >
              Whatsapp
            </Button>
            {selectedSheet && (
              <span className="text-xs text-muted-foreground">Sheet: {selectedSheet}</span>
            )}
          </div>

          <div className="space-y-6">

            <div className="mt-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-primary">Sales Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary">
                      <th className={`border border-table-border p-2 sm:p-3 text-left text-xs sm:text-sm text-primary-foreground ${showOrd ? "table-cell" : "hidden sm:table-cell"}`}>Ord #</th>
                      <th className="border border-table-border p-2 sm:p-3 text-left text-xs sm:text-sm text-primary-foreground w-20 sm:w-24 whitespace-nowrap">Time Block</th>
                      <th className="border border-table-border p-2 sm:p-3 text-right text-xs sm:text-sm text-primary-foreground w-16">Amount</th>
                      <th className="border border-table-border p-2 sm:p-3 text-left text-xs sm:text-sm text-primary-foreground w-20 sm:w-24 whitespace-nowrap">Pmnt Type</th>
                      <th className="border border-table-border p-2 sm:p-3 text-center text-xs sm:text-sm text-primary-foreground w-12 sm:w-16">Covers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      Array.from({ length: 10 }).map((_, i) => (
                        <tr key={`skeleton-${i}`} className={i % 2 === 0 ? "bg-table-row-alt" : ""}>
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={`s-${i}-${j}`} className="border border-table-border p-2">
                              <Skeleton className="h-8 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                    {!loading && rows.slice(0, visibleCount).map((row, idx) => (
                      <React.Fragment key={`rowgrp-${idx}`}>
                        {idx === insertionIndex && (
                          <tr key={`actions-${idx}`}>
                            <td colSpan={5} className="p-2">
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end items-stretch sm:items-center">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setRows(Array.from({ length: 30 }, () => ({ ord: "", time: "", amount: "", payment: "", covers: "" })))
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  Clear
                                </Button>
                                <Button onClick={onSave} className="w-full sm:w-auto">Save Report</Button>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr key={`row-${idx}`} className={idx % 2 === 0 ? "bg-table-row-alt" : ""}>
                          <td className={`border border-table-border p-1.5 sm:p-2 ${showOrd ? "table-cell" : "hidden sm:table-cell"}`}>
                            <Input
                              type="text"
                              value={row.ord}
                              placeholder={String(idx + 1)}
                              onChange={(e) => onChange(idx, 'ord', e.target.value)}
                              className="h-8"
                            />
                          </td>
                          <td className="border border-table-border p-1.5 sm:p-2 w-20 sm:w-24">
                            <Select value={row.time || undefined} onValueChange={(val) => onChange(idx, 'time', val)}>
                              <SelectTrigger className="h-8 w-full min-w-0">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border border-table-border p-1.5 sm:p-2 w-16">
                            <Input type="number" step="0.01" value={row.amount} onChange={(e) => onChange(idx, 'amount', e.target.value)} className="h-8 text-right w-16 min-w-0" />
                          </td>
                          <td className="border border-table-border p-1.5 sm:p-2 w-20 sm:w-24">
                            <Select value={row.payment || undefined} onValueChange={(val) => onChange(idx, 'payment', val)}>
                              <SelectTrigger className="h-8 w-full min-w-0">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {PMNT_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border border-table-border p-1.5 sm:p-2 w-12 sm:w-16">
                            <Input
                              type="number"
                              value={row.covers}
                              onChange={(e) => onChange(idx, 'covers', e.target.value)}
                              className="h-8 text-center w-10 sm:w-12 min-w-0"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySales;
