import $ from 'jquery';

import * as blocks from './blocks';

export function Draw(state: blocks.GameState) {
  const board = $('#board');
  console.log("Emitting a grid " + state.board.M + "x" + state.board.N);
  for (let i = 0; i < state.board.M; i++) {
    const row = board.append('<div class=\'row\'>');
    for (let j = 0; j < state.board.N; j++) {
      row.append('<div style=\'color: green\'></div>');
    }
    board.append('</div>');
  }
}