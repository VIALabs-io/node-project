import axios from 'axios';
import inquirer from 'inquirer';
import { ethers } from 'ethers';
import fs from 'fs';
import chalk from 'chalk';
import chainsConfig from "@vialabs-io/contracts/config/chains.js";

const CHAIN_INFO_URL = 'https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/eip155-';
const RPC_TIMEOUT_MS = 10000; // 10 seconds

async function fetchChainInfo(chainId: string): Promise<any> {
    try {
        const response = await axios.get(`${CHAIN_INFO_URL}${chainId}.json`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chain info for ID ${chainId}: ${error}`);
        return null;
    }
}

async function testRpcUrl(rpcUrl: string): Promise<{ valid: boolean, latestBlock?: number }> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const latestBlockPromise = provider.getBlockNumber();

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('RPC request timed out')), RPC_TIMEOUT_MS)
        );

        const latestBlock = await Promise.race([latestBlockPromise, timeoutPromise]);

        return { valid: true, latestBlock };
    } catch (error) {
        return { valid: false };
    }
}

function loadExistingConfig(fileName: string): any {
    if (fs.existsSync(fileName)) {
        return JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }
    return {};
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function configureChains() {
    const { networkType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'networkType',
            message: 'Are you configuring for Mainnet or Testnet?',
            choices: ['Mainnet', 'Testnet'],
        }
    ]);

    const configFileName = networkType.toLowerCase() === 'mainnet' ? 'chain-mainnet.config.json' : 'chain-testnet.config.json';
    const existingConfig = loadExistingConfig(configFileName);
    const updatedConfig = { ...existingConfig };

    for (const chainId in chainsConfig) {
        const chain = chainsConfig[chainId];
        const chainName = chain.name.toLowerCase().replace(/\s+/g, '-');
        if ((networkType.toLowerCase() === 'mainnet' && chain.network !== 'mainnet') ||
            (networkType.toLowerCase() === 'testnet' && chain.network !== 'testnet')) {
            continue;
        }

        if (existingConfig[chainName]) {
            console.log(`Skipping ${chain.name} (${chainId}) - already configured.`);
            continue;
        }

        console.log(`\nConfiguring chain: ${chain.name} (${chainId})`);
        const chainInfo = await fetchChainInfo(chainId);

        if (chainInfo && chainInfo.rpc && chainInfo.rpc.length > 0) {
            const validRpcs: { name: string, value: string }[] = [];
            const invalidRpcs: string[] = [];

            for (let i = 0; i < chainInfo.rpc.length; i++) {
                const rpcUrl = chainInfo.rpc[i];
                const { valid, latestBlock } = await testRpcUrl(rpcUrl);

                if (valid) {
                    validRpcs.push({ name: `${rpcUrl}`, value: rpcUrl });
                } else {
                    invalidRpcs.push(`${chalk.red(rpcUrl)} - ${chalk.red('Invalid')}`);
                }
            }

            if (validRpcs.length === 0) {
                console.log(chalk.yellow(`No valid RPC URLs found for ${chain.name}.`));

                const { customRpcUrl } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'customRpcUrl',
                        message: `Enter a custom RPC URL for ${chain.name} (press enter to skip):`,
                        validate: async (input: string) => {
                            if (!input) return true; // Allow skipping
                            const { valid } = await testRpcUrl(input);
                            return valid || 'Invalid RPC URL';
                        }
                    }
                ]);

                if (!customRpcUrl) {
                    console.log(`Skipping configuration for ${chain.name}.`);
                    continue;
                }

                updatedConfig[chainName] = {
                    id: chainId,
                    type: "EVMMV3",
                    name: chainName,
                    rpc: customRpcUrl,
                };

            } else {
                shuffleArray(validRpcs); // Randomize the order of valid RPCs

                const choices = [...validRpcs.map(rpc => rpc.name), 'Custom RPC URL', 'Skip this chain'];

                const { rpcSelection } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'rpcSelection',
                        message: `Select an RPC URL for ${chain.name} or enter a custom URL:`,
                        choices: choices,
                        filter: function (val: string) {
                            return validRpcs.find(rpc => rpc.name === val)?.value || val;
                        }
                    }
                ]);

                if (rpcSelection === 'Skip this chain') {
                    console.log(`Skipping configuration for ${chain.name}.`);
                    continue;
                }

                let finalRpcUrl = rpcSelection;
                if (rpcSelection === 'Custom RPC URL') {
                    const { customRpcUrl } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'customRpcUrl',
                            message: 'Enter your custom RPC URL:',
                            validate: async (input: string) => {
                                const { valid } = await testRpcUrl(input);
                                return valid || 'Invalid RPC URL';
                            }
                        }
                    ]);
                    finalRpcUrl = customRpcUrl;
                }

                updatedConfig[chainName] = {
                    id: chainId,
                    type: "EVMMV3",
                    name: chainName,
                    rpc: finalRpcUrl,
                };
            }

        } else {
            console.log(`No RPC URLs available for ${chain.name}.`);
        }
    }

    fs.writeFileSync(configFileName, JSON.stringify(updatedConfig, null, 2));
    console.log(`Configuration saved to ${configFileName}`);
    process.exit(0); // Terminate after writing the config file
}

configureChains().catch(console.error);
