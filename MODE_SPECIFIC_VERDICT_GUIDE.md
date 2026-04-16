# Mode-Specific Verdict Implementation Guide

## Overview
The AI Council now supports **mode-specific verdict generation and reporting** for 7 different modes, each with customized analysis tailored to the purpose of that mode.

## Architecture

### Backend Changes (combat.service.js)
- **7 Mode-Specific Verdict Functions**:
  - `finalizeCombatVerdict()` - Standard debate with winner/scores/analysis
  - `finalizeMentorVerdict()` - Mentor feedback with strengths/improvements/advice
  - `finalizeInterviewVerdict()` - Interview prep feedback with readiness score
  - `finalizeMedicalVerdict()` - Medical analysis with diagnosis/urgency/first aid
  - `finalizeLawVerdict()` - Legal analysis with case law and balanced conclusion
  - `finalizeHistoricalVerdict()` - Historical synthesis with figure perspectives
  - `finalizeFantasyVerdict()` - Fictional world analysis with character perspectives

- **Helper Function**:
  - `extractArgumentsBySide()` - Separates player and opponent arguments from combatLog

### Frontend Changes

#### 1. **ArgumentsView Component** (`ArgumentsView.jsx`)
Displays all debate arguments organized by round.

**Props**:
- `combatLog` (array) - Raw debate transcript
- `playerTeam` (array) - Player team members
- `opponentTeam` (array) - Opponent team members
- `topic` (string) - Debate topic

**Features**:
- Shows topic at top
- Expandable round sections
- Side-by-side argument display (player vs opponent)
- Speaker attribution for each argument

**Example Usage**:
```jsx
<ArgumentsView 
  combatLog={gameState.combatLog}
  playerTeam={gameState.playerTeam}
  opponentTeam={gameState.opponentTeam}
  topic={gameState.topic}
/>
```

#### 2. **VerdictReportViewer Component** (`VerdictReportViewer.jsx`)
Displays mode-specific verdict/report based on verdict type.

**Props**:
- `verdict` (object) - The verdict object returned from the backend
- `mode` (string) - Optional, current game mode for reference
- `topic` (string) - Optional, debate topic

**Features**:
- Auto-detects verdict type and renders appropriate report
- 7 different report layouts optimized for each mode
- Dark mode support
- Responsive design

**Example Usage**:
```jsx
<VerdictReportViewer 
  verdict={finalVerdict}
  mode={gameState.mode}
  topic={gameState.topic}
/>
```

## Verdict Response Structure by Mode

### Combat Mode
```json
{
  "type": "combat",
  "winner": "player|opponent|tie",
  "confidence": 0.85,
  "finalScore": { "player": 850, "opponent": 750 },
  "summary": "The player team demonstrated superior argumentation...",
  "keyMoments": ["Round 1: Strong opening statement", "Round 3: Effective rebuttal"],
  "playerStrengths": ["Clear logic", "Strong evidence"],
  "playerWeaknesses": ["Limited counterarguments", "Need more examples"],
  "opponentStrengths": [...],
  "opponentWeaknesses": [...],
  "reasoning": "Based on comprehensive analysis..."
}
```

### Mentor Mode
```json
{
  "type": "mentor",
  "strengths": ["Clear communication", "Good topic understanding"],
  "improvements": ["Need more evidence", "Consider alternative viewpoints"],
  "advices": ["Prepare more examples", "Practice active listening"],
  "conclusion": "Great effort! Continue practicing...",
  "keyTakeaways": ["Topic comprehension", "Argument structure"]
}
```

### Interview Mode
```json
{
  "type": "interview",
  "strengths": ["Professional demeanor", "Good examples"],
  "flaws": ["Lack of confidence", "Vague on details"],
  "technicalAdvice": ["Research company more", "Prepare project examples"],
  "communicationAdvice": ["Speak more slowly", "Ask clarifying questions"],
  "confidenceLevel": "medium",
  "nextSteps": ["Mock interview practice", "Research industry trends"],
  "overallAssessment": "Good foundation. Practice more specific scenarios..."
}
```

