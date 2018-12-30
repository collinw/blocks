import * as blocks from './blocks';
import * as pieces from './pieces';

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

export function GenerateMove(
    origin: blocks.Coord, root: blocks.Coord, pieceForm: pieces.PieceForm): blocks.CoordSet {
  const mOffset = origin[0] - root[0];
  const nOffset = origin[1] - root[1];

  const cells = new blocks.CoordSet();
  for (let m = 0; m < pieceForm.M; m++) {
    for (let n = 0; n < pieceForm.N; n++) {
      if (pieceForm.Get(m, n) > 0) {
        cells.Add([m + mOffset, n + nOffset]);
      }
    }
  }
  return cells;
}

export function GenerateValidMoves(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move[] {
  const valid = [];
  let evals = 0;

  for (const start of inputs.startPoints) {
    for (const piece of ps) {
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
  }
  console.log('Evaluated ' + evals + ' possible moves, pruned to ' + valid.length);
  return valid;
}

export class RandomAgent implements blocks.Agent {
  MakeMove(inputs: blocks.PlayerInputs, ps: pieces.Piece[]): blocks.Move|blocks.GiveUp {
    const valid = GenerateValidMoves(inputs, ps);
    if (valid.length === 0) {
      return new blocks.GiveUp();
    }
    return valid[Math.floor(valid.length * Math.random())];
  }

  Description(): string {
    return "Random";
  }
}