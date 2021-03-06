import * as agent from './agent';
import * as blocks from './blocks';
import * as tournament from './tournament';
import * as ui from './ui';
import * as util from './util';

function RandomWeights(numWeights: number): number[] {
  const weights: number[] = [];
  for (let i = 0; i < numWeights; i++) {
    weights.push(util.TruncateNumber(util.RandomInRange(-2, 2), 1));
  }
  return weights;
}

function MutateAllWeights(weights: number[]): number[] {
  const mutated: number[] = [];
  for (const weight of weights) {
    const mutation = Math.random() * 2 * util.RandomElement([1, -1]);
    mutated.push(util.TruncateNumber(weight + mutation, 1));
  }
  return mutated;
}

function MutateWeights(weights: number[]): number[] {
  const idx = Math.floor(Math.random() * weights.length);
  const newWeights = Array.of(...weights);

  const mutation = Math.random() * 2 * util.RandomElement([1, -1]);
  newWeights[idx] = util.TruncateNumber(newWeights[idx] + mutation, 1);
  return newWeights;
}

function SortHighestMeanRanking(a1: tournament.AgentRecord, a2: tournament.AgentRecord): number {
  return a2.MeanRanking() - a1.MeanRanking();
}

function SortLeastPlayed(a1: tournament.AgentRecord, a2: tournament.AgentRecord): number {
  return a1.gamesPlayed - a2.gamesPlayed;
}

class Darwin {
  private agents: Map<string, tournament.AgentRecord>;
  private rounds: number;

  constructor() {
    this.agents = new Map();
    this.rounds = 0;
  }

  Evolve(generation: blocks.Agent[]) {
    this.RunTournament(generation);
  }

  RunTournament(generation: blocks.Agent[]) {
    for (const agent of generation) {
      const desc = agent.Description();
      if (!this.agents.has(desc)) {
        this.agents.set(desc, new tournament.AgentRecord(agent));
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
    records.sort(SortHighestMeanRanking);
    records.splice(30);
    this.agents.clear();
    console.log('Results after N(rounds)=' + this.rounds);
    for (const record of records) {
      this.agents.set(record.agent.Description(), record);
      console.log(
          'Agent ' + record.agent.Description() + ' => (' + record.totalRankingPoints + ' / ' + record.gamesPlayed +
          ') = ' + util.TruncateNumber(record.MeanRanking(), 3));
    }

    ui.DrawAgentRanking(records);

    // Do it again.
    const generation = this.MakeGeneration(records, bestAgent);
    this.RunTournament(generation);
  }

  MakeGeneration(records: tournament.AgentRecord[], bestAgent: blocks.Agent): blocks.Agent[] {
    if (this.rounds % 5 === 0) {
      console.log("Picking players with the least experience");
      records.sort(SortLeastPlayed);
      return records.slice(0, 4).map((r) => r.agent);
    }

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
      let newWeights = [];
      if (topAgent instanceof agent.RankingAgent) {
        if (Math.random() < 0.25) {
          // Attempt to add more diversity to the gene pool.
          newWeights = MutateAllWeights(topAgent.weights);
        } else {
          newWeights = MutateWeights(topAgent.weights);
        }
      } else {
        newWeights = RandomWeights(agent.RankingAgent.kNumWeights);
      }

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

export function Main() {
  const agents = [
    new agent.HardestFirstAgent(),
    new agent.RankingAgent([2.5, 1.4, 0.4, 0]),  // Evolved
    new agent.RankingAgent([0, 1, 1, 0]),        // Manual
    new agent.RankingAgent([1, 1, 1, 0]),        // Manual
  ];

  const d = new Darwin();
  d.Evolve(agents);
}