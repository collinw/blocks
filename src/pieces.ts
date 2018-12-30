import * as util from './util';

// clang-format off
const kCanonicalPieces = [
  // One monomino.
  [[1]],
  // One domino.
  [[1, 1]],
  // Two trominoes.
  [[1, 1],
   [1, 0]],
  [[1, 2, 1]],
  // Five tetrominoes
  [[1, 2, 2, 1]],
  [[1, 2, 1],
   [0, 1, 0]],
  [[1, 1],
   [1, 1]],
  [[1, 1, 0],
   [0, 1, 1]],
  [[1, 1, 1],
   [0, 0, 1]],
  // 12 pentominoes.
  [[1, 2, 2, 2, 1]],
  [[1, 2, 1],
   [0, 1, 1]],
  [[0, 1, 2, 1],
   [1, 1, 0, 0]],
  [[1, 2, 2, 1],
   [0, 1, 0, 0]],
  [[1, 2, 2, 1],
   [1, 0, 0, 0]],
  [[1, 2, 1],
   [1, 0, 1]],
  [[1, 2, 1],
   [0, 2, 0],
   [0, 1, 0]],
  [[1, 2, 1],
   [0, 0, 2],
   [0, 0, 1]],
  [[0, 1, 0],
   [1, 2, 1],
   [0, 1, 0]],
  [[0, 1, 1],
   [1, 1, 0],
   [1, 0, 0]],
  [[1, 1, 0],
   [0, 2, 0],
   [0, 1, 1]],
  [[1, 1, 0],
   [0, 2, 1],
   [0, 1, 0]],
];
// clang-format on

if (kCanonicalPieces.length !== 21) {
  throw new Error('Missing canonical pieces! Wanted 21, got ' + kCanonicalPieces.length);
}

// If I write this as "export alias PieceForm = util.Matrix", tsc won't let other
// modules see it. Blergh.
export class PieceForm extends util.Matrix {
  constructor(data: number[][]) {
    super(data);
  }
}

// Pieces are represented in a canonical form with multiple variants,
// each corresponding to a way of rotating/flipping the canonical form.
// We generate these once and use them throughout in order to simplify
// the process of calculating possible moves.
export class Piece {
  readonly canonical: PieceForm;
  readonly variants: PieceForm[];

  constructor(canonical: PieceForm, variants: PieceForm[]) {
    this.canonical = canonical;
    this.variants = variants;
  }
}

// TODO: variants are currently not deduplicated.
export function GenerateVariants(canonical: PieceForm): PieceForm[] {
  const variants = [canonical];

  for (let i = 0; i < 3; i++) {
    const rotated = variants[variants.length - 1].RotateClockwise();
    variants.push(rotated);
  }
  for (let i = 0; i < 4; i++) {
    variants.push(variants[i].Flip());
  }
  return variants;
}

export function GetPieces(): Piece[] {
  const pieces = [];
  for (const form of kCanonicalPieces) {
    const canonical = new util.Matrix(form);
    pieces.push(new Piece(canonical, GenerateVariants(canonical)));
  }
  return pieces;
}