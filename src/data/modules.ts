export type ModuleId =
  | 'chemistry'
  | 'physics'
  | 'optics'
  | 'pendulum'
  | 'biology'
  | 'magnetism';

export interface ModuleConfig {
  id: ModuleId;
  code: string;
  name: string;
  slots: 1 | 2;
  path: string;
}

export const MODULES: readonly ModuleConfig[] = [
  {
    id: 'chemistry',
    code: 'CHE',
    name: 'Chemistry',
    slots: 2,
    path: '/chemistry',
  },
  {
    id: 'physics',
    code: 'PHY',
    name: 'Physics',
    slots: 1,
    path: '/physics',
  },
  {
    id: 'optics',
    code: 'OPT',
    name: 'Ray Optics',
    slots: 2,
    path: '/optics',
  },
  {
    id: 'pendulum',
    code: 'PEN',
    name: 'Pendulum',
    slots: 1,
    path: '/pendulum',
  },
  {
    id: 'biology',
    code: 'BIO',
    name: 'Biology',
    slots: 2,
    path: '/biology',
  },
  {
    id: 'magnetism',
    code: 'MAG',
    name: 'Magnetism',
    slots: 2,
    path: '/magnetism',
  },
] as const;

export const getModuleById = (id: ModuleId): ModuleConfig => {
  const found = MODULES.find((m) => m.id === id);
  if (!found) throw new Error(`Module with id "${id}" not found.`);
  return found;
};

export const getSlotStorageKey = (moduleId: ModuleId, slotIndex: number): string => {
  return `spectraar-slot-${moduleId}-${slotIndex}`;
};

export const getHeroMarqueeText = (): string => {
  return `${MODULES.map((m) => m.code).join(' / ')} / MARKER / SCAN \u00A0\u00A0\u2014\u00A0\u00A0 `;
};
