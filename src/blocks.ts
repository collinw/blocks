// Implementation notes:
//
// - The game board is implemented as a 20x20 matrix. Each cell contains a
//   number 0-4, with 0 indicating "free" and 1-4 indicating which player
//   has occupied that cell.
//
// - Each player keeps track of their pieces remaining and the sequences of
//   moves they have made so far.

import * as pieces from './pieces';
import * as util from './util';

export class GiveUp {}

export class Move {
  // A reference to the specific piece being placed on the board. Used to
  // manage player state (e.g., which pieces have been used).
  piece: pieces.Piece;
  // The specific set of cells we want to occupy with this piece.
  cells: CoordSet;

  constructor(piece: pieces.Piece, cells: CoordSet) {
    this.piece = piece;
    this.cells = cells;
  }
}

export interface Agent {
  MakeMove(inputs: PlayerInputs, ps: pieces.Piece[]): Move|GiveUp;
}

export class Player {
  id: number;
  agent: Agent;
  moves: util.Matrix[];
  pieces: pieces.Piece[];
  stillPlaying: boolean;

  constructor(id: number, agent: Agent, ps: pieces.Piece[]) {
    this.id = id;
    this.agent = agent;
    this.pieces = ps;
    this.moves = [];
    this.stillPlaying = true;
  }

  MakeMove(inputs: PlayerInputs): Move|GiveUp {
    return this.agent.MakeMove(inputs, this.pieces);
  }
}

export class GameState {
  board: util.Matrix;
  players: Player[];

  constructor(players: Player[]) {
    this.board = util.Matrix.Zero(20, 20);
    this.players = players;
  }

  ApplyMove(player: Player, move: Move) {
    const idx = player.pieces.indexOf(move.piece);
    if (idx === -1) {
      throw new Error('Piece is not present in the list!');
    }
    player.pieces.splice(idx, 1);

    for (const cell of move.cells) {
      this.board.Set(cell[0], cell[1], player.id);
    }
  }

  GiveUp(player: Player) {
    player.stillPlaying = false;
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

export function GetValidCoords(x: Iterable<Coord>): CoordSet {
  const valid = new CoordSet();
  for (const coord of x) {
    if (coord[0] < 0 || coord[0] >= 20) {
      continue;
    }
    if (coord[1] < 0 || coord[1] >= 20) {
      continue;
    }
    valid.Add(coord);
  }
  return valid;
}

// In order to make decisions about their next moves, players need to know
// which squares are open starting points and which squares are taken or
// otherwise invalid.
//
// Coordinates are guaranteed to be in-range on the game board.
export class PlayerInputs {
  readonly startPoints: CoordSet;
  readonly exclude: CoordSet;

  constructor(startPoints: CoordSet, exclude: CoordSet) {
    this.startPoints = startPoints;
    this.exclude = exclude;
  }

  // Helper method to figure out if a proposed move is valid.
  // - All cells in the proposed move must be on the board.
  // - All cells in the proposed move must not be illegal.
  ValidateMove(cells: CoordSet): string|null {
    const inRange = GetValidCoords(cells);
    if (inRange.Size() !== cells.Size()) {
      return 'Coordinates fall off the board';
    }
    if (cells.Intersection(this.exclude).Size() > 0) {
      return 'Coordinates are illegal';
    }
    return null;
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

  return new PlayerInputs(GetValidCoords(startPoints), GetValidCoords(exclude));
}