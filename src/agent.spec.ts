import * as agent from './agent';
import * as blocks from './blocks';
import * as pieces from './pieces';
import * as util from './util';
import { assert, expect } from 'chai';
import 'mocha';

describe('AgentUtilities', () => {

  it('can generate a new move proposal', () => {
    // Apply the upper-left corner of this piece at (5, 5).
    const start: util.Coord = [5, 5];
    let form = new pieces.PieceForm(
      [[1, 1],
       [1, 1]]);
    let root: util.Coord = [0, 0];
    let move = agent.GenerateMove(start, root, form);
    expect(move).to.deep.equal(
      [[5, 5], [5, 6],
       [6, 5], [6, 6]]
    );

    // Apply the lower-right corner of this piece at (5, 5).
    root = [1, 1];
    move = agent.GenerateMove(start, root, form);
    expect(move).to.deep.equal(
      [[4, 4], [4, 5],
       [5, 4], [5, 5]]
    );

    // Apply the center-right of this piece at (5, 5).
    // A more-complicated example: do not generate coordinates
    // for empty cells; handle interior nodes.
    form = new pieces.PieceForm(
      [[1, 2, 0],
       [0, 1, 1],
       [0, 1, 0]]);
    root = [1, 2];
    move = agent.GenerateMove(start, root, form);
    expect(move).to.deep.equal(
      [[4, 3], [4, 4],
               [5, 4], [5, 5],
               [6, 4]]);
  });
});