import { useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  Zap,
  Scale,
  Brain,
  Eye,
  Send,
  X,
  RotateCcw
} from "lucide-react";
import { MOCK_ARGUMENTS } from "../data/mockData";
function DirectorChoice({
  options,
  onSelect,
  isLoading
}) {
  const [previewStrategy, setPreviewStrategy] = useState(
    null
  );
  const [previewText, setPreviewText] = useState("");
  const getIcon = (type) => {
    switch (type) {
      case "aggressive":
        return <Zap className="w-5 h-5 text-amber-600" />;
      case "balanced":
        return <Scale className="w-5 h-5 text-blue-600" />;
      case "logical":
        return <Brain className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };
  const getBorderColor = (type) => {
    switch (type) {
      case "aggressive":
        return "hover:border-amber-300 hover:bg-amber-50";
      case "balanced":
        return "hover:border-blue-300 hover:bg-blue-50";
      case "logical":
        return "hover:border-purple-300 hover:bg-purple-50";
      default:
        return "";
    }
  };
  const handleStrategyClick = (option) => {
    if (isLoading) return;
    const args = MOCK_ARGUMENTS[option.type] || MOCK_ARGUMENTS["balanced"];
    const randomArg = args[Math.floor(Math.random() * args.length)];
    setPreviewStrategy(option);
    setPreviewText(randomArg);
  };
  const handleSend = () => {
    if (previewStrategy) {
      onSelect(previewStrategy);
      setPreviewStrategy(null);
      setPreviewText("");
    }
  };
  const handleDiscard = () => {
    setPreviewStrategy(null);
    setPreviewText("");
  };
  const handleRegenerate = () => {
    if (previewStrategy) {
      const args = MOCK_ARGUMENTS[previewStrategy.type] || MOCK_ARGUMENTS["balanced"];
      const randomArg = args[Math.floor(Math.random() * args.length)];
      setPreviewText(randomArg);
    }
  };
  return <div className="w-full bg-white border-t border-slate-200 p-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Director's Choice
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {previewStrategy ? "PREVIEW ARGUMENT BEFORE SENDING" : "SELECT RESPONSE STRATEGY"}
          </span>
        </div>

        {
    /* Preview Panel */
  }
        {previewStrategy ? <div className="space-y-4">
            {
    /* Strategy Badge */
  }
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                {getIcon(previewStrategy.type)}
              </div>
              <div>
                <span className="font-bold text-slate-900">
                  {previewStrategy.title}
                </span>
                <span
    className={`ml-3 text-xs px-2 py-0.5 rounded font-mono ${previewStrategy.riskLevel === "High" ? "bg-red-100 text-red-700" : previewStrategy.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
  >

                  {previewStrategy.riskLevel} Risk
                </span>
              </div>
            </div>

            {
    /* Argument Preview */
  }
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Generated Argument Preview
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-mono">
                "{previewText}"
              </p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Logic: {previewStrategy.logicScore}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Rhetoric: {previewStrategy.rhetoricScore}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Words: {previewText.split(" ").length}
                </div>
              </div>
            </div>

            {
    /* Action Buttons */
  }
            <div className="flex items-center justify-between">
              <Button
    variant="tertiary"
    size="small"
    leftIcon={<RotateCcw className="w-4 h-4" />}
    onClick={handleRegenerate}
  >

                Regenerate
              </Button>
              <div className="flex items-center gap-3">
                <Button
    variant="secondary"
    size="medium"
    leftIcon={<X className="w-4 h-4" />}
    onClick={handleDiscard}
  >

                  Discard
                </Button>
                <Button
    variant="primary"
    size="medium"
    leftIcon={<Send className="w-4 h-4" />}
    onClick={handleSend}
  >

                  Send Argument
                </Button>
              </div>
            </div>
          </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map(
    (option) => <div
      key={option.id}
      onClick={() => handleStrategyClick(option)}
      className={`cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
    >

                <Card
      className={`h-full border-2 border-slate-200 ${getBorderColor(option.type)}`}
    >

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                          {getIcon(option.type)}
                        </div>
                        <span className="font-bold text-slate-900">
                          {option.title}
                        </span>
                      </div>
                      <span
      className={`text-xs px-2 py-1 rounded font-mono ${option.riskLevel === "High" ? "bg-red-100 text-red-700" : option.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
    >

                        {option.riskLevel} Risk
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 h-10">
                      {option.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Logic: {option.logicScore}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Rhetoric: {option.rhetoricScore}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
  )}
          </div>}
      </div>
    </div>;
}
export {
  DirectorChoice
};
