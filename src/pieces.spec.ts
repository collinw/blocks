import * as pieces from './pieces';
import { assert, expect } from 'chai';
import 'mocha';

describe('Pieces', () => {

  it('can generate piece form variants', () => {
    // There is only one form of this piece.
    let canonical = new pieces.PieceForm([
      [1, 1],
      [1, 1],
    ]);
    let variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      new pieces.PieceForm([[1, 1],
                            [1, 1]])
    ]));

    // This piece can go either vertically or horizontally.
    canonical = new pieces.PieceForm([
      [1, 2, 2, 1],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      new pieces.PieceForm([[1, 2, 2, 1]]),
      new pieces.PieceForm([[1],
                            [2],
                            [2],
                            [1]])
    ]));

    canonical = new pieces.PieceForm([
      [1, 2, 1],
      [0, 1, 0],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      new pieces.PieceForm([
        [1, 2, 1],
        [0, 1, 0],
      ]),
      new pieces.PieceForm([
        [0, 1],
        [1, 2],
        [0, 1],
      ]),
      new pieces.PieceForm([
        [0, 1, 0],
        [1, 2, 1],
      ]),
      new pieces.PieceForm([
        [1, 0],
        [2, 1],
        [1, 0],
      ]),
    ]));

    canonical = new pieces.PieceForm([
      [0, 1, 0],
      [0, 2, 1],
      [1, 1, 0],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      new pieces.PieceForm([
        [0, 1, 0],
        [0, 2, 1],
        [1, 1, 0],
      ]),
      new pieces.PieceForm([
        [1, 0, 0],
        [1, 2, 1],
        [0, 1, 0],
      ]),
      new pieces.PieceForm([
        [0, 1, 1],
        [1, 2, 0],
        [0, 1, 0],
      ]),
      new pieces.PieceForm([
        [0, 1, 0],
        [1, 2, 1],
        [0, 0, 1],
      ]),
      new pieces.PieceForm([
        [1, 1, 0],
        [0, 2, 1],
        [0, 1, 0],
      ]),
      new pieces.PieceForm([
        [0, 1, 0],
        [1, 2, 1],
        [1, 0, 0],
      ]),
      new pieces.PieceForm([
        [0, 1, 0],
        [1, 2, 0],
        [0, 1, 1],
      ]),
      new pieces.PieceForm([
        [0, 0, 1],
        [1, 2, 1],
        [0, 1, 0],
      ]),
    ]));
    expect(variants.Size()).to.equal(8);
  });
});