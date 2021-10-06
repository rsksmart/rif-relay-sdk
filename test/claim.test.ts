import { RelayingServices } from '../src';
import { MockRelayingServices } from './mock';
import Expect = jest.Expect;

declare const expect: Expect;

describe('Tests for claim operation', () => {
    let sdk: RelayingServices;

    beforeEach(async () => {
        sdk = new MockRelayingServices();
        await sdk.initialize({});
    });

    it('Should fail by not implemented error', async () => {
        try {
            await sdk.claim({});
            fail('The claim operation was expected to fail in this version of SDK, but it didn't');
        } catch (error: any) {
            expect(error.message).toBe(
                'NOT IMPLEMENTED: this will be available with arbiter integration.'
            );
        }
    });
});
