import type { KidActivityType } from "../../../data/kidLessonActivities";

function buildScenarioKey(
  activityType: KidActivityType,
  level: string,
  unit: number,
  lesson: number,
) {
  return `${activityType}:${level}:${unit}:${lesson}`;
}

export function hasKidActivityScenario(
  activityType: KidActivityType,
  level: string,
  unit: number,
  lesson: number,
) {
  const key = buildScenarioKey(activityType, level, unit, lesson);

  switch (key) {
    case "exercise:L0:1:1":
    case "exercise:L0:1:2":
    case "exercise:L0:1:3":
    case "exercise:L0:2:1":
    case "exercise:L0:2:2":
    case "vocab:L0:1:1":
    case "vocab:L0:1:2":
    case "vocab:L0:1:3":
    case "vocab:L0:1:4":
    case "vocab:L0:2:1":
    case "vocab:L0:2:2":
    case "game:L0:1:1":
    case "game:L0:1:2":
    case "game:L0:1:3":
    case "game:L0:1:4":
    case "game:L0:2:1":
    case "game:L0:2:2":
      return true;
    default:
      return false;
  }
}

export { buildScenarioKey };
