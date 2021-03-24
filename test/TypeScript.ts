import { Players } from '../models/Players';
import items from '../game/data/items.json';

export default class Mechanics {
  public player: Players;
  public monster: Monsters;

  public constructor(player: Players, monster: Monsters) {
    this.player = player;
    this.monster = monster;
  }

  private defense(): number {
    const addedDef = this.calculateAddedDef();
    return Math.floor(1.5 * this.player.attributs.str + 0.4 * (this.player.attributs.dex + this.player.attributs.int) + addedDef);
  }

  private calculateAddedDef(): number {
    const helm = items.find(e => e.name == this.player.gear.helm);
    const chest = items.find(e => e.name == this.player.gear.chest);
    const legs = items.find(e => e.name == this.player.gear.legs);
    const boots = items.find(e => e.name == this.player.gear.boots);
    const addedDef = helm?.armor! + chest?.armor! + legs?.armor! + boots?.armor!;
    return addedDef;
  }

  public monsterAttack(): number {
    const ratios = this.calculateratioOnLevelDifference();
    const totalPlayerDef = this.defense();
    const monsterMinAttack = Math.floor(ratios.monsterAttackRatio * (0.85 * this.monster.att - (ratios.playerDefRatio * totalPlayerDef)));
    const monsterMaxAttack = Math.floor(ratios.monsterAttackRatio * (this.monster.att - (ratios.playerDefRatio * totalPlayerDef)));
    const monsterAttackRange = this.generateRangeFromArray(monsterMinAttack, monsterMaxAttack);
    console.log(monsterAttackRange);
    return monsterAttackRange[Math.floor(Math.random() * monsterAttackRange.length)];
  }

  private calculateratioOnLevelDifference(): Ratios {
    let playerDefRatio: number = 0.55;
    let monsterAttackRatio: number = 0.85;
    const levelDifference: number = this.player.level - this.monster!.level;

    switch(levelDifference) {
      case 5: {
        playerDefRatio= 0.8;
        monsterAttackRatio = 0.775;
        break;
      }
      case 4: {
        playerDefRatio = 0.75;
        monsterAttackRatio = 0.79;
        break;
      }
      case 3: {
        playerDefRatio = 0.7;
        monsterAttackRatio = 0.805;
        break;
      }
      case 2: {
        playerDefRatio = 0.65;
        monsterAttackRatio = 0.82;
        break;
      }
      case 1: {
        playerDefRatio = 0.6;
        monsterAttackRatio = 0.835;
        break;
      }
      case 0: {
        playerDefRatio = 0.55;
        monsterAttackRatio = 0.85;
        break;
      }
      case -1: {
        playerDefRatio = 0.5;
        monsterAttackRatio = 0.8575;
        break;
      }
      case -2: {
        playerDefRatio = 0.45;
        monsterAttackRatio = 0.865;
        break;
      }
      case -3: {
        playerDefRatio = 0.4;
        monsterAttackRatio = 0.8725;
        break;
      }
      case -4: {
        playerDefRatio = 0.35;
        monsterAttackRatio = 0.88;
        break;
      }
      case -5: {
        playerDefRatio = 0.3;
        monsterAttackRatio = 0.9;
        break;
      }
      default: {
        break;
      }
    }

    return { playerDefRatio, monsterAttackRatio };
  }

  private generateRangeFromArray(start: number, stop: number, step: number = 1): number[] {
    return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
  }
}

export interface Ratios {
  playerDefRatio: number,
  monsterAttackRatio: number
}

export interface Monsters {
  name: string,
  hp: number,
  att: number,
  pdr: number,
  mdr: number,
  description: string,
  level: number
}