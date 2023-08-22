import { before } from 'mocha';
import { started } from '../src';

before(async () => {
  await started;
});
