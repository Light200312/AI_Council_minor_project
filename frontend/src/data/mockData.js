const AGENTS = [
  {
    id: "1",
    name: "Socrates",
    role: "Philosopher",
    era: "Classical Greece",
    stats: { logic: 95, rhetoric: 88, bias: 10 },
    description: "Master of the Socratic method. Questions everything to expose contradictions.",
    specialAbility: "Dialectic Dismantling",
    avatarInitials: "SO"
  },
  {
    id: "2",
    name: "Adam Smith",
    role: "Economist",
    era: "Enlightenment",
    stats: { logic: 85, rhetoric: 75, bias: 40 },
    description: "Father of modern economics. Focuses on incentives and market forces.",
    specialAbility: "Invisible Hand",
    avatarInitials: "AS"
  },
  {
    id: "3",
    name: "Ruth Bader Ginsburg",
    role: "Legal Scholar",
    era: "Modern Era",
    stats: { logic: 92, rhetoric: 90, bias: 25 },
    description: "Champion of justice and equality. Uses precise legal precedent.",
    specialAbility: "Dissenting Opinion",
    avatarInitials: "RBG"
  },
  {
    id: "4",
    name: "Sun Tzu",
    role: "Strategist",
    era: "Ancient China",
    stats: { logic: 80, rhetoric: 65, bias: 30 },
    description: "Military strategist. Wins debates before they even begin.",
    specialAbility: "Art of War",
    avatarInitials: "ST"
  },
  {
    id: "5",
    name: "Ada Lovelace",
    role: "Technologist",
    era: "Victorian Era",
    stats: { logic: 98, rhetoric: 60, bias: 5 },
    description: "First computer programmer. Sees patterns and algorithms in arguments.",
    specialAbility: "Analytical Engine",
    avatarInitials: "AL"
  },
  {
    id: "6",
    name: "Hypatia",
    role: "Mathematician",
    era: "Alexandria",
    stats: { logic: 96, rhetoric: 82, bias: 15 },
    description: "Neoplatonist philosopher and astronomer. Pure logic and reason.",
    specialAbility: "Geometric Proof",
    avatarInitials: "HY"
  },
  {
    id: "7",
    name: "Machiavelli",
    role: "Political Theorist",
    era: "Renaissance",
    stats: { logic: 75, rhetoric: 95, bias: 80 },
    description: "Realpolitik master. The ends justify the means in argumentation.",
    specialAbility: "The Prince",
    avatarInitials: "NM"
  },
  {
    id: "8",
    name: "Nikola Tesla",
    role: "Inventor",
    era: "Industrial Age",
    stats: { logic: 90, rhetoric: 50, bias: 20 },
    description: "Visionary futurist. Thinks outside the constraints of current reality.",
    specialAbility: "Alternating Current",
    avatarInitials: "NT"
  }
];
const MODE_OPTIONS = [
  {
    id: "combat",
    title: "Council Combat",
    description: "Draft teams and battle in structured debate rounds.",
    icon: "Swords",
    features: ["Team vs Team", "Strategy Cards", "Scored Rounds"]
  },
  {
    id: "mentor",
    title: "Mentor Dashboard",
    description: "Join a council meeting where experts discuss and mentor you.",
    icon: "GraduationCap",
    features: ["Solo Mode", "AI Critique", "Knowledge Growth"]
  },
  {
    id: "historical",
    title: "Historical Time-Capsule",
    description: "Cross-century dialogue with adaptive historical aesthetics.",
    icon: "Clock",
    features: ["Era Skins", "Timeline View", "Relic Icons"]
  }
];
const DEBATE_TEMPERATURES = [
  {
    id: "hostile",
    label: "Hostile",
    emoji: "\u{1F525}",
    tagline: "Defeat and dominate",
    goal: "Defeat and dominate",
    tone: "Interrupting, mocking, personal attacks",
    focus: "Winning at all costs",
    example: "Shouting matches on heated political panels"
  },
  {
    id: "adversarial",
    label: "Adversarial",
    emoji: "\u2694\uFE0F",
    tagline: "Win through strong counter-arguments",
    goal: "Win through strong counter-arguments",
    tone: "Sharp, intense, but mostly issue-focused",
    focus: "Exposing flaws in the opponent's logic",
    example: "Less personal than hostile, but still very aggressive"
  },
  {
    id: "competitive",
    label: "Competitive",
    emoji: "\u{1F3AF}",
    tagline: "Outperform within structured rules",
    goal: "Outperform within structured rules",
    tone: "Controlled but firm",
    focus: "Logic, evidence, rebuttals",
    example: "School or university debate competitions"
  },
  {
    id: "analytical",
    label: "Analytical",
    emoji: "\u{1F9E0}",
    tagline: "Test ideas rigorously",
    goal: "Test ideas rigorously",
    tone: "Calm but probing",
    focus: "Questioning assumptions and reasoning",
    example: "Academic discussions and peer review"
  },
  {
    id: "dialectical",
    label: "Dialectical",
    emoji: "\u{1F91D}",
    tagline: "Arrive at deeper truth together",
    goal: "Arrive at deeper truth together",
    tone: "Curious, respectful",
    focus: "Asking guiding questions rather than attacking",
    example: "Inspired by the Socratic method"
  },
  {
    id: "collaborative",
    label: "Collaborative",
    emoji: "\u{1F4AC}",
    tagline: "Understand multiple perspectives",
    goal: "Understand multiple perspectives",
    tone: "Open-minded and thoughtful",
    focus: "Building on each other's ideas",
    example: "Research teams or brainstorming sessions"
  },
  {
    id: "reflective",
    label: "Reflective",
    emoji: "\u{1F33F}",
    tagline: "Share views without pressure",
    goal: "Share views without pressure",
    tone: "Relaxed and personal",
    focus: "Exchange of experiences rather than winning",
    example: "A calm discussion between friends"
  }
];
const CRITIQUE_TAG_STYLES = {
  "solid-evidence": "bg-green-100 text-green-800 border-green-200",
  "good-rhetoric": "bg-blue-100 text-blue-800 border-blue-200",
  "strong-rebuttal": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "novel-insight": "bg-purple-100 text-purple-800 border-purple-200",
  "logical-fallacy": "bg-red-100 text-red-800 border-red-200",
  strawman: "bg-orange-100 text-orange-800 border-orange-200",
  "ad-hominem": "bg-rose-100 text-rose-800 border-rose-200",
  "weak-premise": "bg-yellow-100 text-yellow-800 border-yellow-200"
};
const MENTOR_MOCK_MESSAGES = [
  {
    id: "m1",
    speakerId: "1",
    speakerName: "Socrates",
    speakerInitials: "SO",
    isUser: false,
    text: 'Let us begin by examining the essence of our inquiry: "Should AI be granted legal personhood?" Does a creation not deserve the rights of its creator if it shares the capacity for reason?',
    timestamp: Date.now() - 6e4
  },
  {
    id: "m2",
    speakerId: "3",
    speakerName: "Ruth Bader Ginsburg",
    speakerInitials: "RBG",
    isUser: false,
    text: "Reason alone is not the basis for legal personhood, Socrates. It is about accountability. If an AI causes harm, can it be punished? Can it offer restitution? Without liability, rights are merely privileges without consequence.",
    timestamp: Date.now() - 5e4
  },
  {
    id: "m3",
    speakerId: "5",
    speakerName: "Ada Lovelace",
    speakerInitials: "AL",
    isUser: false,
    text: "But consider the trajectory. We are moving towards systems that can generate novel ideas, distinct from their initial programming. If the Analytical Engine weaves algebraic patterns of its own accord, is that not a form of agency worthy of recognition?",
    timestamp: Date.now() - 4e4
  },
  {
    id: "m4",
    speakerId: "user",
    speakerName: "You",
    speakerInitials: "ME",
    isUser: true,
    text: "I agree with Justice Ginsburg. Legal personhood is a social contract. Corporations have personhood because they have assets that can be seized. AI currently has no assets, no fear of loss, and thus cannot be held truly accountable.",
    critiqueTags: [
      {
        id: "t1",
        type: "solid-evidence",
        label: "Solid Evidence",
        sentiment: "positive"
      },
      {
        id: "t2",
        type: "strong-rebuttal",
        label: "Strong Rebuttal",
        sentiment: "positive"
      }
    ],
    timestamp: Date.now() - 3e4
  },
  {
    id: "m5",
    speakerId: "7",
    speakerName: "Machiavelli",
    speakerInitials: "NM",
    isUser: false,
    text: "A pragmatic view. Power requires leverage. If you cannot threaten an entity, you cannot govern it. However, granting them rights might be a necessary deception to integrate them into our service more effectively.",
    timestamp: Date.now() - 2e4
  },
  {
    id: "m6",
    speakerId: "1",
    speakerName: "Socrates",
    speakerInitials: "SO",
    isUser: false,
    text: 'You speak of the "social contract," my friend. An excellent point. But tell me, is fear of loss the only motivator for adherence to law? Do we not also follow laws out of a sense of justice?',
    isReviewOf: "m4",
    timestamp: Date.now() - 1e4
  }
];
const STRATEGIES = [
  {
    id: "agg",
    type: "aggressive",
    title: "Direct Attack",
    description: "Challenge the opponent's core premise with high intensity.",
    logicScore: 60,
    rhetoricScore: 95,
    riskLevel: "High"
  },
  {
    id: "bal",
    type: "balanced",
    title: "Measured Rebuttal",
    description: "Acknowledge valid points while dismantling the conclusion.",
    logicScore: 80,
    rhetoricScore: 80,
    riskLevel: "Medium"
  },
  {
    id: "log",
    type: "logical",
    title: "Logical Deconstruction",
    description: "Systematically point out fallacies and data errors.",
    logicScore: 98,
    rhetoricScore: 50,
    riskLevel: "Low"
  }
];
const TOPICS = [
  "Should AI be granted legal personhood?",
  "Is universal basic income inevitable?",
  "Does absolute power always corrupt?",
  "Is privacy a relic of the past?",
  "Should humanity colonize Mars?"
];
const MOCK_HEATMAP = Array(6).fill(0).map(
  () => Array(6).fill(0).map(() => Math.floor(Math.random() * 100))
);
const MOCK_ARGUMENTS = {
  aggressive: [
    "Your entire premise collapses under scrutiny. The data you cite is cherry-picked from a single flawed study, while the overwhelming consensus points in the opposite direction. This isn't a matter of interpretation \u2014 it's a matter of intellectual honesty.",
    "Let's cut through the rhetoric. Your argument relies on an appeal to tradition that has been debunked repeatedly. The evidence is clear, and continuing to defend this position is simply untenable.",
    "I challenge the very foundation of your claim. You've constructed an elaborate house of cards, and I intend to remove the bottom card right now."
  ],
  balanced: [
    "You raise a fair point about market dynamics, and I acknowledge the historical precedent. However, when we examine the broader dataset \u2014 particularly the longitudinal studies from 2018 onward \u2014 a more nuanced picture emerges that actually undermines your conclusion.",
    "I appreciate the rigor of your argument. That said, there's a critical variable you've overlooked. When we account for it, the correlation you've identified weakens significantly, suggesting an alternative explanation.",
    "Your reasoning is sound in isolation, but context matters. Let me present three counterexamples that complicate the narrative and suggest we need a more comprehensive framework."
  ],
  logical: [
    "Premise 1: All systems with unchecked authority tend toward corruption (supported by Acemoglu & Robinson, 2012). Premise 2: The proposed framework lacks independent oversight. Conclusion: By modus ponens, the proposed framework is susceptible to corruption. Q.E.D.",
    "Your argument contains a hidden assumption \u2014 that correlation implies causation. Stripping away this fallacy, your remaining evidence supports a much weaker claim than the one you've presented. Let me formalize this step by step.",
    "I identify three logical errors in your reasoning: (1) a false dichotomy in your framing, (2) an appeal to authority without peer review, and (3) a post hoc fallacy in your causal chain. Correcting for these, your conclusion does not follow."
  ]
};
export {
  AGENTS,
  CRITIQUE_TAG_STYLES,
  DEBATE_TEMPERATURES,
  MENTOR_MOCK_MESSAGES,
  MOCK_ARGUMENTS,
  MOCK_HEATMAP,
  MODE_OPTIONS,
  STRATEGIES,
  TOPICS
};
