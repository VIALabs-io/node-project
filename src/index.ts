import dotenv from 'dotenv';
import { Vladiator } from "@vialabs-io/node-core/Vladiator";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.NODE_PRIVATE_KEY) {
    console.error('ERROR: NODE_PRIVATE_KEY is invalid, please check .env');
    process.exit(1);
}

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
console.log(`${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"} MODE`);

const configFileName = isDevelopment ? 'chain-testnet.config.json' : 'chain-mainnet.config.json';
const configFilePath = path.resolve(__dirname, '..', configFileName);

if (!fs.existsSync(configFilePath)) {
    console.error(`ERROR: Configuration file ${configFileName} does not exist.`);
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

const vladiator = new Vladiator(process.env.NODE_PRIVATE_KEY, config);
