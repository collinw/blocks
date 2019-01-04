import * as util from './util';
import { assert, expect } from 'chai';
import 'mocha';

// This is used only to make sure DeepSet can actually do
// deep equality testing on the objects going into it.
class PairSet extends util.DeepSet<[number, number]> {
  constructor(...data: Array<[number, number]>) {
    super(data);
  }
}

describe('DeepSet', () => {

  it('should support basic set operations', () => {
    const s = new PairSet();
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
    let set = new PairSet();
    let result = set.Difference(new PairSet());
    expect(result).to.deep.equal(new PairSet());

    // The other set is empty.
    set = new PairSet([1, 2], [3, 4]);
    result = set.Difference(new PairSet());
    expect(result).to.deep.equal(new PairSet([1, 2], [3, 4]));

    // This set is empty, the other set has values.
    set = new PairSet();
    result = set.Difference(new PairSet([1, 2], [3, 4]));
    expect(result).to.deep.equal(new PairSet());

    // Both sets have values, but they are disjoint.
    set = new PairSet([1, 2], [3, 4]);
    result = set.Difference(new PairSet([5, 6]));
    expect(result).to.deep.equal(new PairSet([1, 2], [3, 4]));

    // Both sets have values, but they have a non-null intersection.
    set = new PairSet([1, 2], [3, 4]);
    result = set.Difference(new PairSet([3, 4]));
    expect(result).to.deep.equal(new PairSet([1, 2]));
  });
});

describe('Matrix', () => {

  it('can be filled with zeros', () => {
    let mat = util.Matrix.Zero(0, 0);
    expect(mat.M).to.equal(0);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[]");

    mat = util.Matrix.Zero(1, 0);
    expect(mat.M).to.equal(1);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[[]]");

    mat = util.Matrix.Zero(3, 2);
    expect(mat.M).to.equal(3);
    expect(mat.N).to.equal(2);
    expect(mat.toString()).to.equal("[[0, 0], [0, 0], [0, 0]]");

    for (let m = 0; m < mat.M; m++) {
      for (let n = 0; n < mat.N; n++) {
        expect(mat.Get(m, n)).to.equal(0);
      }
    }
  });

  it('can be constructed from 2D array', () => {
    let mat = new util.Matrix([]);
    expect(mat.M).to.equal(0);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[]");

    mat = new util.Matrix([[]]);
    expect(mat.M).to.equal(1);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[[]]");

    mat = new util.Matrix([[1, 2], [3, 4], [5, 6]]);
    expect(mat.M).to.equal(3);
    expect(mat.N).to.equal(2);
    expect(mat.toString()).to.equal("[[1, 2], [3, 4], [5, 6]]");

    expect(mat.Get(0, 0)).to.equal(1);
    expect(mat.Get(0, 1)).to.equal(2);
    expect(mat.Get(1, 0)).to.equal(3);
    expect(mat.Get(1, 1)).to.equal(4);
    expect(mat.Get(2, 0)).to.equal(5);
    expect(mat.Get(2, 1)).to.equal(6);
  });

  it('can flip', () => {
    let m = util.Matrix.Zero(0, 0);
    let result = m.Flip();
    expect(result).to.deep.equal(util.Matrix.Zero(0, 0));

    m = new util.Matrix(
      [[1, 2],
       [3, 4],
       [5, 6]]);
    result = m.Flip();
    expect(result).to.deep.equal(new util.Matrix(
      [[5, 6],
       [3, 4],
       [1, 2]]));

    m = new util.Matrix(
      [[1, 2],
       [3, 4],
       [5, 6],
       [7, 8]]);
    result = m.Flip();
    expect(result).to.deep.equal(new util.Matrix(
      [[7, 8],
       [5, 6],
       [3, 4],
       [1, 2]]));
    // Regression test: the original matrix should not have been modified.
    expect(m).to.deep.equal(new util.Matrix(
      [[1, 2],
       [3, 4],
       [5, 6],
       [7, 8]]));
  });

  it('can rotate clockwise', () => {
    let m = util.Matrix.Zero(0, 0);
    let result = m.RotateClockwise();
    expect(result).to.deep.equal(util.Matrix.Zero(0, 0));

    m = new util.Matrix(
      [[1, 2],
       [3, 4],
       [5, 6]]);
    result = m.RotateClockwise();
    expect(result).to.deep.equal(new util.Matrix(
      [[5, 3, 1],
       [6, 4, 2]]));

    m = new util.Matrix(
      [[1],
       [2],
       [3],
       [4]]);
    result = m.RotateClockwise();
    expect(result).to.deep.equal(new util.Matrix(
      [[4, 3, 2, 1]]));

    // Round-trip. Four rotations should get us back to the original data.
    m = new util.Matrix(
      [[1],
       [2],
       [3],
       [4]]);
    result = m.RotateClockwise().RotateClockwise().RotateClockwise().RotateClockwise();
    expect(result).to.deep.equal(new util.Matrix(
      [[1],
       [2],
       [3],
       [4]]));
  });
});

describe('MatrixSet', () => {

  it('actually works as a set', () => {
    const ms = new util.MatrixSet([]);
    ms.Add(util.Matrix.Zero(2, 2));
    ms.Add(util.Matrix.Zero(2, 2));
    ms.Add(util.Matrix.Zero(4, 4));

    expect(ms.Size()).to.equal(2);
  });
});

describe('CoordSet', () => {

  it('actually works as a set', () => {
    const cs = new util.CoordSet();
    expect(cs.Size()).to.equal(0);
    expect(cs.Has([2, 2])).to.equal(false);

    cs.Add([2, 2]);
    cs.Add([2, 2]);
    cs.Add([4, 7]);

    expect(cs.Size()).to.equal(2);
    expect(cs.Has([2, 2])).to.equal(true);
    expect(cs.Has([2, 7])).to.equal(false);
  });
});

describe('RandomElement', () => {

  it('should handle empty arrays', () => {
    expect(() => util.RandomElement([])).to.throw('Array is empty');
  });
});
