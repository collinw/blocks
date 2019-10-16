import $ from 'jquery';

import * as blocks from './blocks';
import * as pieces from './pieces';
import * as tournament from './tournament';
import * as util from './util';

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

  const playerUI = $('#pieces-remaining-player' + player.id);
  playerUI.html(pieces.join(''));
}

function DrawPiecesPlayed(player: blocks.Player) {
  const pieces = [];
  for (const move of player.moves) {
    pieces.push(DrawPiece(move.piece));
  }

  const playerUI = $('#pieces-played-player' + player.id);
  playerUI.html(pieces.join(''));
}

function DrawPlayerTable(state: blocks.GameState) {
  const scores = blocks.GetScores(state);

  for (let i = 0; i < 4; i++) {
    const player = state.players[i];

    const elem = $('#player-score-' + player.id);
    elem.text(scores.Get(player.id).points);

    const desc = player.agent.Description();
    $('#pieces-remaining .player' + player.id + ' > .player-desc').text(desc);

    const inputs = blocks.GetPlayerInputs(state, player);
    for (const coord of inputs.startPoints) {
      const cell = $('#' + CellId(coord[0], coord[1]));
      cell.addClass('possible-next');
      cell.addClass('player' + player.id);
    }

    DrawRemainingPieces(player);
    DrawPiecesPlayed(player);
  }
}

export function Draw(state: blocks.GameState) {
  DrawBoard(state);
  DrawPlayerTable(state);
}

const kRankingDesc = new util.SimpleMap([[1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th']]);

export function DrawTournament(t: tournament.Tournament) {
  const rows = [];

  let header = '<thead><th>Game</th>';
  for (const agent of t.agents) {
    header += '<th>' + agent.Description() + '</th>';
  }
  rows.push(header + '</thead>');

  for (let i = 0; i < t.results.length; i++) {
    const result = t.results[i];

    let row = '<tr><td>#' + (i + 1) + '</td>';
    for (const agent of t.agents) {
      const desc = agent.Description();
      const rank = result.agentRanking[desc];
      const score = result.agentScores[desc];
      const points = result.agentPoints[desc];
      row += '<td>' + kRankingDesc.Get(rank) + ' (' + score + ') -> ' + points + ' pts</td>';
    }
    rows.push(row + '</tr>');
  }

  let summary = '<tr><td></td>';
  for (const agent of t.agents) {
    const totalPoints = t.agentPoints.Get(agent.Description());
    summary += '<td>' + totalPoints + '</td>';
  }
  rows.push(summary + '</tr>');

  $('#tournament-score').html(rows.join(''));
}