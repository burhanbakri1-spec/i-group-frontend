/**
 * lib/showcase/registry.ts — Unit type → component map.
 * All showcase unit components register themselves here.
 * REQ-C3-1, REQ-C3-2
 */

import type { ReactNode } from 'react';
import type { NormalizedShowcaseUnit, ShowcaseUnitType } from '../../types/showcase-units';

export type UnitComponentProps<P = unknown> = {
  unit: NormalizedShowcaseUnit<P>;
  lang?: 'en' | 'ar';
  shouldReduceMotion: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnitComponent = (...args: any[]) => any;

const registry = new Map<ShowcaseUnitType, UnitComponent>();

export function registerUnit<T extends ShowcaseUnitType>(
  type: T,
  component: UnitComponent,
): void {
  registry.set(type, component);
}

export function getUnitComponent(type: ShowcaseUnitType): UnitComponent | undefined {
  return registry.get(type);
}

export function getRegisteredTypes(): ShowcaseUnitType[] {
  return Array.from(registry.keys());
}

export function isRegistered(type: string): type is ShowcaseUnitType {
  return registry.has(type as ShowcaseUnitType);
}
