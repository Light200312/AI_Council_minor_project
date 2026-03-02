import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
function PersonaEditor({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [desc, setDesc] = useState("");
  return <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <h2 className="text-xl font-bold text-slate-900">
          Create Custom Agent
        </h2>
        <p className="text-sm text-slate-500">
          Design a new persona to join your council.
        </p>
      </DialogHeader>
      <DialogContent className="space-y-4 py-4">
        <Input
    label="Agent Name"
    placeholder="e.g. Neo, The Oracle"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />


        <Select
    label="Archetype"
    options={[
      {
        value: "philosopher",
        label: "Philosopher"
      },
      {
        value: "scientist",
        label: "Scientist"
      },
      {
        value: "artist",
        label: "Artist"
      },
      {
        value: "warrior",
        label: "Warrior"
      }
    ]}
    value={role}
    onChange={(val) => setRole(val)}
  />


        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Personality Description
          </label>
          <textarea
    className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm"
    placeholder="Describe how this agent thinks and argues..."
    value={desc}
    onChange={(e) => setDesc(e.target.value)}
  />

        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Logic (0-100)" type="number" placeholder="50" />
          <Input label="Rhetoric (0-100)" type="number" placeholder="50" />
          <Input label="Bias (0-100)" type="number" placeholder="50" />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
    onClick={() => {
      onSave({
        name,
        role,
        description: desc
      });
      onClose();
    }}
  >

          Create Agent
        </Button>
      </DialogFooter>
    </Dialog>;
}
export {
  PersonaEditor
};
