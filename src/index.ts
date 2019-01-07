import $ from 'jquery';

import * as agent from './agent';
import * as blocks from './blocks';
import * as pieces from './pieces';
import * as ui from './ui';
import * as util from './util';

const kFirstRoundStartingPoints: util.Coord[] = [[0, 0], [0, 19], [19, 0], [19, 19]];

type GameCallback = (state: blocks.GameState) => void;

class Game {
  private gameStart: GameCallback[];
  private roundDone: GameCallback[];
  private gameDone: GameCallback[];

  constructor() {
    this.gameStart = [];
    this.roundDone = [];
    this.gameDone = [];
  }

  Play(players: blocks.Player[]) {
    const state = new blocks.GameState(players);
    this.RunCallbacks(this.gameStart, state);

    console.log('Round 1');
    FirstRound(state);
    this.RunCallbacks(this.roundDone, state);
    this.PlayAgainUntilDone(state);
  }

  PlayAgainUntilDone(state: blocks.GameState) {
    // Using setTimeout here gives the UI a chance to redraw during the game.
    setTimeout(() => {
      console.log('Next round');
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
    console.log("Player " + player.id + " gave up!");
    state.GiveUp(player);
    return false;
  } else {
    throw new Error("Player returned an unexpected value");
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

// Ranking points drawn from the source of all truth, Mario Kart 64.
const kRankingPoints = new util.SimpleMap([[1, 9], [2, 6], [3, 3], [4, 1]]);
const kRankingDesc = new util.SimpleMap([[1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th']]);

class GameResult {
  agentScores: AgentScores;
  agentRanking: AgentRanking;

  constructor(scores: AgentScores, ranking: AgentRanking) {
    this.agentScores = scores;
    this.agentRanking = ranking;
  }
}

type AgentRanking = {
  [id: string]: number
};

type AgentScores = {
  [id: string]: number
};

function PlayerScoresToGameResult(players: blocks.Player[], pScores: blocks.Scores): GameResult {
  const pRanking = blocks.ScoresToRanking(pScores);

  const aRanking: AgentRanking = {};
  const aScores: AgentScores = {};
  for (const player of players) {
    const agentDesc = player.agent.Description();
    aScores[agentDesc] = pScores.Get(player.id);
    aRanking[agentDesc] = pRanking.Get(player.id);
  }

  return new GameResult(aScores, aRanking);
}

function MakePlayers(agents: blocks.Agent[]): blocks.Player[] {
  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push(new blocks.Player(i + 1, agents[i], pieces.GetPieces()));
  }
  return players;
}

type TournamentCallback = (t: Tournament) => void;

export class Tournament {
  agents: blocks.Agent[];
  results: GameResult[];
  private rounds: number;
  private tournamentStart: TournamentCallback[];
  private onResult: TournamentCallback[];
  private gameStart: GameCallback[];
  private roundDone: GameCallback[];

  constructor(agents: blocks.Agent[], rounds: number) {
    this.agents = agents;
    this.rounds = rounds;
    this.results = [];
    this.tournamentStart = [];
    this.onResult = [];
    this.gameStart = [];
    this.roundDone = [];
  }

  RunTournament() {
    this.RunCallbacks(this.tournamentStart);
    this.PlayGame();
  }

  PlayGame() {
    // Have the agents play in different order each round.
    const gameAgents = Array.from(this.agents);
    util.ShuffleArray(gameAgents);
    const players = MakePlayers(gameAgents);

    const game = new Game();
    game.OnGameStart(...this.gameStart);
    game.OnRoundDone(...this.roundDone);
    game.OnGameDone((state: blocks.GameState) => this.WhenGameDone(state));
    game.Play(players);
  }

  WhenGameDone(state: blocks.GameState) {
    const scores = blocks.GetScores(state);
    this.results.push(PlayerScoresToGameResult(state.players, scores));
    this.RunCallbacks(this.onResult);
    if (this.results.length < this.rounds) {
      this.PlayGame();
    }
  }

  RunCallbacks(funcs: TournamentCallback[]) {
    for (const func of funcs) {
      func(this);
    }
  }

  OnTournamentStart(...funcs: TournamentCallback[]) {
    this.tournamentStart.push(...funcs);
  }

  OnResult(...funcs: TournamentCallback[]) {
    this.onResult.push(...funcs);
  }

  OnGameStart(...funcs: GameCallback[]) {
    this.gameStart.push(...funcs);
  }

  OnRoundDone(...funcs: GameCallback[]) {
    this.roundDone.push(...funcs);
  }
}

function DrawTournament(t: Tournament) {
  const total: {[id: string]: number} = {};
  const rows = [];

  let header = '<thead><th>Game</th>';
  for (const agent of t.agents) {
    const desc = agent.Description();
    total[desc] = 0;

    header += '<th>' + desc + '</th>';
  }
  rows.push(header + '</thead>');

  for (let i = 0; i < t.results.length; i++) {
    const result = t.results[i];

    let row = '<tr><td>#' + (i + 1) + '</td>';
    for (const agent of t.agents) {
      const desc = agent.Description();
      const rank = result.agentRanking[desc];
      const score = result.agentScores[desc];
      const points = kRankingPoints.Get(rank);
      total[desc] += points;
      row += '<td>' + kRankingDesc.Get(rank) + ' (' + score + ') -> ' + points + ' pts</td>';
    }
    rows.push(row + '</tr>');
  }

  let summary = '<tr><td></td>';
  for (const agent of t.agents) {
    summary += '<td>' + total[agent.Description()] + '</td>';
  }
  rows.push(summary + '</tr>');

  $('#tournament-score').html(rows.join(''));
}

function Main() {
  const agents = [
    new agent.RankingAgent([1, 0, 0]),
    new agent.RankingAgent([1, 1, 0]),
    new agent.RankingAgent([0, 1, 1]),
    new agent.RankingAgent([1, 1, 1]),
  ];

  const t = new Tournament(agents, 10);
  t.OnTournamentStart(DrawTournament);
  t.OnGameStart(ui.Draw);
  t.OnRoundDone(ui.Draw);
  t.OnResult(DrawTournament);
  t.RunTournament();
}

$(document).ready(Main);