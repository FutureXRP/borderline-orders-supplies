import { GameState, Unit } from './types';
import { SeededRNG } from './rng';
import { UNIT_STATS } from './constants';

function terrainDefenseBonus(terrain: string) {
  switch (terrain) {
    case 'forest':
      return 2;
    case 'mountain':
      return 4;
    case 'city':
      return 3;
    default:
      return 0;
  }
}

function supplyModifier(supply: number) {
  if (supply < 3) return 0.5;
  if (supply < 6) return 0.8;
  return 1;
}

export function resolveCombat(
  attacker: Unit,
  defender: Unit,
  attackerTileTerrain: string,
  defenderTileTerrain: string,
  rng: SeededRNG
) {
  const aStats = UNIT_STATS[attacker.type];
  const dStats = UNIT_STATS[defender.type];

  const attackPower =
    aStats.attack * supplyModifier(attacker.currentSupply) + rng.int(4);
  const defendPower =
    dStats.defense +
    terrainDefenseBonus(defenderTileTerrain) *
      supplyModifier(defender.currentSupply) +
    rng.int(4);

  const damageToDefender = Math.max(1, Math.floor(attackPower - defendPower / 2));
  const damageToAttacker = Math.max(0, Math.floor(defendPower / 2 - attackPower / 3));

  defender.hp -= damageToDefender;
  attacker.hp -= damageToAttacker;
}
