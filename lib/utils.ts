import { INDICATOR_DEFINITIONS } from "@/lib/constants";
import { IndicatorState } from "@/types/indicator";

/** Minimal className joiner — avoids pulling in a dependency for this alone. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Builds the initial indicator toggle state from the indicator catalogue. */
export function getDefaultIndicatorState(): IndicatorState {
  return INDICATOR_DEFINITIONS.reduce((state, def) => {
    state[def.id] = def.defaultEnabled;
    return state;
  }, {} as IndicatorState);
}
