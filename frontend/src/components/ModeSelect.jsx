import { Swords, GraduationCap, Clock, Sparkles, ArrowRight, History, BookOpen, Briefcase, Stethoscope } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";
import { MODE_OPTIONS } from "../data/mockData";
import { getModePalette } from "../data/modePalette";

// ModeSelect is the entry screen for choosing the debate experience type.
function ModeSelect({ onSelectMode, onOpenHistory }) {
  // Convert configured icon keys into rendered Lucide icons.
  const getIcon = (iconName, colorClass) => {
    switch (iconName) {
      case "Swords":
        return <Swords className={`w-8 h-8 ${colorClass}`} />;
      case "GraduationCap":
        return <GraduationCap className={`w-8 h-8 ${colorClass}`} />;
      case "Clock":
        return <Clock className={`w-8 h-8 ${colorClass}`} />;
      case "Sparkles":
        return <Sparkles className={`w-8 h-8 ${colorClass}`} />;
      case "BookOpen":
        return <BookOpen className={`w-8 h-8 ${colorClass}`} />;
      case "Briefcase":
        return <Briefcase className={`w-8 h-8 ${colorClass}`} />;
      case "Stethoscope":
        return <Stethoscope className={`w-8 h-8 ${colorClass}`} />;
      default:
        return <Swords className={`w-8 h-8 ${colorClass}`} />;
    }
  };
  return <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white dark:text-slate-900 font-bold font-mono text-2xl">AI</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">AI COUNCIL</h1>
        <p className="text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
          Choose Your Experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl w-full">
        {MODE_OPTIONS.map((mode) => {
          const palette = getModePalette(mode.id);
          return (
            <Card
              key={mode.id}
              className={`hover:-translate-y-2 transition-all duration-300 border-2 border-dashed ${palette.card} hover:shadow-lg`}
            >
            <CardHeader className="pb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${palette.iconSurface}`}>
                {getIcon(mode.icon, palette.icon)}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode.title}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 dark:text-slate-400 min-h-[3rem]">{mode.description}</p>

              <div className="space-y-2">
                {mode.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-mono"
                  >
                    <div className={`w-1.5 h-1.5 ${palette.dot} rounded-full`} />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <Button
                className={`w-full border-0 ${palette.button}`}
                size="large"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onSelectMode(mode.id)}
              >
                Select Mode
              </Button>
            </CardFooter>
          </Card>
          );
        })}
      </div>

      {onOpenHistory ? (
        <div className="mt-8">
          <Button
            variant="secondary"
            size="large"
            leftIcon={<History className="w-4 h-4" />}
            onClick={onOpenHistory}
          >
            Past Discussions
          </Button>
        </div>
      ) : null}
    </div>;
}
export {
  ModeSelect
};
