import $ from 'jquery';

import * as blocks from './blocks';

function CellId(m: number, n: number): string {
  return 'cell' + m + 'x' + n;
}

function DrawBoard(state: blocks.GameState) {
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
}

function DrawRemainingPieces(player: blocks.Player) {
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

function DrawPlayerTable(state: blocks.GameState) {
  const scores = blocks.GetScores(state);

  for (let i = 0; i < 4; i++) {
    const player = state.players[i];

    const elem = $('#player-score-' + player.id);
    elem.text(scores[player.id]);

    const desc = player.agent.Description();
    $(".player" + player.id + " > .player-desc").text(desc);

    const inputs = blocks.GetPlayerInputs(state, player.id);
    for (const coord of inputs.startPoints) {
      const cell = $('#' + CellId(coord[0], coord[1]));
      cell.addClass('possible-next');
      cell.addClass('player' + player.id);
      cell.text('x');
    }

    DrawRemainingPieces(player);
  }
}


export function Draw(state: blocks.GameState) {
  DrawBoard(state);
  DrawPlayerTable(state);
}