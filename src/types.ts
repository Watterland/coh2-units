export type Faction = 'USF' | 'British' | 'Ostheer' | 'Soviet' | 'OKW';

export type Category = 'Infantry' | 'Team weapons' | 'Vehicles';

export interface NearMidFar {
  near: number;
  mid: number;
  far: number;
}

export interface VetStats {
  target_size: number | null;
  sight: number | null;
  speed: number | null;
  accel: number | null;
  rotate: number | null;
  front_armor: number | null;
  rear_armor: number | null;
  health: number | null;
  population: number | null;
  num_entities: number;
}

export interface Weapon {
  name: string | null;
  accuracy?: NearMidFar;
  aim?: Record<string, unknown>;
  area_effect?: Record<string, unknown>;
  burst?: Record<string, unknown>;
  cooldown?: Record<string, unknown>;
  cover_table?: Record<string, unknown>;
  damage?: NearMidFar | { min: number; max: number };
  deflection?: Record<string, unknown>;
  fire?: Record<string, unknown>;
  flinch_radius?: number;
  moving?: Record<string, unknown>;
  range?: NearMidFar | { min: number; max: number; distance?: NearMidFar };
  reload?: Record<string, unknown>;
  scatter?: Record<string, unknown>;
  suppression?: NearMidFar | { amount: number };
  tracking?: Record<string, unknown>;
  penetration?: NearMidFar;
  target_type_table?: Record<string, unknown>;
  hasprojectile?: boolean;
  hardpoint?: number | string | null;
  count?: number;
}

export interface Unit {
  index: number;
  faction: Faction;
  category: Category;
  name: string;
  id: string | null;
  population: number | null;
  mainWeaponIndex: number | null;
  vetStats: (VetStats | null)[];
  weapons: Weapon[];
  entityNames: string[];
  imageUrl?: string;
  cost?: UnitCost;
  build?: UnitBuild;
  description?: string;
}

export type UnitLite = Omit<Unit, 'vetStats' | 'weapons' | 'entityNames'> & {
  entityCount: number;
};

export interface UnitCost {
  manpower?: number;
  munitions?: number;
  fuel?: number;
  population?: number;
}

export interface UnitBuild {
  role?: string;
  prerequisite?: string;
  structure?: string;
  reinforce?: string;
  upkeep?: string;
}

export interface Ability {
  unitIndex: number;
  name: string;
  description: string;
  icon?: string;
  type?: 'active' | 'passive';
  cost?: {
    manpower?: number;
    munitions?: number;
    fuel?: number;
  };
}

export interface DoctrineAbility {
  id?: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Doctrine {
  faction: Faction;
  name: string;
  description: string;
  abilities: DoctrineAbility[];
}

export interface UnitsData {
  meta: {
    source: string;
    note: string;
    factions: Faction[];
    generatedAt: string;
  };
  factions: Faction[];
  units: Unit[];
}
