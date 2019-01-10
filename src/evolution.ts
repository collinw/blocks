import * as agent from './agent';
import * as tournament from './tournament';
import * as ui from './ui';
import * as util from './util';

function TruncateNumber(n: number): number {
  return Number(n.toFixed(1));
}

function RandomInRange(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

function RandomWeights(): number[] {
  const weights: number[] = [];
  for (let i = 0; i < 3; i++) {
    weights.push(TruncateNumber(RandomInRange(-2, 2)));
  }
  return weights;
}

function Sample<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function MutateAllWeights(weights: number[]): number[] {
  const mutated: number[] = [];
  for (const weight of weights) {
    const mutation = Math.random() * 2 * Sample([1, -1]);
    mutated.push(TruncateNumber(weight + mutation));
  }
  return mutated;
}

function MutateWeights(weights: number[]): number[] {
  const idx = Math.floor(Math.random() * weights.length);
  const newWeights = Array.of(...weights);

  const mutation = Math.random() * 2 * Sample([1, -1]);
  newWeights[idx] = TruncateNumber(newWeights[idx] + mutation);
  return newWeights;
}

class AgentRecord {
  agent: agent.RankingAgent;
  totalRankingPoints: number;
  gamesPlayed: number;

  constructor(agent: agent.RankingAgent) {
    this.agent = agent;
    this.totalRankingPoints = 0;
    this.gamesPlayed = 0;
  }

  MeanRanking(): number {
    return this.totalRankingPoints / this.gamesPlayed;
  }
}

function CompareAgentRecords(a1: AgentRecord, a2: AgentRecord): number {
  return a2.MeanRanking() - a1.MeanRanking();
}

class Darwin {
  private agents: Map<string, AgentRecord>;
  private rounds: number;

  constructor() {
    this.agents = new Map();
    this.rounds = 0;
  }

  Evolve(generation: agent.RankingAgent[]) {
    this.RunTournament(generation);
  }

  RunTournament(generation: agent.RankingAgent[]) {
    for (const agent of generation) {
      const desc = agent.Description();
      if (!this.agents.has(desc)) {
        this.agents.set(desc, new AgentRecord(agent));
      }
    }

    const t = new tournament.Tournament(generation, 5);
    t.OnTournamentStart(ui.DrawTournament);
    t.OnResult(ui.DrawTournament);
    t.OnTournamentDone((t: tournament.Tournament) => this.TournamentDone(t));
    t.RunTournament();
  }

  TournamentDone(t: tournament.Tournament) {
    this.rounds++;
    let maxPoints = 0;
    let bestAgent = null;

    // Update lifetime statistics.    
    for (const [desc, points] of t.agentPoints.entries()) {
      const record = this.agents.get(desc);
      if (record === undefined) {
        throw new Error('Unknown agent! ' + desc);
      }
      if (points > maxPoints) {
        maxPoints = points;
        bestAgent = record.agent;
      }
      record.totalRankingPoints += points;
      record.gamesPlayed += t.results.length;
    }
    if (bestAgent === null) {
      throw new Error('Failed to find winning agent!');
    }

    // Sort the list and prune the low performers.
    const records = Array.from(this.agents.values());
    records.sort(CompareAgentRecords);
    records.splice(30);
    this.agents.clear();
    console.log("Results after N(rounds)=" + this.rounds);
    for (const record of records) {
      this.agents.set(record.agent.Description(), record);
      console.log("Agent " + record.agent.Description() + " => (" + record.totalRankingPoints + " / " + record.gamesPlayed + ") = " + record.MeanRanking());
    }

    // Do it again.
    const generation = this.MakeGeneration(records, bestAgent);
    this.RunTournament(generation);
  }

  MakeGeneration(records: AgentRecord[], bestAgent: agent.RankingAgent): agent.RankingAgent[] {
    const topAgent = records[0].agent;

    // The winner of the last round always plays again.
    const generation = [bestAgent];
    const seen = new Set<string>([bestAgent.Description()]);
    
    // Two random agents from the top quartile of agents we're tracking.
    // We don't want to inflate agents' ranking points by having them play weak opponents.
    // The top-ranked agents should prove their value against comperable opponents.
    const quartile = records.slice(0, Math.floor(records.length / 4));
    util.ShuffleArray(quartile);
    for (const record of quartile) {
      const desc = record.agent.Description();
      if (seen.has(desc)) {
        continue;
      }
      seen.add(desc);
      generation.push(record.agent);

      if (generation.length === 3) {
        break;
      }
    }

    // One random agents generated by mutating the current best agents.
    while (generation.length < 4) {
      const newWeights = MutateWeights(topAgent.weights);
      const newAgent = new agent.RankingAgent(newWeights);
      const desc = newAgent.Description();
      if (seen.has(desc)) {
        continue;
      }
      seen.add(newAgent.Description());
      generation.push(newAgent);
    }
    return generation;
  }
}

export function EvolutionMain() {
  const agents = [
    new agent.RankingAgent(RandomWeights()),  // Random
    new agent.RankingAgent([2.5, 1.4, 0.4]),  // Evolved
    new agent.RankingAgent([0, 1, 1]),        // Manual
    new agent.RankingAgent([1, 1, 1]),        // Manual
  ];

  const d = new Darwin();
  d.Evolve(agents);
}