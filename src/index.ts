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

function ApproxPercentile(data: number[], pcnt: number): number {
  const idx = Math.floor(data.length * (pcnt / 100));
  return data[idx];
}

function DumpPerformance() {
  const raw = window.performance.getEntriesByName('MakeMoveMeasure');

  const data: number[] = [];
  for (const measure of raw) {
    data.push(measure.duration);
  }
  data.sort((a, b) => a - b);
  console.log('Number of samples: ' + raw.length);
  console.log('MakeMove min: ' + data[0]);
  console.log('50th: ' + ApproxPercentile(data, 50));
  console.log('90th: ' + ApproxPercentile(data, 90));
  console.log('95th: ' + ApproxPercentile(data, 95));
  console.log('99th: ' + ApproxPercentile(data, 99));
}

function Main() {
  if (document.getElementById('evolution')) {
    evolution.Main();
  } else {
    SingleGame();
    // Experimentally, the performance measurements aren't made available
    // immediately. We need to wait ~5s for them to become visible to
    // getEntriesByName().
    setTimeout(DumpPerformance, 5000);
  }
}

$(document).ready(Main);