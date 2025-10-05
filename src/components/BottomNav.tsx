import { NavLink, useLocation } from "react-router-dom";
import { FileText, DollarSign, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  const match = location.pathname.match(/\/(example|whatsapp)\/?([^\/#?]+)?/);
  const currentSheet = match && match[2] ? match[2] : (import.meta.env.VITE_SHEET_NAME as string | undefined) || "051025";
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-6 py-2 rounded-md transition-colors flex-1 justify-center",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs font-medium">EOD Report</span>
        </NavLink>
        
        <NavLink
          to="/daily-sales"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-6 py-2 rounded-md transition-colors flex-1 justify-center",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <DollarSign className="h-5 w-5" />
          <span className="text-xs font-medium">Daily Sales</span>
        </NavLink>

        <NavLink
          to={`/whatsapp/${currentSheet}`}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-6 py-2 rounded-md transition-colors flex-1 justify-center",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-medium">Whatsapp</span>
        </NavLink>
      </div>
    </nav>
  );
}
