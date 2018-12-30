export class Matrix {
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

// The ES6 Set type uses === to compare objects, so it doesn't consider
// [4, 4] and [4, 4] to be the same. Blergh.
export class DeepSet<T> {
  private data: { [key: string]: T };

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

  *[Symbol.iterator]() {
    for (const x of this.Values()) {
      yield x;
    }
  }

  toString(): string {
    return Array.from(this.Values()).join(", ");
  }
}