import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSheetRange } from "@/lib/api";
import { Button } from "@/components/ui/button";

const DEFAULT_SHEET = (import.meta.env.VITE_SHEET_NAME as string | undefined) || "051025";
const DEFAULT_RANGE = "G1:L26";

const Example: React.FC = () => {
  const [values, setValues] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sheet: sheetParam } = useParams();
  const sheet = (sheetParam as string) || DEFAULT_SHEET;
  const range = DEFAULT_RANGE;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchSheetRange(sheet, range);
        if (!cancelled) setValues(res.values || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load range");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [sheet, range]);

  const columns = useMemo(() => (values[0] ? values[0].length : 0), [values]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 pb-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-table-border">
          <h1 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">EOD Report Snapshot</h1>
          <Button className="fixed bottom-6 right-6 z-50" onClick={() => navigate("/")}>Home</Button>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Sheet: {sheet} • Range: {range}</p>
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    {Array.from({ length: columns }).map((_, cIdx) => (
                      <th key={cIdx} className="border border-table-border p-2 sm:p-3 text-xs sm:text-sm text-left font-medium">
                        {values[0]?.[cIdx] ?? ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {values.slice(1).map((row, rIdx) => {
                    const first = (row?.[0] || "").toString().trim();
                    const isSection = first.toLowerCase().startsWith("breakdown") || first.toLowerCase().startsWith("daily revenue");
                    const rowClass = isSection ? "bg-gray-100 dark:bg-gray-800 font-semibold" : (rIdx % 2 === 0 ? "bg-table-row-alt" : "");
                    return (
                      <tr key={rIdx} className={rowClass}>
                        {Array.from({ length: Math.max(columns, row.length) }).map((_, cIdx) => (
                          <td key={cIdx} className="border border-table-border p-2 text-xs sm:text-sm">
                            {row[cIdx] ?? ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Example;
