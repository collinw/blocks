import * as maths from "maths.ts";

export class GameState {
  board: maths.structures.Matrix;
  constructor() {
    this.board = new maths.structures.Matrix(20, 20);
  }
}