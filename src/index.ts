import $ from 'jquery';

import * as agent from './agent';
import * as blocks from './blocks';
import * as game from './game';
import * as ui from './ui';
import * as util from './util';
import { EvolutionMain } from './evolution';

function SingleGame() {
  const agents = [
    new agent.BiggestFirstAgent(),
    new agent.RankingAgent([2.5, 1.4, 0.4]),  // Evolved
    new agent.RankingAgent([0, 1, 1]),        // Manual
    new agent.RankingAgent([1, 1, 1]),        // Manual
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
    EvolutionMain();
  } else {
    SingleGame();
  }
}

$(document).ready(Main);