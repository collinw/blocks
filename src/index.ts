import $ from 'jquery';

import * as agent from './agent';
import * as blocks from './blocks';
import * as pieces from './pieces';
import * as ui from './ui';

function MakePlayers(): blocks.Player[] {
  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push(new blocks.Player(i + 1, new agent.RandomAgent(), pieces.GetPieces()));
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
  } else {
    state.GiveUp(player);
    return false;
  }
}

function PlayRound(state: blocks.GameState): boolean {
  let keepGoing = true;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (!player.stillPlaying) {
      continue;
    }

    const input = blocks.GetPlayerInputs(state, player.id);
    keepGoing = keepGoing && Play(state, player, input);
  }
  return keepGoing;
}

function FirstRound(state: blocks.GameState) {
  let keepGoing = true;
  for (let i = 0; i < state.players.length; i++) {
    const start = kFirstRoundStartingPoints[i];
    const input = new blocks.PlayerInputs(new blocks.CoordSet(start), new blocks.CoordSet());

    const player = state.players[i];
    if (!player.stillPlaying) {
      continue;
    }

    keepGoing = keepGoing && Play(state, player, input);
  }
  return keepGoing;
}

function Main() {
  const players = MakePlayers();
  const state = new blocks.GameState(players);

  const keepGoing = FirstRound(state);
  ui.Draw(state);
}

$(document).ready(Main);