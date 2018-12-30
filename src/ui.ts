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

  const scores = blocks.GetScores(state);
  for (let i = 1; i <= 4; i++) {
    const elem = $('#player-score-' + i);
    elem.text(scores[i]);
  }

  for (let i = 0; i < 4; i++) {
    const player = state.players[i];

    const inputs = blocks.GetPlayerInputs(state, player.id);
    for (const coord of inputs.startPoints) {
      $('#' + CellId(coord[0], coord[1])).text('x');
    }

    const playerUI = $('#pieces-player' + player.id);
    playerUI.empty();

    for (const piece of player.pieces) {
      const pieceUI = $('<table class=\'piece\'></table>');
      for (let m = 0; m < piece.canonical.M; m++) {
        const row = $('<tr></tr>');
        for (let n = 0; n < piece.canonical.N; n++) {
          const cell = $('<td></td>');
          if (piece.canonical.Get(m, n) > 0) {
            cell.addClass('piece-unit');
          }
          row.append(cell);
        }
        pieceUI.append(row);
      }
      playerUI.append(pieceUI);
    }
  }
}