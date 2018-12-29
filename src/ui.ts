import $ from 'jquery';

import * as blocks from './blocks';

function CellId(m: number, n: number): string {
  return 'cell' + m + 'x' + n;
}

export function Draw(state: blocks.GameState) {
  const board = $('#board');
  board.empty();

  for (let m = 0; m < state.board.M; m++) {
    const row = $('<tr></tr>');
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      row.append('<td id="' + CellId(m, n) + '" class="player' + val + '"></td>');
    }
    board.append(row);
  }

  const inputs = blocks.GetPlayerInputs(state, 3);
  for (const coord of inputs.startPoints) {
    console.log('Possible starting point: ' + coord);
    $('#' + CellId(coord[0], coord[1])).text('x');
  }

  const scores = blocks.GetScores(state);
  for (let i = 1; i <= 4; i++) {
    const elem = $('#player-score-' + i);
    elem.text(scores[i]);
  }
}