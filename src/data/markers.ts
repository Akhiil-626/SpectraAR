export type ModuleId = 'chemistry' | 'physics' | 'optics';

export interface Marker {
  id: string;
  module: ModuleId;
  name: string;
  image: string;
}

const MARKERS: Marker[] = [
  // Chemistry (8 markers)
  {
    id: 'CHE-01',
    module: 'chemistry',
    name: 'Na (Sodium)',
    image: '/markers/chemistry/Na.jpeg',
  },
  {
    id: 'CHE-02',
    module: 'chemistry',
    name: 'Cl (Chlorine)',
    image: '/markers/chemistry/Cl.jpeg',
  },
  {
    id: 'CHE-03',
    module: 'chemistry',
    name: 'O2 (Oxygen)',
    image: '/markers/chemistry/o2.jpeg',
  },
  // Physics (1 marker)
  {
    id: 'PHY-01',
    module: 'physics',
    name: 'Kinematics',
    image: '/markers/physics/kinematics.jpeg',
  },

  // Ray Optics (3 lenses only - laser and mirror are rendered by Unity AR app)
  {
    id: 'OPT-01',
    module: 'optics',
    name: 'Lens',
    image: '/markers/optics/lens.jpeg',
  },
  {
    id: 'OPT-02',
    module: 'optics',
    name: 'Convex 20 cm',
    image: '/markers/optics/convex-20cm.png',
  },
  {
    id: 'OPT-03',
    module: 'optics',
    name: 'Concave',
    image: '/markers/optics/concave.png',
  },
];

export const getMarkersByModule = (moduleId: ModuleId): Marker[] => {
  return MARKERS.filter((m) => m.module === moduleId);
};

export const getMarkerCountByModule = (moduleId: ModuleId): number => {
  return MARKERS.filter((m) => m.module === moduleId).length;
};
