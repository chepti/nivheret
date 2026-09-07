import { useStore } from "../app/store";
import type { Pair } from "../lib/leadership";

export function PairDoneCheck({ pair, label }: { pair: Pair; label?: string }) {
  const { upsertPair } = useStore();
  const text = label ?? (pair.done ? "בוצע ✓" : "סמנו שבוצע");
  return (
    <label className="check-row pair-done">
      <input
        type="checkbox"
        checked={pair.done}
        onChange={() =>
          upsertPair({
            id: pair.id,
            capabilityId: pair.capabilityId,
            learnerId: pair.learnerId,
            mentorId: pair.mentorId,
            done: !pair.done,
          })
        }
      />
      {text}
    </label>
  );
}
