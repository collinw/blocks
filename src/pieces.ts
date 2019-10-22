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

export class PieceForm {
  readonly M: number;
  readonly N: number;
  readonly roots: util.Coord[];

  constructor(matrix: util.Matrix) {
    this.matrix = matrix;
    this.M = matrix.M;
    this.N = matrix.N;
    this.roots = this.GetRoots();
  }

  static From2DArray(data: number[][]): PieceForm {
    return new PieceForm(util.Matrix.From2DArray(data));
  }

  Get(m: number, n: number): number {
    return this.matrix.Get(m, n);
  }

  RotateClockwise(): PieceForm {
    return new PieceForm(this.matrix.RotateClockwise());
  }

  Flip(): PieceForm {
    return new PieceForm(this.matrix.Flip());
  }

  toString(): string {
    return this.matrix.toString();
  }

  private GetRoots(): util.Coord[] {
    const roots: util.Coord[] = [];
    for (let m = 0; m < this.M; m++) {
      for (let n = 0; n < this.N; n++) {
        if (this.Get(m, n) === 1) {
          roots.push([m, n]);
        }
      }
    }
    return roots;
  }

  private matrix: util.Matrix;
}

export class PieceFormSet extends util.DeepSet<PieceForm> {
  constructor(data: Iterable<PieceForm>) {
    super(data);
  }
}

function CountPoints(canonical: PieceForm): number {
  let points = 0;
  for (let m = 0; m < canonical.M; m++) {
    for (let n = 0; n < canonical.N; n++) {
      if (canonical.Get(m, n) > 0) {
        points++;
      }
    }
  }
  return points;
}

// Pieces are represented in a canonical form with multiple variants,
// each corresponding to a way of rotating/flipping the canonical form.
// We generate these once and use them throughout in order to simplify
// the process of calculating possible moves.
export class Piece {
  readonly canonical: PieceForm;
  readonly variants: PieceFormSet;
  readonly points: number;

  constructor(canonical: PieceForm, variants: PieceFormSet) {
    this.canonical = canonical;
    this.variants = variants;
    this.points = CountPoints(canonical);
  }

  IsSingleSquare(): boolean {
    return this.canonical.M === 1 && this.canonical.N === 1;
  }
}

export function GenerateVariants(canonical: PieceForm): PieceFormSet {
  const variants = [canonical];

  for (let i = 0; i < 3; i++) {
    const rotated = variants[variants.length - 1].RotateClockwise();
    variants.push(rotated);
  }
  for (let i = 0; i < 4; i++) {
    variants.push(variants[i].Flip());
  }
  return new PieceFormSet(variants);
}

export function GetPieces(): Piece[] {
  const pieces = [];
  for (const form of kCanonicalPieces) {
    const canonical = PieceForm.From2DArray(form);
    pieces.push(new Piece(canonical, GenerateVariants(canonical)));
  }
  return pieces;
}