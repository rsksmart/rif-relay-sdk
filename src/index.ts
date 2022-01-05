/**
 * It represents an SmartWallet, contains the index and the address of the Smart Wallet
 */
import { TransactionReceipt } from 'web3-core';
import { DefaultRelayingServices } from './sdk';
import { PrefixedHexString } from 'ethereumjs-tx';
import {
    RelayGasEstimationOptions,
    RelayingServicesAddresses,
    RelayingServicesConfiguration,
    RelayingTransactionOptions,
    SmartWallet,
    SmartWalletDeploymentOptions
} from './interfaces';
import {
    EnvelopingConfig,
    EnvelopingTransactionDetails
} from '@rsksmart/rif-relay-common';
import { RelayingResult } from '@rsksmart/rif-relay-client';

interface RelayingServices {
    /**
     * This operation initialize the realying service sdk.
     *
     * @param envelopingConfig the partial enveloping configuration
     * @param contractAddresses the contract addresses optional
     */
    initialize(
        envelopingConfig: Partial<EnvelopingConfig>,
        contractAddresses?: RelayingServicesAddresses
    ): Promise<void>;

    /**
     * This operation generates an smart wallet for the specified index.
     *
     * @param smartWalletIndex the number of the smart wallet index, anything >= 0
     * @returns the SmartWallet object containing the generated address
     */
    generateSmartWallet(smartWalletIndex: number): Promise<SmartWallet>;

    /**
     * Determine if the provided address represents a deployed SmartWallet
     *
     * @param smartWalletAddress the SmartWallet address to check
     * @returns boolean true if the SmartWallet exists and is deployed, false otherwise
     */
    isSmartWalletDeployed(smartWalletAddress: string): Promise<boolean>;

    /**
     * It deploy an SmartWallet to make it usable to relay transactions. This operation can be subsidized if you
     * don't set the tokenAddress and tokenAmount
     *
     * @param smartWallet the SmartWallet containing the address and the index to deploy
     * @param tokenAddress Optional tokenAddress to pay for the deploy transaction.
     * If not set the deploy will be subsidized and the user will need to fund the smart wallet for non subsidized
     * relay transactions. The tokenAddress should be allowed by the verifiers in order to work properly.
     * @param tokenAmount Optional tokenAmount to pay for the deploy transaction. If not set the deploy will be
     * subsidized and the user will need to fund the smart wallet for non subsidized relay transactions.
     * @returns string that represents the transaction hash for the deploy transaction
     */
    deploySmartWallet(
        smartWallet: SmartWallet,
        options?: SmartWalletDeploymentOptions
    ): Promise<SmartWallet>;

    /**
     * It attempts to relay a transaction using the provided SmartWallet and optional token. If token is not specified
     * the relay will be subsidized.
     *
     * @param unsignedTx the original non-signed transaction to be relayed
     * @param smartWallet the smart wallet to be used for the relaying process
     * @param tokenAmount the Optional tokenAmount to pay for the relaying of the transaction. If not set the transaction
     * will be subsidized.
     * @param collectorContract the contract to collect paid fees. If not set the worker will be payed.
     */
    relayTransaction(
        options: RelayingTransactionOptions
    ): Promise<RelayingResult>;

    /**
     * It checks if the provided tokenAddress is allowed by the rif relay verifiers.
     *
     * @param tokenAddress the token address to check for allowance
     * @returns boolean true if the tokenAddress is allowed by the verifiers or false otherwise
     */
    isAllowedToken(tokenAddress: string): Promise<boolean>;

    /**
     * Retrieves all the allowed tokens supported by the relaying system.
     *
     * @returns string[] a list of all the token addresses that are allowed by the relaying system.
     */
    getAllowedTokens(): Promise<string[]>;

    /**
     * It executes the allowance for a specified token using the relaying services contract owner account.
     *
     * @param tokenAddress the token address to mark as allowed by the relaying services system.
     * @param contractsOwnerAccount the owner account of the relaying services contracts
     */
    allowToken(tokenAddress: string, account: string): Promise<string>;

    /**
     * It executes a claim for a commitmentReceipt, this is to penalize a
     * relay manager when it doesn't fulfil the commited transaction.
     *
     * @param commitmentReceipt the commitment receipt of the commited transaction
     */
    claim(commitmentReceipt: any): Promise<void>;

    /**
     * It executes a estimate max possible relay gas to get a number value
     *
     * @param trxDetails details of the transaction to be used to calculate gas
     * @param relayWorker the realy worker contract address
     */
    estimateMaxPossibleRelayGas(
        options: RelayGasEstimationOptions
    ): Promise<string>;

    /**
     * It executes a estimate max possible relay gas relay with linear fit to get a number value
     *
     * @param destinationContract destination contract address
     * @param smartWalletAddress smart wallet address to all forwarder transaction
     * @param tokenFees amount of token that cost the transaction
     * @param abiEncodedTx Abi encoding transaction details
     * @param relayWorker the realy worker contract address
     */
    estimateMaxPossibleRelayGasWithLinearFit(
        options: RelayGasEstimationOptions
    ): Promise<string>;

    /**
     * It looks for the transaction receipt of a transaction hash
     *
     * @param transactionHash transaction hash to look for the receipt
     * @param retries amount of times that would retry for the receipt
     * @param initialBackoff initial time to wait before each retry, this time would be double on each attemp
     */
    getTransactionReceipt(
        transactionHash: PrefixedHexString,
        retries?: number,
        initialBackoff?: number
    ): Promise<TransactionReceipt>;
}

export {
    RelayingServices,
    DefaultRelayingServices,
    RelayingServicesConfiguration,
    SmartWallet,
    RelayingTransactionOptions,
    RelayGasEstimationOptions,
    SmartWalletDeploymentOptions,
    RelayingServicesAddresses,
    RelayingResult,
    EnvelopingTransactionDetails,
    EnvelopingConfig
};
