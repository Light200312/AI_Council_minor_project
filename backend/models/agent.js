import mongoose from "mongoose";
//agents are the characters that players can choose to play as in the game. Each agent has unique stats, abilities, and a backstory that adds depth to the game's narrative. The agent model defines the structure of the agent data in the database, including fields for id, name, role, era, stats (logic, rhetoric, bias), description, special ability, avatar initials, and an optional image URL. This model allows for efficient storage and retrieval of agent information for use in the game.
// It will work as ai prompts for the agents to generate their responses in the game. The description field will provide context about the agent's reasoning style and personality traits, which can influence how they respond to different situations in the game. The special ability field can be used to give each agent unique advantages or disadvantages in certain scenarios, adding an extra layer of strategy to the gameplay. The avatar initials and image URL fields can be used to visually represent the agents in the game's user interface.
const agentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    era: { type: String, required: true, trim: true },
    stats: {
      logic: { type: Number, required: true },
      rhetoric: { type: Number, required: true },
      bias: { type: Number, required: true },
    },
    description: { type: String, required: true, trim: true },// mention their resoning style and personality traits in the description
    personalityTraits: { type: String, trim: true, default: "" },
    backstoryLore: { type: String, trim: true, default: "" },
    speechStyle: { type: String, trim: true, default: "" },
    domain: { type: String, trim: true, default: "other" },
    isFantasy: { type: Boolean, default: false },
    sourceTitle: { type: String, trim: true, default: "" },
    sourceType: { type: String, trim: true, default: "" },
    genre: { type: String, trim: true, default: "" },
    specialAbility: { type: String, required: true, trim: true },
    avatarInitials: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdFrom: {
      type: String,
      enum: ["manual", "ai_suggest", "ai_find"],
      default: "manual",
    },
    sourceTopic: { type: String, trim: true },
    sourceNameQuery: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const Agent = mongoose.model("Agent", agentSchema);

export default Agent;
