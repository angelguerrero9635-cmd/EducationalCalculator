import { validateTaxonomy } from '../taxonomy';

describe('taxonomy', () => {
  it('validates with zero errors and zero warnings', () => {
    const { errors, warnings } = validateTaxonomy();
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
