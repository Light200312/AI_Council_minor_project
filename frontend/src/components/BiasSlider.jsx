import { Toggle } from "./ui/Toggle";

// BiasSlider controls and displays the council bias level.
function BiasSlider({ value, onChange }) {
  return <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-slate-900">
          Council Bias Level
        </label>
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
          {value}%
        </span>
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full mb-4">
        <div
    className="absolute h-full bg-slate-400 rounded-full transition-all duration-300"
    style={{
      width: `${value}%`
    }}
  >
        </div>
        {
    /* Thumb simulator since we don't have a native slider component yet */
  }
        <div
    className="absolute h-4 w-4 bg-slate-900 rounded-full top-1/2 -translate-y-1/2 shadow cursor-pointer hover:scale-110 transition-transform"
    style={{
      left: `${value}%`,
      transform: "translate(-50%, -50%)"
    }}
  >
        </div>
        <input
    type="range"
    min="0"
    max="100"
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  />

      </div>

      <div className="flex justify-between text-xs text-slate-400 font-mono uppercase">
        <span>Neutral</span>
        <span>Biased</span>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Toggle
    label="Force Neutrality Protocol"
    size="small"
    checked={value === 0}
    onChange={(checked) => onChange(checked ? 0 : 50)}
  />

      </div>
    </div>;
}
export {
  BiasSlider
};
