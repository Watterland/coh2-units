import type { Faction } from '../types';

const FILES: Record<Faction, string> = {
  USF: '/factions/usf.png',
  British: '/factions/british.png',
  Ostheer: '/factions/ostheer.png',
  Soviet: '/factions/soviet.png',
  OKW: '/factions/okw.png',
};

export default function FactionEmblem({
  faction,
  className,
}: {
  faction: Faction;
  className?: string;
}) {
  return <img src={FILES[faction]} alt={faction} className={className} draggable={false} />;
}
