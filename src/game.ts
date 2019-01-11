import * as blocks from './blocks';
import * as util from './util';

const kFirstRoundStartingPoints: util.Coord[] = [[0, 0], [0, 19], [19, 0], [19, 19]];

export type GameCallback = (state: blocks.GameState) => void;

export class Game {
  private gameStart: GameCallback[];
  private roundDone: GameCallback[];
  private gameDone: GameCallback[];

  constructor() {
    this.gameStart = [];
    this.roundDone = [];
    this.gameDone = [];
  }

  Play(players: blocks.Player[]) {
    const state = blocks.GameState.NewGame(players);
    this.RunCallbacks(this.gameStart, state);

    FirstRound(state);
    this.RunCallbacks(this.roundDone, state);
    this.PlayAgainUntilDone(state);
  }

  PlayAgainUntilDone(state: blocks.GameState) {
    // Using setTimeout here gives the UI a chance to redraw during the game.
    setTimeout(() => {
      const keepGoing = PlayRound(state);
      this.RunCallbacks(this.roundDone, state);
      if (keepGoing) {
        this.PlayAgainUntilDone(state);
      } else {
        this.RunCallbacks(this.gameDone, state);
      }
    }, 0);
  }

  RunCallbacks(funcs: GameCallback[], state: blocks.GameState) {
    for (const func of funcs) {
      func(state);
    }
  }

  OnGameStart(...funcs: GameCallback[]) {
    this.gameStart.push(...funcs);
  }

  OnRoundDone(...funcs: GameCallback[]) {
    this.roundDone.push(...funcs);
  }

  OnGameDone(...funcs: GameCallback[]) {
    this.gameDone.push(...funcs);
  }
}

function Play(state: blocks.GameState, player: blocks.Player, input: blocks.PlayerInputs): boolean {
  const decision = player.MakeMove(input);
  if (decision instanceof blocks.Move) {
    const rejection = input.ValidateMove(decision.cells);
    if (rejection) {
      throw new Error('Player proposed an invalid move! ' + decision.cells + ': ' + rejection);
    }
    state.ApplyMove(player, decision);
    return true;
  } else if (decision instanceof blocks.GiveUp) {
    state.GiveUp(player);
    return false;
  } else {
    throw new Error('Player returned an unexpected value');
  }
}

function PlayRound(state: blocks.GameState): boolean {
  let keepGoing = false;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    if (!player.stillPlaying) {
      continue;
    }

    const input = blocks.GetPlayerInputs(state, player);
    keepGoing = Play(state, player, input) || keepGoing;
  }
  return keepGoing;
}

function FirstRound(state: blocks.GameState) {
  let keepGoing = false;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    const start = kFirstRoundStartingPoints[i];
    const input = new blocks.PlayerInputs(state, player, new util.CoordSet(start), new util.CoordSet());

    keepGoing = Play(state, player, input) || keepGoing;
  }
  return keepGoing;
}