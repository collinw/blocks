import * as pieces from './pieces';
import { assert, expect } from 'chai';
import 'mocha';

describe('Pieces', () => {

  it('can generate piece form variants', () => {
    const canonical = new pieces.PieceForm([
      [1, 1, 0],
      [0, 2, 1],
      [0, 1, 0]
    ]);

    const variants = pieces.GenerateVariants(canonical);
    expect(variants.length).to.equal(8);
  });
});