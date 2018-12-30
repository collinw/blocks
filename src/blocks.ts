// Implementation notes:
//
// - The game board is implemented as a 20x20 matrix. Each cell contains a
//   number 0-4, with 0 indicating "free" and 1-4 indicating which player
//   has occupied that cell.
//
// - Each player keeps track of their pieces remaining and the sequences of
//   moves they have made so far.

import * as util from './util';

const kMaxPieces = 21;

export class Player {
  moves: util.Matrix[];
  pieces: util.Matrix[];

  constructor() {
    this.moves = [];
    this.pieces = [];
  }
}

export class GameState {
  board: util.Matrix;
  players: Array<Player|null>;

  constructor() {
    this.board = new util.Matrix(20, 20);
    // The leading null allows us to look up Player objects by ID.
    this.players = [null, new Player(), new Player(), new Player(), new Player()];
  }

  GetValidCoords(x: Iterable<Coord>): CoordSet {
    const valid = new CoordSet();
    for (const coord of x) {
      if (coord[0] < 0 || coord[0] >= this.board.M) {
        continue;
      }
      if (coord[1] < 0 || coord[1] >= this.board.N) {
        continue;
      }
      valid.Add(coord);
    }
    return valid;
  }
}

type Scores = {
  [id: number]: number;
};

// TODO: implement "placed all your pieces" and "played single square last"
// scoring.
export function GetScores(state: GameState): Scores {
  const scores: Scores = {1: 0, 2: 0, 3: 0, 4: 0};

  for (let m = 0; m < state.board.M; m++) {
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      if (val > 0) {
        scores[val]++;
      }
    }
  }
  return scores;
}

// Coords are (m, n) coordinate pairs.
export type Coord = [number, number];

// A set of Coord objects.
export class CoordSet extends util.DeepSet<Coord> {
  constructor(...data: Coord[]) {
    super(data);
  }
}

// In order to make decisions about their next moves, players need to know
// which squares are open starting points and which squares are taken or
// otherwise invalid.
//
// Coordinates are guaranteed to be in-range on the game board.
class PlayerInputs {
  readonly startPoints: CoordSet;
  readonly exclude: CoordSet;

  constructor(startPoints: CoordSet, exclude: CoordSet) {
    this.startPoints = startPoints;
    this.exclude = exclude;
  }
}

export function GetPlayerInputs(state: GameState, player: number): PlayerInputs {
  const valid = new CoordSet();
  const exclude = new CoordSet();

  for (let m = 0; m < state.board.M; m++) {
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      if (val === 0) {
        // Ignore any empty cells.
        continue;
      } else if (val === player) {
        // Squares directly touching the current square are off limits.
        exclude.Add([m, n + 1]);
        exclude.Add([m, n - 1]);
        exclude.Add([m - 1, n]);
        exclude.Add([m + 1, n]);
        // Squares touching the corners are potential starting points.
        valid.Add([m + 1, n + 1]);
        valid.Add([m + 1, n - 1]);
        valid.Add([m - 1, n + 1]);
        valid.Add([m - 1, n - 1]);
      }
      // If the current square is taken, we cannot place a piece there.
      exclude.Add([m, n]);
    }
  }
  const startPoints = valid.Difference(exclude);

  return new PlayerInputs(state.GetValidCoords(startPoints), state.GetValidCoords(exclude));
}