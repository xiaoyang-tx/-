export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface DualPosition {
  chaos: [number, number, number];
  target: [number, number, number];
}

export interface OrnamentData {
  id: number;
  positions: DualPosition;
  color: string;
  scale: number;
  type: 'GIFT' | 'BALL' | 'LIGHT';
  speedOffset: number; // Randomize individual speed slightly
}
