import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSheetRange } from "@/lib/api";
import { Button } from "@/components/ui/button";

const DEFAULT_SHEET = (import.meta.env.VITE_SHEET_NAME as string | undefined) || "051025";
const RANGE = "G28:I62";

const Whatsapp: React.FC = () => {
  const { sheet: sheetParam } = useParams();
  const navigate = useNavigate();
  const sheet = (sheetParam as string) || DEFAULT_SHEET;

  const [values, setValues] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchSheetRange(sheet, RANGE);
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
  }, [sheet]);

  const text = useMemo(() => {
    if (!values || !values.length) return "";
    return values
      .map((row) => (row || []).map((c) => (c ?? "").toString().trim()).join(" ").trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }, [values]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Fallback: create a temporary textarea
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 border border-table-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">WhatsApp Export</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Sheet: {sheet} • Range: {RANGE}</p>
            </div>
            <Button onClick={onCopy} disabled={!text} className="w-full sm:w-auto shrink-0">Copy</Button>
          </div>
          <Button className="fixed bottom-6 right-6 z-50" onClick={() => navigate("/")}>Home</Button>
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
          {!loading && !error && (
            <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-muted rounded p-3 sm:p-4 border border-table-border min-h-[200px]">
              {text || "No data"}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Whatsapp;
