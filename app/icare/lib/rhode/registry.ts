/**
 * lib/rhode/registry.ts — Unit type → component map.
 * All showcase unit components register themselves here.
 * REQ-C3-1, REQ-C3-2
 */

import type { ComponentType } from 'react';
import type { RhodeShowcaseUnitType, NormalizedRhodeUnit } from '../../types/rhode-showcase-units';

export type UnitComponentProps<P = unknown> = {
  unit: NormalizedRhodeUnit<P>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnitComponent = ComponentType<UnitComponentProps<any>>;

const registry = new Map<RhodeShowcaseUnitType, UnitComponent>();

export function registerUnit<T extends RhodeShowcaseUnitType>(
  type: T,
  component: UnitComponent,
): void {
  registry.set(type, component);
}

export function getUnitComponent(type: RhodeShowcaseUnitType): UnitComponent | undefined {
  return registry.get(type);
}

export function getRegisteredTypes(): RhodeShowcaseUnitType[] {
  return Array.from(registry.keys());
}

export function isRegistered(type: string): type is RhodeShowcaseUnitType {
  return registry.has(type as RhodeShowcaseUnitType);
}
