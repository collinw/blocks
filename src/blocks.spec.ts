import * as blocks from './blocks';
import { assert, expect } from 'chai';
import 'mocha';

describe('CoordSet', () => {

  it('should support basic set operations', () => {
    const s = new blocks.CoordSet();
    expect(s.Size()).to.equal(0);

    s.Add([4, 5]);
    expect(s.Size()).to.equal(1);

    s.Add([4, 5]);
    expect(s.Size()).to.equal(1);

    s.Add([3, 3]);
    expect(s.Size()).to.equal(2);

    expect(s.Has([0, 0])).to.equal(false);
  });

  it('should diff sets', () => {
    // Both sets are empty.
    let set = new blocks.CoordSet();
    let result = set.Difference(new blocks.CoordSet());
    expect(result).to.deep.equal(new blocks.CoordSet());

    // The other set is empty.
    set = new blocks.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new blocks.CoordSet());
    expect(result).to.deep.equal(new blocks.CoordSet([1, 2], [3, 4]));

    // This set is empty, the other set has values.
    set = new blocks.CoordSet();
    result = set.Difference(new blocks.CoordSet([1, 2], [3, 4]));
    expect(result).to.deep.equal(new blocks.CoordSet());

    // Both sets have values, but they are disjoint.
    set = new blocks.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new blocks.CoordSet([5, 6]));
    expect(result).to.deep.equal(new blocks.CoordSet([1, 2], [3, 4]));

    // Both sets have values, but they have a non-null intersection.
    set = new blocks.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new blocks.CoordSet([3, 4]));
    expect(result).to.deep.equal(new blocks.CoordSet([1, 2]));
  });
});

describe('GameState', () => {

  it('should validate cooordinates', () => {
    const state = new blocks.GameState();
    assert(state.board.M === 20);
    assert(state.board.N === 20);

    const result = state.GetValidCoords([
      // Valid.
      [0, 0],
      [5, 8],
      // Off the far end of the board.
      [22, 3],
      [7, 34],
      // Negative coordinates.
      [-3, 15],
      [15, -3],
    ]);
    expect(result).to.deep.equal(new blocks.CoordSet([0, 0], [5, 8]));
  });

  describe('GetPlayerInputs', () => {

    it('should work', () => {
      // Deliberately position both players on the edge of the board so that we verify
      // no off-the-board positions are generated.
      const state = new blocks.GameState();
      state.board.Set(0, 1, 2);
      state.board.Set(0, 0, 3);

      // A player with no pieces on the board. In the real game, we
      // simply hardcode the initial set of inputs for each player.
      let inputs = blocks.GetPlayerInputs(state, 1);
      expect(inputs.startPoints.Size()).to.equal(0);
      expect(inputs.exclude).to.deep.equal(new blocks.CoordSet([0, 0], [0, 1]));

      inputs = blocks.GetPlayerInputs(state, 2);
      expect(inputs.startPoints).to.deep.equal(new blocks.CoordSet([1, 0], [1, 2]));
      expect(inputs.exclude).to.deep.equal(new blocks.CoordSet([0, 0], [0, 1], [0, 2], [1, 1]));

      inputs = blocks.GetPlayerInputs(state, 3);
      expect(inputs.startPoints).to.deep.equal(new blocks.CoordSet([1, 1]));
      expect(inputs.exclude).to.deep.equal(new blocks.CoordSet([0, 0], [0, 1], [1, 0]));
    });
  });
});