### Medical Mode
```json
{
  "type": "medical",
  "temporaryDiagnosis": "Possible viral infection based on symptoms",
  "urgentConcerns": ["High fever", "Severe headache"],
  "immediateActions": ["Rest", "Stay hydrated", "Monitor temperature"],
  "doctorVisitUrgency": "high|medium|low",
  "whenToSeeFully": "As soon as possible",
  "recommendedSpecialists": ["General Practitioner", "Infectious Disease Specialist"],
  "preventiveMeasures": ["Maintain hygiene", "Proper nutrition"],
  "disclaimer": "This is not a substitute for professional medical advice."
}
```

### Law Mode
```json
{
  "type": "law",
  "topic": "Constitutional Rights...",
  "legalAnalysis": "Detailed legal analysis...",
  "argumentsFor": ["Point 1", "Point 2"],
  "argumentsAgainst": ["Counter 1", "Counter 2"],
  "relevantLaws": ["Article 19", "Section 44"],
  "caseReferences": ["Case 1 (Year)", "Case 2 (Year)"],
  "conclusions": "Balanced conclusion considering both sides...",
  "recommendation": "Practical recommendation...",
  "references": ["Source 1", "Source 2"]
}
```

### Historical Mode
```json
{
  "type": "historical",
  "eventSummary": "Overview of the historical event...",
  "keyPerspectives": [
    { "figure": "Abraham Lincoln", "view": "His perspective on the topic", "era": "1860s" },
    { "figure": "Frederick Douglass", "view": "His perspective on the topic", "era": "1860s" }
  ],
  "commonThemes": ["Theme 1", "Theme 2"],
  "divergentViews": ["Disagreement 1", "Disagreement 2"],
  "historicalContext": "Background and significance...",
  "legacyAndImpact": "How this affected history...",
  "conclusions": "Synthesis of all perspectives..."
}
```

### Fantasy Mode
```json
{
  "type": "fantasy",
  "topicOverview": "Summary of topic in fictional context...",
  "characterAnalysis": [
    { "character": "Gandalf", "loreBackground": "Wise wizard from Middle-Earth", "perspective": "His view..." },
    { "character": "Eleserien", "loreBackground": "Elven queen from Silvan realm", "perspective": "Her view..." }
  ],
  "worldbuildingContext": "The fictional world and its context...",
  "consensusAndConflict": "Character agreement and disagreement...",
  "loreImplications": "How this affects fictional world lore...",
  "synthesisReport": "Comprehensive synthesis..."
}
```

## Integration Steps

### 1. Create a Dedicated Verdict Page
Create `VerdictPage.jsx` to show arguments and report in tabs or side-by-side:

```jsx
import ArgumentsView from "./ArgumentsView";
import VerdictReportViewer from "./VerdictReportViewer";

function VerdictPage({ gameState, verdict }) {
  const [activeTab, setActiveTab] = useState("arguments");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "arguments" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("arguments")}
        >
          📋 Arguments
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "report" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("report")}
        >
          📊 Report & Verdict
        </button>
      </div>

      {activeTab === "arguments" && (
        <ArgumentsView
          combatLog={gameState.combatLog}
          playerTeam={gameState.playerTeam}
          opponentTeam={gameState.opponentTeam}
          topic={gameState.topic}
        />
      )}

      {activeTab === "report" && (
        <VerdictReportViewer
          verdict={verdict}
          mode={gameState.mode}
          topic={gameState.topic}
        />
      )}
    </div>
  );
}

export default VerdictPage;
```

### 2. Update App.jsx to Show Verdict Page
```jsx
// After verdict is generated, show it
useEffect(() => {
  if (gameState.finalVerdict) {
    // Show verdict page instead of main game
    // OR show in a modal/panel
  }
}, [gameState.finalVerdict]);
```

### 3. Call Verdict API with Mode
```jsx
// In the verdict export/conclude handler
const verdict = await combatFinalizeVerdict({
  topic: gameState.topic,
  playerTeam: gameState.playerTeam,
  opponentTeam: gameState.opponentTeam,
  combatLog: gameState.combatLog,
  roundResults: roundResults,
  scores: {
    playerScore: gameState.playerScore,
    opponentScore: gameState.opponentScore,
  },
  mode: gameState.mode,  // ← Pass the current mode
});

// Store verdict
setFinalVerdict(verdict);
```

## Mode-Specific Features

### Combat Mode
- **Purpose**: Determine debate winner
- **Key Display**: Winner badge, final scores, strengths/weaknesses
- **Audience**: General debate enthusiasts
- **Report Style**: Competitive/analytical

