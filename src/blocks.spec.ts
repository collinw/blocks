import * as blocks from './blocks';
import * as util from './util';
import { assert, expect } from 'chai';
import 'mocha';

describe('GetBoardState', () => {

  it('should work', () => {
    // Deliberately position both players on the edge of the board so that we verify
    // no off-the-board positions are generated.
    const board = blocks.NewBoard();
    board.Set(0, 1, 2);
    board.Set(0, 0, 3);

    // A player with no pieces on the board. In the real game, we
    // simply hardcode the initial set of inputs for each player.
    let [startPoints, exclude] = blocks.GetBoardState(board, 1);
    expect(startPoints.Size()).to.equal(0);
    expect(exclude).to.deep.equal(new util.CoordSet([0, 0], [0, 1]));

    [startPoints, exclude] = blocks.GetBoardState(board, 2);
    expect(startPoints).to.deep.equal(new util.CoordSet([1, 0], [1, 2]));
    expect(exclude).to.deep.equal(new util.CoordSet([0, 0], [0, 1], [0, 2], [1, 1]));

    [startPoints, exclude] = blocks.GetBoardState(board, 3);
    expect(startPoints).to.deep.equal(new util.CoordSet([1, 1]));
    expect(exclude).to.deep.equal(new util.CoordSet([0, 0], [0, 1], [1, 0]));
  });
});