import { Download, Users, Plus } from "lucide-react";
import { Button } from "./ui/Button";
function ControlBar() {
  return <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Debate Session #4029
        </h2>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-mono rounded-full border border-green-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
    variant="secondary"
    size="small"
    leftIcon={<Users className="w-4 h-4" />}
  >

          Audience Mode
        </Button>
        <Button
    variant="secondary"
    size="small"
    leftIcon={<Download className="w-4 h-4" />}
  >

          Export Verdict
        </Button>
        <Button
    variant="primary"
    size="small"
    leftIcon={<Plus className="w-4 h-4" />}
  >

          New Debate
        </Button>
      </div>
    </div>;
}
export {
  ControlBar
};
