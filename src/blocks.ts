// Implementation notes:
//
// - The game board is implemented as a 20x20 matrix. Each cell contains a
//   number 0-4, with 0 indicating "free" and 1-4 indicating which player
//   has occupied that cell.
//
// - Each player keeps track of their pieces remaining and the sequences of
//   moves they have made so far.

class Matrix {
  private matrix: number[][];

  constructor(m: number, n: number) {
    this.matrix = [];

    for (let i = 0; i < m; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        row.push(0);
      }
      this.matrix.push(row);
    }
  }

  Get(m: number, n: number): number {
    return this.matrix[m][n];
  }

  Set(m: number, n: number, val: number) {
    this.matrix[m][n] = val;
  }

  get M(): number {
    return this.matrix.length;
  }

  get N(): number {
    return this.matrix[0].length;
  }
}

const kMaxPieces = 21;

export class Player {
  moves: Matrix[];
  pieces: Matrix[];

  constructor() {
    this.moves = [];
    this.pieces = [];
  }
}

export class GameState {
  board: Matrix;
  players: Array<Player|null>;

  constructor() {
    this.board = new Matrix(20, 20);
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

// The ES6 Set type uses === to compare objects, so it doesn't consider
// [4, 4] and [4, 4] to be the same. Blergh.
export class CoordSet {
  private data: { [key: string]: Coord };

  constructor(...data: Coord[]) {
    this.data = {};
    for (const x of data) {
      this.Add(x);
    }
  }

  Size(): number {
    return this.Values().length;
  }

  Add(x: Coord) {
    this.data[x.toString()] = x;
  }

  Has(x: Coord): boolean {
    return this.data[x.toString()] !== undefined;
  }

  Values(): Coord[] {
    return Object.values(this.data);
  }

  Difference(t: CoordSet): CoordSet {
    const diff = new CoordSet();
    for (const x of this.Values()) {
      if (!t.Has(x)) {
        diff.Add(x);
      }
    }
    return diff;
  }

  *[Symbol.iterator]() {
    for (const x of this.Values()) {
      yield x;
    }
  }

  toString(): string {
    return Array.from(this.Values()).join(", ");
  }
}

// In order to make decisions about their next moves, players need to know
// which squares are open starting points and which squares are taken or
// otherwise invalid.
//
// Coordinates are guaranteed to be in-range on the game board.
class PlayerInputs {
  startPoints: CoordSet;
  exclude: CoordSet;

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