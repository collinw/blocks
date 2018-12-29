import $ from 'jquery';

import * as blocks from './blocks';

export function Draw(state: blocks.GameState) {
  const board = $('#board');
  for (let m = 0; m < state.board.M; m++) {
    const row = $('<tr></tr>');
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      row.append('<td class="player' + val + '"></td>');
    }
    board.append(row);
  }

  const scores = blocks.GetScores(state);
  for (let i = 1; i <= 4; i++) {
    const elem = $("#player-score-" + i);
    elem.text(scores[i]);
  }
}