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
  // Conceptually, this is a set, but an array is faster.
  cells: util.Coord[];

  constructor(piece: pieces.Piece, cells: util.Coord[]) {
    this.piece = piece;
    this.cells = cells;
  }

  IsSingleSquare(): boolean {
    return this.piece.IsSingleSquare();
  }
}

export interface Agent {
  MakeMove(inputs: PlayerInputs, ps: pieces.Piece[]): Move|GiveUp;

  Description(): string;
}

export class Player {
  id: number;
  agent: Agent;
  moves: Move[];
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

export function NewBoard(): util.Matrix {
  return util.Matrix.Zero(20, 20);
}

export class GameState {
  board: util.Matrix;
  players: Player[];

  constructor(players: Player[]) {
    this.board = NewBoard();
    this.players = players;
  }

  ApplyMove(player: Player, move: Move) {
    const idx = player.pieces.indexOf(move.piece);
    if (idx === -1) {
      throw new Error('Piece is not present in the list!');
    }
    player.pieces.splice(idx, 1);
    player.moves.push(move);

    for (const cell of move.cells) {
      this.board.Set(cell[0], cell[1], player.id);
    }
  }

  GiveUp(player: Player) {
    player.stillPlaying = false;
  }
}

// A mapping from player ID to score in a single game.
export class Scores extends util.NumberMap<number> {
}

export function GetScores(state: GameState): Scores {
  const scores = new Scores([[1, 0], [2, 0], [3, 0], [4, 0]]);

  for (let m = 0; m < state.board.M; m++) {
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      if (val > 0) {
        scores.Add(val, 1);
      }
    }
  }

  // You get a bonus for playing all your pieces.
  for (const player of state.players) {
    if (player.pieces.length === 0) {
      scores.Add(player.id, 15);
      // You get a further bonus if the single square was the last piece you played.
      const lastMove = player.moves[player.moves.length - 1];
      if (lastMove.IsSingleSquare()) {
        scores.Add(player.id, 5);
      }
    }
  }
  return scores;
}

// A mapping of player ID to rank number. If there is a tie, multiple players
// may have the same rank.
export class Ranking extends util.NumberMap<number> {
}

export function ScoresToRanking(pScores: Scores): Ranking {
  const scores: Array<[number, number]> = [];
  for (const [playerId, score] of pScores) {
    const score = pScores.Get(playerId);
    scores.push([playerId, score]);
  }
  scores.sort((p1, p2) => p2[1] - p1[1]);

  const ranking = new Ranking();
  let rank = 1;
  let rankScore = -1;
  let tie = 1;
  for (const [playerId, score] of scores) {
    if (score === rankScore) {
      tie++;
    } else if (score < rankScore) {
      rank += tie;
      tie = 1;
    }
    ranking.set(playerId, rank);
    rankScore = score;
  }
  return ranking;
}

export function IsCoordValid(c: util.Coord): boolean {
  if (c[0] < 0 || c[0] >= 20) {
    return false;
  }
  if (c[1] < 0 || c[1] >= 20) {
    return false;
  }
  return true;
}

// In order to make decisions about their next moves, players need to know
// which squares are open starting points and which squares are taken or
// otherwise invalid.
//
// Coordinates are guaranteed to be in-range on the game board.
export class PlayerInputs {
  readonly state: GameState;
  readonly player: Player;
  readonly startPoints: util.CoordSet;
  readonly exclude: util.CoordSet;

  constructor(state: GameState, player: Player, startPoints: util.CoordSet, exclude: util.CoordSet) {
    this.state = state;
    this.player = player;
    this.startPoints = startPoints;
    this.exclude = exclude;
  }

  ValidateCoord(coord: util.Coord): string|null {
    if (!IsCoordValid(coord)) {
      return 'Coordinate falls off the board';
    }
    if (this.exclude.Has(coord)) {
      return 'Coordinate is illegal';
    }
    return null;
  }

  // Helper method to figure out if a proposed move is valid.
  // - All cells in the proposed move must be on the board.
  // - All cells in the proposed move must not be illegal.
  ValidateMove(cells: Iterable<util.Coord>): string|null {
    for (const coord of cells) {
      const rejection = this.ValidateCoord(coord);
      if (rejection) {
        return rejection;
      }
    }
    return null;
  }
}

export function GetBoardState(board: util.Matrix, playerId: number): [util.CoordSet, util.CoordSet] {
  const valid = new util.CoordSet();
  const exclude = new util.CoordSet();

  // CoordSet will simply drop any coordinates that fall off the board.
  for (let m = 0; m < board.M; m++) {
    for (let n = 0; n < board.N; n++) {
      const val = board.Get(m, n);
      if (val === 0) {
        // Ignore any empty cells.
        continue;
      } else if (val === playerId) {
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
  return [startPoints, exclude];
}

export function GetPlayerInputs(state: GameState, player: Player): PlayerInputs {
  const [startPoints, exclude] = GetBoardState(state.board, player.id);
  return new PlayerInputs(state, player, startPoints, exclude);
}