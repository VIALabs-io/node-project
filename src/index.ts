import dotenv from 'dotenv';
import { Vladiator } from "@vialabs-io/node-core/Vladiator";

// Load environment variables from .env
dotenv.config();

// Determine if the environment is development or production
const isDevelopment: boolean = process.env.NODE_ENV === 'development';
console.log(`${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"} MODE`);

// Load the appropriate chain configuration based on the environment
const localConfig = await import(isDevelopment ? '../chains-testnet.json' : '../chains-mainnet.json').then(module => module.default);

// Check for the presence of the NODE_PRIVATE_KEY in the environment variables
if (!process.env.NODE_PRIVATE_KEY) {
    console.error('ERROR: NODE_PRIVATE_KEY is invalid, please check .env');
    process.exit(1);
}

try {
    const vladiator = new Vladiator(process.env.NODE_PRIVATE_KEY, localConfig);
    console.log("Initialized successfully.");

    let features;
    try {
        features = await import('./features/index.js').then(module => module.default);
    } catch (error) {
        console.error("Features module not found, continuing without features.");
    }

    if (features) {
        const keys = Object.keys(features);
        for (let i = 0; i < keys.length; i++) {
            vladiator.loadFeature(new features[Number(keys[i])]);
        }
        console.log(`Loaded ${keys.length} features.`);
    }
} catch (error) {
    console.error("Failed to initialize!", error);
    process.exit(1);
}
