import * as pieces from './pieces';
import { assert, expect } from 'chai';
import 'mocha';

describe('Pieces', () => {

  it('can generate piece form variants', () => {
    // There is only one form of this piece.
    let canonical = pieces.PieceForm.From2DArray([
      [1, 1],
      [1, 1],
    ]);
    let variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      pieces.PieceForm.From2DArray([[1, 1],
                                    [1, 1]])
    ]));

    // This piece can go either vertically or horizontally.
    canonical = pieces.PieceForm.From2DArray([
      [1, 2, 2, 1],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      pieces.PieceForm.From2DArray([[1, 2, 2, 1]]),
      pieces.PieceForm.From2DArray([[1],
                                    [2],
                                    [2],
                                    [1]])
    ]));

    canonical = pieces.PieceForm.From2DArray([
      [1, 2, 1],
      [0, 1, 0],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      pieces.PieceForm.From2DArray([
        [1, 2, 1],
        [0, 1, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1],
        [1, 2],
        [0, 1],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1, 0],
        [1, 2, 1],
      ]),
      pieces.PieceForm.From2DArray([
        [1, 0],
        [2, 1],
        [1, 0],
      ]),
    ]));

    canonical = pieces.PieceForm.From2DArray([
      [0, 1, 0],
      [0, 2, 1],
      [1, 1, 0],
    ]);
    variants = pieces.GenerateVariants(canonical);
    expect(variants).to.deep.equal(new pieces.PieceFormSet([
      pieces.PieceForm.From2DArray([
        [0, 1, 0],
        [0, 2, 1],
        [1, 1, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [1, 0, 0],
        [1, 2, 1],
        [0, 1, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1, 1],
        [1, 2, 0],
        [0, 1, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1, 0],
        [1, 2, 1],
        [0, 0, 1],
      ]),
      pieces.PieceForm.From2DArray([
        [1, 1, 0],
        [0, 2, 1],
        [0, 1, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1, 0],
        [1, 2, 1],
        [1, 0, 0],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 1, 0],
        [1, 2, 0],
        [0, 1, 1],
      ]),
      pieces.PieceForm.From2DArray([
        [0, 0, 1],
        [1, 2, 1],
        [0, 1, 0],
      ]),
    ]));
    expect(variants.Size()).to.equal(8);
  });
});