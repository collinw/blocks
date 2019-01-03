import * as blocks from './blocks';
import * as pieces from './pieces';
import * as util from './util';

// Figure out which cells in the piece are valid roots.
// TODO: cache this per-form variant so we're not having to recalculate it all the time.
export function GetRoots(pieceForm: pieces.PieceForm): blocks.CoordSet {
  const roots = new blocks.CoordSet();
  for (let m = 0; m < pieceForm.M; m++) {
    for (let n = 0; n < pieceForm.N; n++) {
      if (pieceForm.Get(m, n) === 1) {
        roots.Add([m, n]);
      }
    }
  }
  return roots;
}

// Conceptually, this returns a set, but an array is faster, and this is a
// core part of the game.
export function GenerateMove(
    start: blocks.Coord, root: blocks.Coord, pieceForm: pieces.PieceForm): blocks.Coord[] {
  const mOffset = start[0] - root[0];
  const nOffset = start[1] - root[1];

  const cells : blocks.Coord[] = [];
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
  const rejections : {[key: string]: number} = {};

  for (const start of inputs.startPoints) {
    for (const variant of piece.variants) {
      for (const root of GetRoots(variant)) {
        evals++;
        const cells = GenerateMove(start, root, variant);
        const rejection = inputs.ValidateMove(cells);
        if (rejection) {
          rejections[rejection] = (rejections[rejection] || 0) + 1;
          continue;
        }
        valid.push(new blocks.Move(piece, cells));
      }
    }
  }
  const pcnt = Math.round(valid.length / evals * 100);
  console.log('Evaluated ' + evals + ' possible moves, pruned to ' + valid.length + ' (' + pcnt + '% legal)');
  for (const rejection of Object.keys(rejections)) {
    console.log('Rejection: ' + rejection + ' = ' + rejections[rejection]);
  }
  return valid;
}

// An agent that gives up immediately. Used for testing.
export class QuitterAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    return new blocks.GiveUp();
  }

  Description(): string {
    return "Quitter";
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
    return "Random";
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
    return "BiggestFirst";
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
    return "HardestFirst";
  }
}