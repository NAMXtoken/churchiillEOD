import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Calendar
        mode="single"
        selected={undefined}
        onSelect={(d) => {
          if (!d) return;
          const slug = format(d, "ddMMyy");
          navigate(`/daily-sales/${slug}`);
        }}
        className="rounded-md border border-table-border bg-card p-2"
      />
    </div>
  );
};

export default Index;
