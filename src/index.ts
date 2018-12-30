import $ from 'jquery';

import * as blocks from './blocks';
import * as pieces from './pieces';
import * as ui from './ui';

function main() {
  const allPieces = pieces.GetPieces();
  const players = blocks.MakePlayers(allPieces);
  const state = new blocks.GameState(players);

  state.board.Set(5, 5, 3);
  state.board.Set(5, 6, 3);
  state.board.Set(1, 2, 2);

  ui.Draw(state);
  ui.Draw(state);
}

$(document).ready(main);