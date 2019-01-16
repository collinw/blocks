import * as blocks from './blocks';
import * as pieces from './pieces';
import * as util from './util';

// Figure out which cells in the piece are valid roots.
// TODO: cache this per-form variant so we're not having to recalculate it all the time.
export function GetRoots(pieceForm: pieces.PieceForm): util.Coord[] {
  const roots: util.Coord[] = [];
  for (let m = 0; m < pieceForm.M; m++) {
    for (let n = 0; n < pieceForm.N; n++) {
      if (pieceForm.Get(m, n) === 1) {
        roots.push([m, n]);
      }
    }
  }
  return roots;
}

// Conceptually, this returns a set, but an array is faster, and this is a
// core part of the game.
export function GenerateMove(start: util.Coord, root: util.Coord, pieceForm: pieces.PieceForm): util.Coord[] {
  const mOffset = start[0] - root[0];
  const nOffset = start[1] - root[1];

  const cells: util.Coord[] = [];
  for (let m = 0; m < pieceForm.M; m++) {
    for (let n = 0; n < pieceForm.N; n++) {
      if (pieceForm.Get(m, n) > 0) {
        cells.push([m + mOffset, n + nOffset]);
      }
    }
  }
  return cells;
}

export function GenerateValidMoves(inputs: blocks.PlayerInputs, piece: pieces.Piece): blocks.Move[] {
  const valid = [];
  let evals = 0;

  for (const start of inputs.startPoints) {
    for (const variant of piece.variants) {
      for (const root of GetRoots(variant)) {
        evals++;
        const cells = GenerateMove(start, root, variant);
        const rejection = inputs.ValidateMove(cells);
        if (rejection) {
          continue;
        }
        valid.push(new blocks.Move(piece, cells));
      }
    }
  }
  return valid;
}

// An agent that gives up immediately. Used for testing.
export class QuitterAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    return new blocks.GiveUp();
  }

  Description(): string {
    return 'Quitter';
  }
}

// An agent that picks a move at random.
export class RandomAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    if (ps.length === 0) {
      return new blocks.GiveUp();
    }

    util.ShuffleArray(ps);
    for (const piece of ps) {
      const valid = GenerateValidMoves(inputs, piece);
      if (valid.length > 0) {
        return util.RandomElement(valid);
      }
    }
    return new blocks.GiveUp();
  }

  Description(): string {
    return 'Random';
  }
}

function ScorePieceArea(p: pieces.Piece): number {
  return p.canonical.M * p.canonical.N;
}

// An agent that tries to place the biggest pieces first.
export class BiggestFirstAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    ps = ps.sort((p1, p2) => ScorePieceArea(p2) - ScorePieceArea(p1));

    for (const piece of ps) {
      const valid = GenerateValidMoves(inputs, piece);
      if (valid.length > 0) {
        return util.RandomElement(valid);
      }
    }
    return new blocks.GiveUp();
  }

  Description(): string {
    return 'BiggestFirst';
  }
}

function CountInteriorCells(pf: pieces.PieceForm): number {
  let interior = 0;
  for (let m = 0; m < pf.M; m++) {
    for (let n = 0; n < pf.N; n++) {
      if (pf.Get(m, n) === 2) {
        interior++;
      }
    }
  }
  return interior;
}

function ScorePieceDifficulty(p: pieces.Piece): number {
  return ScorePieceArea(p) * (1 + CountInteriorCells(p.canonical));
}

// Agent that tries to place "harder" pieces first, where "hardness" is a static function
// each piece based on area and number of interior cells.
export class HardestFirstAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    ps = ps.sort((p1, p2) => ScorePieceDifficulty(p2) - ScorePieceDifficulty(p1));

    for (const piece of ps) {
      const valid = GenerateValidMoves(inputs, piece);
      if (valid.length > 0) {
        return util.RandomElement(valid);
      }
    }
    return new blocks.GiveUp();
  }

  Description(): string {
    return 'HardestFirst';
  }
}

function CountStartPoints(board: util.Matrix, playerId: number): number {
  const [startPoints, exclude] = blocks.GetBoardState(board, playerId);
  return startPoints.Size();
}

function GetBoardAfterMove(board: util.Matrix, move: blocks.Move, playerId: number): util.Matrix {
  const m = board.Copy();
  blocks.ApplyMove(m, move, playerId);
  return m;
}

export class RankingAgent implements blocks.Agent {
  static kNumWeights = 3;
  weights: number[];

  constructor(weights: number[]) {
    if (weights.length !== RankingAgent.kNumWeights) {
      throw new Error('Wrong number of weights!');
    }
    this.weights = weights;
  }

  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    const moves: Array<[number, blocks.Move]> = [];
    for (const piece of ps) {
      for (const move of GenerateValidMoves(inputs, piece)) {
        const score = this.ScoreMove(inputs.state.board, move, inputs.player.id);
        moves.push([score, move]);
      }
    }

    moves.sort((p1, p2) => p2[0] - p1[0]);
    if (moves.length > 0) {
      return moves[0][1];
    }
    return new blocks.GiveUp();
  }

  Description(): string {
    return 'Ranking(' + this.weights.join(', ') + ')';
  }

  ScoreMove(currBoard: util.Matrix, move: blocks.Move, playerId: number): number {
    const board = GetBoardAfterMove(currBoard, move, playerId);

    let points = 0;
    for (let m = 0; m < board.M; m++) {
      for (let n = 0; n < board.N; n++) {
        const val = board.Get(m, n);
        if (val === playerId) {
          points += 1;
        }
      }
    }
    const oldStartPoints = CountStartPoints(currBoard, playerId);
    const newStartPoints = CountStartPoints(board, playerId);
    const delta = newStartPoints - oldStartPoints;

    const values = [points, delta, ScorePieceDifficulty(move.piece)];
    return ApplyWeights(values, this.weights);
  }
}

function ApplyWeights(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('weights and values must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * weights[i];
  }
  return sum;
}