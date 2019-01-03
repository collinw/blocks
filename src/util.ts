export class Matrix {
  private matrix: number[][];

  constructor(data: number[][]) {
    this.matrix = [];

    if (data.length > 0) {
      const m = data.length;
      const n = data[0].length;

      for (let i = 0; i < m; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
          row.push(data[i][j]);
        }
        this.matrix.push(row);
      }
    }
  }

  static Zero(m: number, n: number) {
    const data = [];
    for (let i = 0; i < m; i++) {
      data.push(new Array(n).fill(0));
    }

    return new Matrix(data);
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
    if (this.M === 0) {
      return 0;
    }
    return this.matrix[0].length;
  }

  Flip(): Matrix {
    return new Matrix(this.matrix.slice().reverse());
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

  Copy(): Matrix {
    return new Matrix(this.matrix);
  }

  toString(): string {
    const rows = [];
    for (let m = 0; m < this.M; m++) {
      rows.push('[' + this.matrix[m].join(', ') + ']');
    }
    return '[' + rows.join(', ') + ']';
  }
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

  Intersection(t: DeepSet<T>): DeepSet<T> {
    const intersection = new DeepSet<T>([]);
    for (const x of this.Values()) {
      if (t.Has(x)) {
        intersection.Add(x);
      }
    }
    return intersection;
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

// A set of Coord objects.
export class CoordSet extends DeepSet<Coord> {
  constructor(...data: Coord[]) {
    super(data);
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