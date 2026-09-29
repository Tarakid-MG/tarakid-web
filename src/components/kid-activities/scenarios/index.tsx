import { KidExerciseL0U1L1 } from "./exercise/KidExerciseL0U1L1";
import { KidExerciseL0U1L2 } from "./exercise/KidExerciseL0U1L2";
import { KidExerciseL0U1L3 } from "./exercise/KidExerciseL0U1L3";
import { KidExerciseL0U2L1 } from "./exercise/KidExerciseL0U2L1";
import { KidExerciseL0U2L2 } from "./exercise/KidExerciseL0U2L2";
import { KidGameL0U1L1 } from "./game/KidGameL0U1L1";
import { KidGameL0U1L2 } from "./game/KidGameL0U1L2";
import { KidGameL0U1L3 } from "./game/KidGameL0U1L3";
import { KidGameL0U1Review } from "./game/KidGameL0U1Review";
import { KidGameL0U2L1 } from "./game/KidGameL0U2L1";
import { KidGameL0U2L2 } from "./game/KidGameL0U2L2";
import { buildScenarioKey } from "./scenarioRegistry";
import type { KidActivityScenarioProps } from "./types";
import { KidVocabL0U1L1 } from "./vocab/KidVocabL0U1L1";
import { KidVocabL0U1L2 } from "./vocab/KidVocabL0U1L2";
import { KidVocabL0U1L3 } from "./vocab/KidVocabL0U1L3";
import { KidVocabL0U1Review } from "./vocab/KidVocabL0U1Review";
import { KidVocabL0U2L1 } from "./vocab/KidVocabL0U2L1";
import { KidVocabL0U2L2 } from "./vocab/KidVocabL0U2L2";

interface KidActivityScenarioRendererProps extends KidActivityScenarioProps {
  level: string;
  lesson: number;
  unit: number;
}

export function KidActivityScenarioRenderer({
  activityType,
  level,
  unit,
  lesson,
  ...props
}: KidActivityScenarioRendererProps) {
  const key = buildScenarioKey(activityType, level, unit, lesson);

  switch (key) {
    case "exercise:L0:1:1":
      return <KidExerciseL0U1L1 activityType={activityType} {...props} />;
    case "exercise:L0:1:2":
      return <KidExerciseL0U1L2 activityType={activityType} {...props} />;
    case "exercise:L0:1:3":
      return <KidExerciseL0U1L3 activityType={activityType} {...props} />;
    case "exercise:L0:2:1":
      return <KidExerciseL0U2L1 activityType={activityType} {...props} />;
    case "exercise:L0:2:2":
      return <KidExerciseL0U2L2 activityType={activityType} {...props} />;
    case "vocab:L0:1:1":
      return <KidVocabL0U1L1 activityType={activityType} {...props} />;
    case "vocab:L0:1:2":
      return <KidVocabL0U1L2 activityType={activityType} {...props} />;
    case "vocab:L0:1:3":
      return <KidVocabL0U1L3 activityType={activityType} {...props} />;
    case "vocab:L0:1:4":
      return <KidVocabL0U1Review activityType={activityType} {...props} />;
    case "vocab:L0:2:1":
      return <KidVocabL0U2L1 activityType={activityType} {...props} />;
    case "vocab:L0:2:2":
      return <KidVocabL0U2L2 activityType={activityType} {...props} />;
    case "game:L0:1:1":
      return <KidGameL0U1L1 activityType={activityType} {...props} />;
    case "game:L0:1:2":
      return <KidGameL0U1L2 activityType={activityType} {...props} />;
    case "game:L0:1:3":
      return <KidGameL0U1L3 activityType={activityType} {...props} />;
    case "game:L0:1:4":
      return <KidGameL0U1Review activityType={activityType} {...props} />;
    case "game:L0:2:1":
      return <KidGameL0U2L1 activityType={activityType} {...props} />;
    case "game:L0:2:2":
      return <KidGameL0U2L2 activityType={activityType} {...props} />;
    default:
      return null;
  }
}

export type { KidActivityScenarioProps } from "./types";
