import * as blocks from './blocks';
import * as game from './game';
import * as pieces from './pieces';
import * as util from './util';

// Ranking points drawn from the source of all truth, Mario Kart 64.
const kRankingPoints = new util.SimpleMap([[1, 9], [2, 6], [3, 3], [4, 1]]);

type AgentRanking = {
  [id: string]: number
};

type AgentScores = {
  [id: string]: number
};

type AgentPoints = {
  [id: string]: number
};

class GameResult {
  // The score of each agent in a single game.
  agentScores: AgentScores;
  // The rank of each agent (1st, 2nd, 3rd, 4th) in a single game.
  agentRanking: AgentRanking;
  // The number of ranking points that each agent received from a single game.
  agentPoints: AgentPoints;

  constructor(scores: AgentScores, ranking: AgentRanking, points: AgentPoints) {
    this.agentScores = scores;
    this.agentRanking = ranking;
    this.agentPoints = points;
  }
}

function PlayerScoresToGameResult(players: blocks.Player[], pScores: blocks.Scores): GameResult {
  const pRanking = blocks.ScoresToRanking(pScores);

  const aRanking: AgentRanking = {};
  const aScores: AgentScores = {};
  const aPoints: AgentPoints = {};
  for (const player of players) {
    const score = pScores.Get(player.id);
    // A perfect game is a better kind of win.
    const bonus = score === 109 ? 2 : 0;
    const rank = pRanking.Get(player.id);

    const agentDesc = player.agent.Description();
    aScores[agentDesc] = score;
    aRanking[agentDesc] = rank;
    aPoints[agentDesc] = kRankingPoints.Get(rank) + bonus;
  }

  return new GameResult(aScores, aRanking, aPoints);
}

type TournamentCallback = (t: Tournament) => void;

export class Tournament {
  agents: blocks.Agent[];
  results: GameResult[];
  // Number of ranking points accumulated by each agent during the tournament.
  agentPoints: util.NumberMap<string>;

  private rounds: number;
  private tournamentStart: TournamentCallback[];
  private tournamentDone: TournamentCallback[];
  private onResult: TournamentCallback[];
  private gameStart: game.GameCallback[];
  private roundDone: game.GameCallback[];

  constructor(agents: blocks.Agent[], rounds: number) {
    this.agents = agents;
    this.rounds = rounds;
    this.agentPoints = new util.NumberMap();
    this.results = [];
    this.tournamentStart = [];
    this.tournamentDone = [];
    this.onResult = [];
    this.gameStart = [];
    this.roundDone = [];

    for (const agent of agents) {
      this.agentPoints.set(agent.Description(), 0);
    }
  }

  RunTournament() {
    this.RunCallbacks(this.tournamentStart);
    this.PlayGame();
  }

  PlayGame() {
    // Have the agents play in different order each round.
    const gameAgents = Array.from(this.agents);
    util.ShuffleArray(gameAgents);
    const players = blocks.MakePlayers(gameAgents);

    const g = new game.Game();
    g.OnGameStart(...this.gameStart);
    g.OnRoundDone(...this.roundDone);
    g.OnGameDone((state: blocks.GameState) => this.WhenGameDone(state));
    g.Play(players);
  }

  WhenGameDone(state: blocks.GameState) {
    const scores = blocks.GetScores(state);
    const result = PlayerScoresToGameResult(state.players, scores);

    for (const agent of this.agents) {
      const desc = agent.Description();
      const points = result.agentPoints[desc];
      this.agentPoints.Add(desc, points);
    }

    this.results.push(result);
    this.RunCallbacks(this.onResult);

    if (this.results.length < this.rounds) {
      this.PlayGame();
    } else {
      this.RunCallbacks(this.tournamentDone);
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

  OnTournamentDone(...funcs: TournamentCallback[]) {
    this.tournamentDone.push(...funcs);
  }

  OnGameStart(...funcs: game.GameCallback[]) {
    this.gameStart.push(...funcs);
  }

  OnRoundDone(...funcs: game.GameCallback[]) {
    this.roundDone.push(...funcs);
  }
}