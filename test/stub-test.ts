import chai, { expect } from 'chai';
import { describe, it } from 'mocha';

import chaiAsPromised from 'chai-as-promised';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('Stub', () => {
  it('stub', async () => {
    expect(1, 'stub').to.be.equal(1);
  });
});
