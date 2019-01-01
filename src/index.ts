import $ from 'jquery';

import * as agent from './agent';
import * as blocks from './blocks';
import * as pieces from './pieces';
import * as ui from './ui';
import * as util from './util';

function MakePlayers(): blocks.Player[] {
  // Make it easy to swap out agents while testing.
  const agents = [
    new agent.BiggestFirstAgent(),
    new agent.HardestFirstAgent(),
    new agent.RandomAgent(),
    new agent.RandomAgent(),
  ];
  util.ShuffleArray(agents);

  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push(new blocks.Player(i + 1, agents[i], pieces.GetPieces()));
  }
  return players;
}

const kFirstRoundStartingPoints: blocks.Coord[] = [[0, 0], [0, 19], [19, 0], [19, 19]];

function Play(state: blocks.GameState, player: blocks.Player, input: blocks.PlayerInputs): boolean {
  const decision = player.MakeMove(input);
  if (decision instanceof blocks.Move) {
    const rejection = input.ValidateMove(decision.cells);
    if (rejection) {
      throw new Error('Player proposed an invalid move! ' + decision.cells + ': ' + rejection);
    }
    state.ApplyMove(player, decision);
    return true;
  }
  console.log("Player " + player.id + " gave up!");
  state.GiveUp(player);
  return false;
}

function PlayRound(state: blocks.GameState): boolean {
  let keepGoing = false;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (!player.stillPlaying) {
      continue;
    }

    const input = blocks.GetPlayerInputs(state, player.id);
    keepGoing = Play(state, player, input) || keepGoing;
  }
  return keepGoing;
}

function FirstRound(state: blocks.GameState) {
  let keepGoing = false;
  for (let i = 0; i < state.players.length; i++) {
    const start = kFirstRoundStartingPoints[i];
    const input = new blocks.PlayerInputs(new blocks.CoordSet(start), new blocks.CoordSet());

    const player = state.players[i];
    keepGoing = Play(state, player, input) || keepGoing;
  }
  return keepGoing;
}

function PlayAgainUntilDone(state: blocks.GameState) {
  // Using setTimeout here gives the UI a chance to redraw during the game.
  setTimeout(() => {
    console.log('Next round');
    const keepGoing = PlayRound(state);
    ui.Draw(state);
    if (keepGoing) {
      PlayAgainUntilDone(state);
    }
  }, 0);
}

function Main() {
  const players = MakePlayers();
  const state = new blocks.GameState(players);

  console.log('Round 1');
  FirstRound(state);
  ui.Draw(state);

  PlayAgainUntilDone(state);
}

$(document).ready(Main);