import * as blocks from './blocks';
import * as game from './game';
import * as pieces from './pieces';
import * as util from './util';

// Ranking points drawn from the source of all truth, Mario Kart 64.
export const kRankingPoints = new util.SimpleMap([[1, 9], [2, 6], [3, 3], [4, 1]]);

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
  private gameStart: game.GameCallback[];
  private roundDone: game.GameCallback[];

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

    const g = new game.Game();
    g.OnGameStart(...this.gameStart);
    g.OnRoundDone(...this.roundDone);
    g.OnGameDone((state: blocks.GameState) => this.WhenGameDone(state));
    g.Play(players);
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

  OnGameStart(...funcs: game.GameCallback[]) {
    this.gameStart.push(...funcs);
  }

  OnRoundDone(...funcs: game.GameCallback[]) {
    this.roundDone.push(...funcs);
  }
}