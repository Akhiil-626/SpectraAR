import { ModuleId } from './modules';

export type { ModuleId };

export interface Marker {
  id: string;
  module: ModuleId;
  name: string;
  image: string;
}

const MARKERS: Marker[] = [
  // Chemistry (5 markers)
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
  {
    id: 'CHE-04',
    module: 'chemistry',
    name: 'Hydrogen 1',
    image: '/markers/chemistry/h1.jpeg',
  },
  {
    id: 'CHE-05',
    module: 'chemistry',
    name: 'Hydrogen 2',
    image: '/markers/chemistry/h2.jpeg',
  },

  // Physics (1 marker)
  {
    id: 'PHY-01',
    module: 'physics',
    name: 'Kinematics',
    image: '/markers/physics/kinematics.jpeg',
  },

  // Ray Optics (3 lenses)
  {
    id: 'OPT-01',
    module: 'optics',
    name: 'Lens',
    image: '/markers/optics/lens.jpeg',
  },
  {
    id: 'OPT-02',
    module: 'optics',
    name: 'Laser',
    image: '/markers/optics/laser.jpeg',
  },
  

  // Pendulum (1 marker)
  {
    id: 'PEN-01',
    module: 'pendulum',
    name: 'Simple Pendulum',
    image: '/markers/pendulum/pen.jpeg',
  },

  // Biology (6 markers)
  
  {
    id: 'BIO-01',
    module: 'biology',
    name: 'cell',
    image: '/markers/biology/cell.jpeg',
  },
  {
    id: 'BIO-02',
    module: 'biology',
    name: 'DNA',
    image: '/markers/biology/DNA.jpeg',
  },
  {
    id: 'BIO-03',
    module: 'biology',
    name: 'Helicase',
    image: '/markers/biology/Helicase.jpeg',
  },


  // Magnetism (4 markers)
  {
    id: 'MAG-01',
    module: 'magnetism',
    name: 'Bar Magnet A',
    image: '/markers/magnetism/magA.jpeg',
  },
  {
    id: 'MAG-02',
    module: 'magnetism',
    name: 'Bar Magnet B',
    image: '/markers/magnetism/magB.jpeg',
  },
 
];

export const getMarkersByModule = (moduleId: ModuleId): Marker[] => {
  return MARKERS.filter((m) => m.module === moduleId);
};

export const getMarkerCountByModule = (moduleId: ModuleId): number => {
  return MARKERS.filter((m) => m.module === moduleId).length;
};
