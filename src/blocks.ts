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

type Scores = { [id: number] : number; };

// TODO: implement "placed all your pieces" and "played single square last"
// scoring.
export function GetScores(state: GameState): Scores {
  const scores: Scores = {1: 0, 2: 0, 3: 0, 4: 0};

  for (let m = 0; m < state.board.M; m++) {
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      if (val > 0) {
        scores[val]++;
      }
    }
  }
  return scores;
}