### Mentor Mode
- **Purpose**: Guide student growth through expert feedback
- **Key Display**: Strengths, improvements, actionable advice, takeaways
- **Audience**: Students seeking learning
- **Report Style**: Encouraging/constructive

### Interview Simulator
- **Purpose**: Prepare candidates for job interviews
- **Key Display**: Readiness level, flaws to fix, interview-specific tips
- **Audience**: Job seekers
- **Report Style**: Professional/goal-oriented

### Medical Consulting
- **Purpose**: Provide preliminary medical guidance
- **Key Display**: Urgency level, first aid steps, when to see doctor
- **Audience**: Patients seeking preliminary advice
- **Report Style**: Safety-focused with disclaimers

**⚠️ IMPORTANT**: Always display medical disclaimer prominently. This is NOT a substitute for professional medical care.

### Learn Law
- **Purpose**: Understand legal topics through expert analysis
- **Key Display**: Legal analysis, supporting/opposing arguments, applicable laws
- **Audience**: Students and law learners
- **Report Style**: Educational/balanced

### Historical Mode
- **Purpose**: Understand historical events through multiple perspectives
- **Key Display**: Event summary, figure perspectives, historical context, legacy
- **Audience**: History students/enthusiasts
- **Report Style**: Analytical/educational

### Fantasy Mode
- **Purpose**: Discuss fictional topics with character accuracy
- **Key Display**: Character perspectives, worldbuilding context, lore implications
- **Audience**: Fantasy fans/creative writers
- **Report Style**: Lore-focused/immersive

## Styling & Customization

Both components use **Tailwind CSS** with:
- Dark mode support (using `dark:` classes)
- Color-coded sections (green=positive, red=warning, blue=info, etc.)
- Responsive grid layouts
- Accessible button states

Customize colors by modifying the className patterns:
```jsx
// Change the success color from green to emerald
className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
```

## Common Integration Patterns

### Pattern 1: Modal/Overlay
```jsx
{showVerdict && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
      <VerdictReportViewer verdict={verdict} mode={gameState.mode} topic={gameState.topic} />
    </div>
  </div>
)}
```

### Pattern 2: Split View
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div className="border-r">
    <h2 className="text-xl font-bold mb-4">Arguments</h2>
    <ArgumentsView {...args} />
  </div>
  <div>
    <h2 className="text-xl font-bold mb-4">Report</h2>
    <VerdictReportViewer verdict={verdict} />
  </div>
</div>
```

### Pattern 3: Tabbed Interface
```jsx
<div>
  <div className="flex border-b">
    {["Arguments", "Report", "Summary"].map(tab => (
      <button key={tab} onClick={() => setTab(tab)}
        className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}>
        {tab}
      </button>
    ))}
  </div>
  <div className="p-4">
    {activeTab === "Arguments" && <ArgumentsView {...} />}
    {activeTab === "Report" && <VerdictReportViewer {...} />}
  </div>
</div>
```

## Troubleshooting

### "verdict is undefined"
- Ensure the verdict API call completed successfully
- Check that the response includes the `verdict` object
- Verify the `mode` parameter matches one of the 7 supported modes

### "Report doesn't match my mode"
- Verify `verdict.type` matches what you expect
- The type is set automatically by the backend function name
- Check the mode is passed correctly to the verdict endpoint

### "Missing specific fields in Medical verdict"
- Medical mode has different fields than Combat mode
- Check the verdict structure matches the expected format for your mode
- Some fields may be optional (e.g., empty arrays if nothing to show)

### Styling looks off
- Ensure TailwindCSS is properly configured
- Check dark mode is enabled if you need dark mode support
- Verify all Lucide icons are installed

## Next Steps

1. **Integrate into existing pages** - Update LearnLawPage, InterviewSimulatorPage, MedicalConsultingPage, MentorDashboard, etc. to use these components
2. **Add export functionality** - Allow users to download verdicts as PDF/text
3. **Create verdict history** - Store past verdicts for comparison
4. **Add notifications** - Alert users when verdict is ready
5. **Create comparison view** - Compare verdicts across multiple sessions

---

**Last Updated**: April 16, 2026
**Backend File**: `/backend/features/combat/combat.service.js`
**Frontend Components**: `/frontend/src/components/ArgumentsView.jsx`, `/frontend/src/components/VerdictReportViewer.jsx`
