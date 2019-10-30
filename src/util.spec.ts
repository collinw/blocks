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
    let mat = util.Matrix.From2DArray([]);
    expect(mat.M).to.equal(0);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[]");

    mat = util.Matrix.From2DArray([[]]);
    expect(mat.M).to.equal(1);
    expect(mat.N).to.equal(0);
    expect(mat.toString()).to.equal("[[]]");

    mat = util.Matrix.From2DArray([[1, 2], [3, 4], [5, 6]]);
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

    m = util.Matrix.From2DArray(
      [[1, 2],
       [3, 4],
       [5, 6]]);
    result = m.Flip();
    expect(result).to.deep.equal(util.Matrix.From2DArray(
      [[5, 6],
       [3, 4],
       [1, 2]]));

    m = util.Matrix.From2DArray(
      [[1, 2],
       [3, 4],
       [5, 6],
       [7, 8]]);
    result = m.Flip();
    expect(result).to.deep.equal(util.Matrix.From2DArray(
      [[7, 8],
       [5, 6],
       [3, 4],
       [1, 2]]));
    // Regression test: the original matrix should not have been modified.
    expect(m).to.deep.equal(util.Matrix.From2DArray(
      [[1, 2],
       [3, 4],
       [5, 6],
       [7, 8]]));
  });

  it('can rotate clockwise', () => {
    let m = util.Matrix.Zero(0, 0);
    let result = m.RotateClockwise();
    expect(result).to.deep.equal(util.Matrix.Zero(0, 0));

    m = util.Matrix.From2DArray(
      [[1, 2],
       [3, 4],
       [5, 6]]);
    result = m.RotateClockwise();
    expect(result).to.deep.equal(util.Matrix.From2DArray(
      [[5, 3, 1],
       [6, 4, 2]]));

    m = util.Matrix.From2DArray(
      [[1],
       [2],
       [3],
       [4]]);
    result = m.RotateClockwise();
    expect(result).to.deep.equal(util.Matrix.From2DArray(
      [[4, 3, 2, 1]]));

    // Round-trip. Four rotations should get us back to the original data.
    m = util.Matrix.From2DArray(
      [[1],
       [2],
       [3],
       [4]]);
    result = m.RotateClockwise().RotateClockwise().RotateClockwise().RotateClockwise();
    expect(result).to.deep.equal(util.Matrix.From2DArray(
      [[1],
       [2],
       [3],
       [4]]));
  });

  it('can be copied', () => {
    const orig = util.Matrix.From2DArray([[1]]);
    const copy = orig.Copy();
    expect(orig).to.deep.equal(copy);

    // We should be able to modify the copy without modifying the original.
    copy.Set(0, 0, 5);
    expect(orig.toString()).to.equal('[[1]]');
    expect(copy.toString()).to.equal('[[5]]');
  });

  it('stringifies as expected', () => {
    // Variations on zero-length matrices.
    let m = util.Matrix.Zero(0, 0);
    expect(m.toString()).to.equal("[]");
    m = util.Matrix.Zero(1, 0);
    expect(m.toString()).to.equal("[[]]");
    m = util.Matrix.Zero(3, 1);
    expect(m.toString()).to.equal("[[0], [0], [0]]");
    m = util.Matrix.Zero(1, 3);
    expect(m.toString()).to.equal("[[0, 0, 0]]");

    m = util.Matrix.From2DArray(
      [[1],
       [2],
       [3],
       [4]]);
    expect(m.toString()).to.equal("[[1], [2], [3], [4]]");

    m = util.Matrix.From2DArray(
      [[1, 2],
       [3, 4],
       [5, 6]]);
    expect(m.toString()).to.equal("[[1, 2], [3, 4], [5, 6]]");
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

  it('should support basic set operations', () => {
    const s = new util.CoordSet();
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
    let set = new util.CoordSet();
    let result = set.Difference(new util.CoordSet());
    expect(result).to.deep.equal(new util.CoordSet());

    // The other set is empty.
    set = new util.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new util.CoordSet());
    expect(result).to.deep.equal(new util.CoordSet([1, 2], [3, 4]));

    // This set is empty, the other set has values.
    set = new util.CoordSet();
    result = set.Difference(new util.CoordSet([1, 2], [3, 4]));
    expect(result).to.deep.equal(new util.CoordSet());

    // Both sets have values, but they are disjoint.
    set = new util.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new util.CoordSet([5, 6]));
    expect(result).to.deep.equal(new util.CoordSet([1, 2], [3, 4]));

    // Both sets have values, but they have a non-null intersection.
    set = new util.CoordSet([1, 2], [3, 4]);
    result = set.Difference(new util.CoordSet([3, 4]));
    expect(result).to.deep.equal(new util.CoordSet([1, 2]));
  });
});

describe('RandomElement', () => {

  it('should handle empty arrays', () => {
    expect(() => util.RandomElement([])).to.throw('Array is empty');
  });
});

describe('TruncateNumber', () => {

  it('should not corrupt shorter numbers', () => {
    expect(util.TruncateNumber(1.3, 3)).to.equal(1.3);
  });

  it('should actually truncate', () => {
    expect(util.TruncateNumber(1 / 3, 3)).to.equal(0.333);
  });

  it('should handle zero digits', () => {
    expect(util.TruncateNumber(10 / 3, 0)).to.equal(3);
  });
});