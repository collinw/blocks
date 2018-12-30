import * as blocks from './blocks';
import { assert, expect } from 'chai';
import 'mocha';

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