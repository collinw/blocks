import $ from 'jquery';

import * as agent from './agent';
import * as blocks from './blocks';
import * as evolution from './evolution';
import * as game from './game';
import * as ui from './ui';
import * as util from './util';

function SingleGame() {
  const agents = [
    new agent.BiggestFirstAgent(),
    new agent.RankingAgent([2.5, 1.4, 0.4, 1]),  // Evolved
    new agent.RankingAgent([0, 1, 1, 1]),        // Manual
    new agent.RankingAgent([1, 1, 1, 1]),        // Manual
  ];

  // Have the agents play in different order each round.
  util.ShuffleArray(agents);
  const players = blocks.MakePlayers(agents);

  const g = new game.Game();
  g.OnGameStart(ui.Draw);
  g.OnRoundDone(ui.Draw);
  g.Play(players);
}

function Main() {
  if (document.getElementById('evolution')) {
    evolution.Main();
  } else {
    SingleGame();
  }
}

$(document).ready(Main);