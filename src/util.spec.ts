import * as util from './util';
import { assert, expect } from 'chai';
import 'mocha';

class CoordSet extends util.DeepSet<[number, number]> {
  constructor(...data: Array<[number, number]>) {
    super(data);
  }
}

describe('CoordSet', () => {

  it('should support basic set operations', () => {
    const s = new CoordSet();
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
    let set = new CoordSet();
    let result = set.Difference(new CoordSet());
    expect(result).to.deep.equal(new CoordSet());

    // The other set is empty.
    set = new CoordSet([1, 2], [3, 4]);
    result = set.Difference(new CoordSet());
    expect(result).to.deep.equal(new CoordSet([1, 2], [3, 4]));

    // This set is empty, the other set has values.
    set = new CoordSet();
    result = set.Difference(new CoordSet([1, 2], [3, 4]));
    expect(result).to.deep.equal(new CoordSet());

    // Both sets have values, but they are disjoint.
    set = new CoordSet([1, 2], [3, 4]);
    result = set.Difference(new CoordSet([5, 6]));
    expect(result).to.deep.equal(new CoordSet([1, 2], [3, 4]));

    // Both sets have values, but they have a non-null intersection.
    set = new CoordSet([1, 2], [3, 4]);
    result = set.Difference(new CoordSet([3, 4]));
    expect(result).to.deep.equal(new CoordSet([1, 2]));
  });
});