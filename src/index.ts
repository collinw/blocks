import $ from 'jquery';

import * as blocks from './blocks';
import * as ui from './ui';

function main() {
  const state = new blocks.GameState();

  state.board.Set(5, 5, 3);
  state.board.Set(5, 6, 3);
  state.board.Set(1, 2, 2);

  ui.Draw(state);
}

$(document).ready(main);