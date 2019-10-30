export class Matrix {
  readonly M: number;
  readonly N: number;

  static From2DArray(data: number[][]): Matrix {
    if (data.length === 0) {
      return new Matrix(0, 0, []);
    }

    const M = data.length;
    const N = data[0].length;
    const matrix = Matrix.Zero(M, N);
    for (let m = 0; m < M; m++) {
      for (let n = 0; n < N; n++) {
        matrix.Set(m, n, data[m][n]);
      }
    }
    return matrix;
  }

  static Zero(m: number, n: number) {
    const data = new Array(m * n).fill(0);
    return new Matrix(m, n, data);
  }

  private CheckBounds(m: number, n: number) {
    if (m < 0 || n < 0) {
      throw new Error('Indices must be positive');
    }
    if (m >= this.M) {
      throw new Error('m value out of bounds: ' + m);
    }
    if (n >= this.N) {
      throw new Error('n value out of bounds: ' + n);
    }
  }

  Get(m: number, n: number): number {
    this.CheckBounds(m, n);
    return this.matrix[this.Idx(m, n)];
  }

  Set(m: number, n: number, val: number) {
    this.CheckBounds(m, n);
    this.matrix[this.Idx(m, n)] = val;
  }

  Flip(): Matrix {
    const flipped = Matrix.Zero(this.M, this.N);

    for (let m = 0; m < this.M; m++) {
      for (let n = 0; n < this.N; n++) {
        const val = this.Get(m, n);
        flipped.Set(this.M - m - 1, n, val);
      }
    }
    return flipped;
  }

  RotateClockwise(): Matrix {
    const rotated = Matrix.Zero(this.N, this.M);

    for (let m = 0; m < this.M; m++) {
      for (let n = 0; n < this.N; n++) {
        const val = this.Get(m, n);
        rotated.Set(n, this.M - m - 1, val);
      }
    }
    return rotated;
  }

  GetRow(m: number): number[] {
    const start = m * this.N;
    return this.matrix.slice(start, start + this.N);
  }

  Copy(): Matrix {
    const copy = Matrix.Zero(this.M, this.N);
    for (let m = 0; m < this.M; m++) {
      for (let n = 0; n < this.N; n++) {
        copy.Set(m, n, this.Get(m, n));
      }
    }
    return copy;
  }

  toString(): string {
    const rows = [];
    for (let m = 0; m < this.M; m++) {
      rows.push('[' + this.GetRow(m).join(', ') + ']');
    }
    return '[' + rows.join(', ') + ']';
  }

  private Idx(m: number, n: number): number {
    return m * this.N + n;
  }

  private constructor(m: number, n: number, data: number[]) {
    this.M = m;
    this.N = n;
    this.matrix = data;
  }

  private matrix: number[];
}

// The ES6 Set type uses === to compare objects, so it doesn't consider
// [4, 4] and [4, 4] to be the same. Blergh.
export class DeepSet<T> {
  private data: {[key: string]: T};

  constructor(data: Iterable<T>) {
    this.data = {};
    for (const x of data) {
      this.Add(x);
    }
  }

  Size(): number {
    return this.Values().length;
  }

  Add(x: T) {
    this.data[x.toString()] = x;
  }

  Has(x: T): boolean {
    return this.data[x.toString()] !== undefined;
  }

  Values(): T[] {
    return Object.values(this.data);
  }

  Difference(t: DeepSet<T>): DeepSet<T> {
    const diff = new DeepSet<T>([]);
    for (const x of this.Values()) {
      if (!t.Has(x)) {
        diff.Add(x);
      }
    }
    return diff;
  }

  * [Symbol.iterator]() {
    for (const x of this.Values()) {
      yield x;
    }
  }

  toString(): string {
    return Array.from(this.Values()).join(', ');
  }
}

export class MatrixSet extends DeepSet<Matrix> {
  constructor(data: Iterable<Matrix>) {
    super(data);
  }
}

// Coords are (m, n) coordinate pairs.
export type Coord = [number, number];

// A set of Coord objects. We assume that all coordinates are on
// a game board, thus we can optimize for a 20x20 grid of possible
// coordinates.
//
// Coordinates off the board are not added to the set. Downstream
// code was having to filter them out anyway.
//
// DeepSet is slow because it calls toString all the time; this
// class is optimized for set operations on [number, number] pairs.
export class CoordSet {
  private data: Matrix;

  constructor(...data: Coord[]) {
    this.data = Matrix.Zero(20, 20);
    for (const coord of data) {
      this.Add(coord);
    }
  }

  // Coordinates off the board are not added to the set.
  Add(coord: Coord) {
    const [x, y] = coord;
    if (x < 0 || x >= this.data.M || y < 0 || y >= this.data.N) {
      return;
    }
    this.data.Set(x, y, 1);
  }

  Has(coord: Coord): boolean {
    const [x, y] = coord;
    return this.data.Get(x, y) === 1;
  }

  Size(): number {
    let size = 0;
    for (const coord of this) {
      size++;
    }
    return size;
  }

  * [Symbol.iterator]() {
    for (let m = 0; m < this.data.M; m++) {
      for (let n = 0; n < this.data.N; n++) {
        if (this.data.Get(m, n) === 1) {
          yield [m, n] as Coord;
        }
      }
    }
  }

  Difference(t: CoordSet): CoordSet {
    const diff = new CoordSet();
    for (const coord of this) {
      if (!t.Has(coord)) {
        diff.Add(coord);
      }
    }
    return diff;
  }

  toString(): string {
    return Array.from(this).join(', ');
  }
}

// The given array must not be empty.
export function RandomElement<T>(a: T[]): T {
  if (a.length === 0) {
    throw new Error('Array is empty');
  }
  return a[Math.floor(a.length * Math.random())];
}

export function ShuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function RandomInRange(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export function TruncateNumber(n: number, digits: number): number {
  return Number(n.toFixed(digits));
}

// A map type with a simplified Get() method: if the key is not found,
// throw an exception. This avoids having to litter client code with
// "if(x === undefined)" guards.
export class SimpleMap<T, U> extends Map<T, U> {
  Get(key: T): U {
    const val = this.get(key);
    if (val === undefined) {
      throw new Error('Unknown key: ' + key);
    }
    return val;
  }
}

// A map type with a simplified interface for incrementing numeric
// map values.
export class NumberMap<T> extends SimpleMap<T, number> {
  Add(key: T, delta: number) {
    const val = (this.get(key) || 0) + delta;
    this.set(key, val);
  }
}