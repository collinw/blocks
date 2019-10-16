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

describe('ScoresToRanking', () => {

  it('should handle simple rankings', () => {
    const scores = new blocks.Scores();
    scores.Get(1).points = 6;  // First
    scores.Get(3).points = 5;  // Second
    scores.Get(2).points = 1;  // Third
    scores.Get(4).points = 0;  // Fourth

    const ranking = blocks.ScoresToRanking(scores);
    expect(ranking.size).to.equal(4);
    expect(ranking.Get(1)).to.equal(1);  // First
    expect(ranking.Get(2)).to.equal(3);  // Third
    expect(ranking.Get(3)).to.equal(2);  // Second
    expect(ranking.Get(4)).to.equal(4);  // Fourth
  });

  it('should handle ties', () => {
    const scores = new blocks.Scores();
    scores.Get(3).points =  5;  // Second (tie)
    scores.Get(2).points = 5;  // Second (tie)
    scores.Get(4).points = 0;  // Third
    scores.Get(1).points = 6;  // First

    const ranking = blocks.ScoresToRanking(scores);
    expect(ranking.size).to.equal(4);
    expect(ranking.Get(1)).to.equal(1);  // First
    expect(ranking.Get(2)).to.equal(2);  // Second
    expect(ranking.Get(3)).to.equal(2);  // Second
    expect(ranking.Get(4)).to.equal(4);  // Fourth
  });

  it('should break ties based on pieces remaining', () => {
    const scores = new blocks.Scores();
    scores.Get(3).points =  5;  // Second (tie) on points, third on pieces.
    scores.Get(3).pieces = 3;
    scores.Get(2).points = 5;  // Second (tie) on points, second on pieces.
    scores.Get(2).pieces = 2;
    scores.Get(4).points = 0;  // Fourth
    scores.Get(1).points = 6;  // First

    const ranking = blocks.ScoresToRanking(scores);
    expect(ranking.size).to.equal(4);
    expect(ranking.Get(1)).to.equal(1);  // First
    expect(ranking.Get(2)).to.equal(2);  // Second
    expect(ranking.Get(3)).to.equal(3);  // Third
    expect(ranking.Get(4)).to.equal(4);  // Fourth
  });

  it('should handle 3-way ties', () => {
    const scores = new blocks.Scores();
    scores.Get(3).points = 5;
    scores.Get(2).points = 3;
    scores.Get(4).points = 5;
    scores.Get(1).points = 5;

    const ranking = blocks.ScoresToRanking(scores);
    expect(ranking.size).to.equal(4);
    expect(ranking.Get(1)).to.equal(1);  // First
    expect(ranking.Get(2)).to.equal(4);  // Fourth
    expect(ranking.Get(3)).to.equal(1);  // First
    expect(ranking.Get(4)).to.equal(1);  // First
  });

  it('should handle 4-way ties', () => {
    const scores = new blocks.Scores();
    scores.Get(3).points = 0;
    scores.Get(3).pieces = 0;
    scores.Get(2).points = 0;
    scores.Get(2).pieces = 0;
    scores.Get(4).points = 0;
    scores.Get(4).pieces = 0;
    scores.Get(1).points = 0;
    scores.Get(1).pieces = 0;

    const ranking = blocks.ScoresToRanking(scores);
    expect(ranking.size).to.equal(4);
    expect(ranking.Get(1)).to.equal(1);  // First
    expect(ranking.Get(2)).to.equal(1);  // First
    expect(ranking.Get(3)).to.equal(1);  // First
    expect(ranking.Get(4)).to.equal(1);  // First
  });
});