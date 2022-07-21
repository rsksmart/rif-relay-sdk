import { DefaultRelayingServices, RelayingResult } from '../src';
import Web3 from 'web3';
import {
    EnvelopingConfig,
    EnvelopingTransactionDetails
} from '@rsksmart/rif-relay-common';
import { RelayingServicesAddresses } from '../src/interfaces';
import { Contracts } from '../src/contracts';
import { AbiItem } from 'web3-utils';
import {
    DEFAULT_WEB3_MOCK_CONFIGURATION,
    EMPTY_CODE,
    MOCK_ADDRESS,
    MOCK_CODE,
    MOCK_RELAYING_RESULT,
    MOCK_SMART_WALLET_ADDRESS,
    MOCK_TRANSACTION_RECEIPT
} from './constants';
import { Account, TransactionReceipt } from 'web3-core';

declare const jest: any;

const MOCKS = {
    sendTransaction: jest.fn().mockReturnValue(MOCK_TRANSACTION_RECEIPT)
};

export interface Web3MockConfiguration {
    getCodeEmpty?: boolean;
}

export class Web3MethodsMock {
    constructor(private abi: AbiItem, private address: string) {}
    public getSmartWalletAddress(
        address: string,
        recoverer: string,
        smartWalletIndex: number
    ) {
        console.debug('getSmartWalletAddress', {
            address,
            recoverer,
            smartWalletIndex
        });
        return {
            call: () => {
                return MOCK_SMART_WALLET_ADDRESS;
            }
        };
    }
    public balanceOf(address: string) {
        console.debug('balanceOf', {
            address
        });
        return {
            call: () => {
                return 0;
            }
        };
    }
    public acceptsToken(address: string) {
        console.debug('acceptsToken', {
            address
        });
        return {
            call: () => {
                return true;
            }
        };
    }
    public getAcceptedTokens() {
        console.debug('getAcceptedTokens');
        return {
            call: () => {
                return [MOCK_ADDRESS];
            }
        };
    }
    async generateSmartWallet(smartWalletIndex: number) {
        console.debug('generateSmartWallet');
        return {
            call: () => {
                return {
                    address: MOCK_SMART_WALLET_ADDRESS,
                    index: smartWalletIndex,
                    deployed: true
                };
            }
        };
    }
}

export class Web3ContractMock {
    methods: Web3MethodsMock;
    constructor(abi: AbiItem, address: string) {
        console.debug('Contract Mock', address);
        this.methods = new Web3MethodsMock(abi, address);
    }
}

export class Web3AbiMock {
    encodeFunctionCall: any = (abiItem: AbiItem, params: string[]): string => {
        console.debug('encodeFunctionCall', {
            abiItem,
            params
        });
        return 'encodedCall';
    };
}

export class Web3EthMock {
    constructor(private configuration: Web3MockConfiguration) {}
    sendSignedTransaction: any = MOCKS.sendTransaction;
    sendTransaction: any = MOCKS.sendTransaction;
    Contract = Web3ContractMock;
    getCode = (address: string): Promise<string> => {
        console.debug('getCode', {
            address
        });
        return this.configuration.getCodeEmpty
            ? Promise.resolve(EMPTY_CODE)
            : Promise.resolve(MOCK_CODE);
    };
    abi: Web3AbiMock = new Web3AbiMock();
    getTransactionReceipt = (
        hash: string,
        callback: any
    ): Promise<TransactionReceipt> => {
        console.debug('getTransactionReceipt', {
            hash,
            callback
        });
        return Promise.resolve(MOCK_TRANSACTION_RECEIPT);
    };
}
export class Web3UtilsMock {
    constructor(private configuration: Web3MockConfiguration) {}
    async toWei() {
        console.debug('getAllowedTokens');
        return {
            call: () => {
                return [MOCK_SMART_WALLET_ADDRESS];
            }
        };
    }
}

export class Web3Mock {
    eth: Web3EthMock;
    utils: Web3UtilsMock;
    constructor(private configuration: Web3MockConfiguration) {
        this.eth = new Web3EthMock(configuration);
        this.utils = new Web3UtilsMock(configuration);
    }
}

const web3Mock: Web3 = new Web3Mock(DEFAULT_WEB3_MOCK_CONFIGURATION) as any;

export class MockContracts extends Contracts {
    constructor(web3Instance?: Web3) {
        super(web3Instance ? web3Instance : web3Mock, 33);
    }

    initialize(): void {
        console.debug('Initializing MockContracts');
        return super.initialize();
    }
}

export class MockRelayProvider {
    deploySmartWallet(
        transactionDetails: EnvelopingTransactionDetails
    ): Promise<RelayingResult> {
        console.debug('deploySmartWallet', {
            transactionDetails
        });
        return Promise.resolve(MOCK_RELAYING_RESULT);
    }
    async _ethSendTransaction() {
        console.debug('_ethSendTransaction');
        return {
            call: () => {
                return MOCK_RELAYING_RESULT;
            }
        };
    }
}

export class MockRelayingServices extends DefaultRelayingServices {
    constructor(web3Instance?: Web3) {
        const web3 = new Web3();
        web3.eth = new Web3EthMock(DEFAULT_WEB3_MOCK_CONFIGURATION) as any;
        web3.utils = new Web3UtilsMock(DEFAULT_WEB3_MOCK_CONFIGURATION) as any;
        super(web3Instance ?? web3, <Account>{ address: MOCK_ADDRESS });
    }

    public async initialize(
        envelopingConfig: Partial<EnvelopingConfig>,
        contractAddresses?: RelayingServicesAddresses
    ): Promise<void> {
        console.debug('Init Relaying Services Mock', {
            envelopingConfig,
            contractAddresses,
            web3: this['web3Instance']
        });
        this['contracts'] = new MockContracts(this['web3Instance']);
        this['relayProvider'] = new MockRelayProvider() as any;
        return Promise.resolve();
    }

    async allowToken(tokenAddress: string): Promise<string> {
        console.debug('_ethSendTransaction');
        return tokenAddress;
    }
}
