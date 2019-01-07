import $ from 'jquery';

import * as agent from './agent';
import * as tournament from './tournament';
import * as ui from './ui';

function Main() {
  const agents = [
    new agent.RankingAgent([1, 0, 0]),
    new agent.RankingAgent([1, 1, 0]),
    new agent.RankingAgent([0, 1, 1]),
    new agent.RankingAgent([1, 1, 1]),
  ];

  const t = new tournament.Tournament(agents, 10);
  t.OnTournamentStart(ui.DrawTournament);
  t.OnGameStart(ui.Draw);
  t.OnRoundDone(ui.Draw);
  t.OnResult(ui.DrawTournament);
  t.RunTournament();
}

$(document).ready(Main);