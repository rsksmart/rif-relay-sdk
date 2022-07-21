import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import { RelayingResult, RelayingServices, SmartWallet } from '../src';
import { RelayingTransactionOptions } from '../src/interfaces';
import {
    MOCK_ACCOUNT,
    MOCK_ADDRESS,
    MOCK_CONTRACT_ADDRESS,
    MOCK_SMART_WALLET_ADDRESS,
    MOCK_TOKEN_ADDRESS,
    MOCK_RELAYING_RESULT
} from './constants';
import { MockRelayingServices, Web3EthMock, Web3UtilsMock } from './mock';
import Expect = jest.Expect;

declare const expect: Expect;

describe('Deployed SDK tests', () => {
    let sdk: RelayingServices;

    beforeEach(async () => {
        sdk = new MockRelayingServices();
        await sdk.initialize({});
    });

    it('Should perform a claim operation', async () => {
        try {
            await sdk.claim({});
            fail(
                "The claim operation was expected to fail in this version of SDK, but it didn't"
            );
        } catch (error: any) {
            expect(error.message).toBe(
                'NOT IMPLEMENTED: this will be available with arbiter integration.'
            );
        }
    });

    it('Should allow a token', async () => {
        try {
            const allowedToken = await sdk.allowToken(
                MOCK_TOKEN_ADDRESS,
                MOCK_ACCOUNT.address
            );
            expect(allowedToken).toEqual(MOCK_TOKEN_ADDRESS);
        } catch (error: any) {
            fail('The allow token call was unsuccessful:' + error.message);
        }
    });

    it('Should get the allowed tokens', async () => {
        try {
            const allowTokens = await sdk.getAllowedTokens();
            expect(allowTokens.length).toBeGreaterThan(0);
            expect([MOCK_ADDRESS]).toEqual(expect.arrayContaining(allowTokens));
        } catch (error) {
            fail('The allow token operation failed');
        }
    });

    it('Should return True if provided token is allowed', async () => {
        try {
            const allowTokens = await sdk.isAllowedToken(MOCK_TOKEN_ADDRESS);
            expect(allowTokens).toBeTruthy();
        } catch (error) {
            fail('The token is not allow');
        }
    });

    it('Should fail when deploying a Smart Wallet', async () => {
        try {
            await sdk.deploySmartWallet(
                {
                    address: MOCK_SMART_WALLET_ADDRESS,
                    index: 0
                },
                {
                    tokenAddress: MOCK_TOKEN_ADDRESS
                }
            );
            fail('The smart wallet is already deployed');
        } catch (error: any) {
            expect(error.message).toBe('Smart Wallet already deployed');
        }
    });

    it('Should generate a Smart Wallet', async () => {
        const smallWalletIndex = 0;
        const smartWallet = await sdk.generateSmartWallet(smallWalletIndex);
        expect(smartWallet.address).toEqual(MOCK_SMART_WALLET_ADDRESS);
        expect(smartWallet.index).toEqual(smallWalletIndex);
    });

    it('Should not let deploy a Smart Wallet that is already deployed', async () => {
        try {
            await sdk.deploySmartWallet(
                {
                    address: MOCK_SMART_WALLET_ADDRESS,
                    index: 0
                },
                {
                    tokenAddress: MOCK_TOKEN_ADDRESS,
                    tokenAmount: 0
                }
            );
            fail("Smart wallet deployment expected to fail, but it didn't");
        } catch (error: any) {
            expect(error.message).toBe('Smart Wallet already deployed');
        }
    });

    it('Should return true if Smart Wallet is deployed', async () => {
        const deployed = await sdk.isSmartWalletDeployed(
            MOCK_SMART_WALLET_ADDRESS
        );
        expect(deployed).toBeTruthy();
    });
});

describe('SDK not deployed tests', () => {
    let sdk: RelayingServices;

    beforeEach(async () => {
        const web3 = new Web3();
        web3.eth = new Web3EthMock({
            getCodeEmpty: true
        }) as any;
        web3.utils = new Web3UtilsMock({
            getCodeEmpty: true
        }) as any;

        sdk = new MockRelayingServices(web3);
        await sdk.initialize({});
    });

    it('Should return False if Smart Wallet is not deployed', async () => {
        const deployed = await sdk.isSmartWalletDeployed(
            MOCK_SMART_WALLET_ADDRESS
        );
        expect(deployed).toBeFalsy();
    });

    it('Should deploy a Smart Wallet', async () => {
        const smartWallet: SmartWallet = await sdk.deploySmartWallet(
            {
                address: MOCK_SMART_WALLET_ADDRESS,
                index: 0
            },
            {
                tokenAddress: MOCK_TOKEN_ADDRESS
            }
        );
        const relayingResult: RelayingResult = MOCK_RELAYING_RESULT;
        const txHash: string = relayingResult.transaction
            .hash(true)
            .toString('hex');
        expect(smartWallet.address).toBe(MOCK_SMART_WALLET_ADDRESS);
        expect(smartWallet.index).toBe(0);
        expect(smartWallet.deployment.tokenAddress).toBe(MOCK_TOKEN_ADDRESS);
        expect(smartWallet.deployment.deployTransaction).toBe(txHash);
    });

    it('Should fail when relaying a Transaction', async () => {
        const smartWallet: SmartWallet = {
            address: MOCK_SMART_WALLET_ADDRESS,
            index: 0,
            deployment: { deployTransaction: '0', tokenAddress: '0' }
        };

        const unsignedTx: TransactionConfig = {
            from: MOCK_ADDRESS,
            to: MOCK_CONTRACT_ADDRESS,
            value: 1
        };

        const options: RelayingTransactionOptions = {
            smartWallet,
            unsignedTx,
            tokenAmount: 0,
            tokenAddress: MOCK_TOKEN_ADDRESS
        };

        try {
            await sdk.relayTransaction(options);
            fail('Relay transaction should have failed.');
        } catch (error: any) {
            expect(error.message).toBe(
                `Smart Wallet is not deployed or the address ${smartWallet.address} is not a smart wallet.`
            );
        }
    });
});
