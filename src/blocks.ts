class Matrix {
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

export class GameState {
  board: Matrix;
  constructor() {
    this.board = new Matrix(20, 20);
  }
}