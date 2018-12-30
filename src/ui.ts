import $ from 'jquery';

import * as blocks from './blocks';
import * as pieces from './pieces';

function CellId(m: number, n: number): string {
  return 'cell' + m + 'x' + n;
}

function DrawBoard(state: blocks.GameState) {
  // Appending a single string to the jQuery object is much, much faster
  // than manipulating a bunch of intermediate objects.
  const rows = [];
  for (let m = 0; m < state.board.M; m++) {
    const row = ['<tr>'];
    for (let n = 0; n < state.board.N; n++) {
      const val = state.board.Get(m, n);
      row.push('<td id="' + CellId(m, n) + '" class="player' + val + '"></td>');
    }
    row.push('</tr>');
    rows.push(row.join(''));
  }

  const board = $('#board');
  board.html(rows.join(''));
}

function DrawPiece(piece: pieces.Piece): string {
  // Appending a single string to the jQuery object is much, much faster
  // than manipulating a bunch of intermediate objects.
  const table = ['<table class=\'piece\'>'];
  for (let m = 0; m < piece.canonical.M; m++) {
    const row = ['<tr>'];
    for (let n = 0; n < piece.canonical.N; n++) {
      if (piece.canonical.Get(m, n) > 0) {
        row.push('<td class="piece-unit"></td>');
      } else {
        row.push('<td></td>');
      }
    }
    row.push('</tr>');
    table.push(row.join(''));
  }
  table.push('</table>');
  return table.join('');
}

function DrawRemainingPieces(player: blocks.Player) {
  const pieces = [];
  for (const piece of player.pieces) {
    pieces.push(DrawPiece(piece));
  }

  const playerUI = $('#pieces-player' + player.id);
  playerUI.html(pieces.join(''));
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