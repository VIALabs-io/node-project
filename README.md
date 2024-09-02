# VIA Project Node

Welcome to the VIA Project Node documentation. This guide outlines how to install the VIA Project Node, how to develop and integrate custom features, and where to seek additional help.

The package also contains an optional Express server which exposes an API for events that can be consumed by the `DataStreamClient`. The `DataStreamClient` example can be found in the [client-stream-example repository](https://github.com/VIALabs-io/client-stream-example), and an optional Discord integration.

## Installation

### Prerequisites
Ensure your system meets the following specifications to successfully install and run the VIA Project Node:
- **Operating System**: Any OS that supports Docker
- **Memory**: Minimum of 1GB RAM
- **CPU**: At least 1 CPU core
- **Network**: Stable internet connection

### Building and Running with Docker

1. **Clone the Repository**:
   First, clone the repository to your local machine:
   ```bash
   git clone https://github.com/VIALabs-io/node-project.git
   cd node-project
   ```

2. **Create and Update the `.env` File**:
   Create a `.env` file in the project root by copying the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and update the necessary environment variables:
   - **`NODE_PRIVATE_KEY`**: This is a critical environment variable that should be set to your node's private key. It is required for the application to function correctly.
   - **`NODE_PUBLIC_KEY`**: Set this to your node's public key for the provided private key.
   - **`DATA_STREAM_PORT`**: This is the port that the optional `DataStreamServer` will use. If not specified, it will not be started.

   Example `.env` file configuration:
   ```env
   DEBUG=true
   NODE_ENV=development
   NODE_PRIVATE_KEY=your_private_key_here
   NODE_PUBLIC_KEY=your_public_key_here
   DATA_STREAM_PORT=3000
   ```

3. **Build the Docker Image**:
   Build the Docker image using the following command:
   ```bash
   docker build -t vialabs-node .
   ```

4. **Run the Docker Container in Development Mode**:
   Run the container using the command below:

   ```bash
   docker run --env-file .env -p 3000:3000 vialabs-node
   ```

   The application will start in development mode as specified by `NODE_ENV=development` in your `.env` file. 
   
   If `DATA_STREAM_PORT` is set, the `DataStreamServer` will be automatically started. 


### Optional DataStreamClient

The `DataStreamClient` package allows you to connect to a real-time data stream from the P2P validation network. This is particularly useful for clients or services that need to react to or process real-time events as they occur in the network. 

The `DataStreamClient` example can be found in the [client-stream-example repository](https://github.com/VIALabs-io/client-stream-example).

#### Example Usage

```javascript
import { DataStreamClient } from '@vialabs-io/node-core/DataStreamClient';

// Create a new instance of DataStreamClient (run local node or point to external node)
const client = new DataStreamClient('http://localhost:3000');

// Connect to the server
client.connect(
    (message) => {
        // Handle incoming message
        console.log('Received message:', message);
    },
    () => {
        // On connect callback
        console.log('Connected to server');
    },
    () => {
        // On disconnect callback
        console.log('Disconnected from server');
    }
);
```


### Optional: Discord Bot Integration

The VIA Project Node offers an optional integration with Discord, allowing you to receive real-time logs of events in a specified Discord channel and interact with the node through bot commands in a dedicated command channel.

#### Step 1: Create a Discord Application and Bot

1. **Visit the Discord Developer Portal**:
   Go to the [Discord Developer Portal](https://discord.com/developers/applications) and log in with your Discord account.

2. **Create a New Application**:
   - Click on the "New Application" button.
   - Provide a name for your application (e.g., "VIA Project Node Bot") and click "Create".

3. **Enable the Bot**:
   - Navigate to the "Bot" tab on the left sidebar.
   - Click the "Add Bot" button, and confirm by clicking "Yes, do it!".
   - You can optionally customize your bot's avatar and username.

4. **Retrieve Bot Credentials**:
   - **Token**: Under the "Bot" tab, click the "Copy" button under "Token" to copy your bot's token. You’ll need this for your `.env` file.
   - **Client ID**: Navigate to the "OAuth2" tab and copy the "Client ID". You’ll also need this for your `.env` file.

#### Step 2: Invite the Bot to Your Server

1. **Generate an OAuth2 URL**:
   - Under the "OAuth2" tab, scroll down to "OAuth2 URL Generator".
   - Select the "bot" scope.
   - Under "Bot Permissions", select the following permissions:
     - `Read Messages/View Channels`
     - `Send Messages`
     - `Manage Messages` (optional, for clearing bot's messages)
     - `Use Slash Commands` (if you plan to use the command channel)

2. **Invite the Bot**:
   - Copy the generated URL and paste it into your browser.
   - Select the server where you want to add the bot and authorize it.

#### Step 3: Update Your `.env` File

Add the following environment variables to your `.env` file to enable Discord integration:

```env
# OPTIONAL: Discord Bot Integration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CHANNEL_ID=your_discord_channel_id_here
DISCORD_COMMAND_CHANNEL_ID=your_discord_command_channel_id_here
```

- **`DISCORD_TOKEN`**: The token for your Discord bot (copied from the Discord Developer Portal).
- **`DISCORD_CLIENT_ID`**: The Client ID of your Discord application.
- **`DISCORD_CHANNEL_ID`**: The ID of the Discord channel where the bot will log real-time events.
- **`DISCORD_COMMAND_CHANNEL_ID`**: (Optional) The ID of the Discord channel where the bot will listen for and respond to commands.

### Developing Optional Custom Features

Custom features allow the node to interact with off-chain systems, APIs, or process offline data. Features are not needed for basic functionality, they are only required to provide additional deeper integrations with off-chain functionality.

These optional features and can be developed as follows:

#### Feature Structure
- **Location**: Custom features should reside in the `features/` directory.
- **Interface**: Each feature must extend the `IFeature` interface which defines standard methods for feature interaction.

#### Creating a Feature
1. **Implement the IFeature Interface**:
   Create a new feature class that implements the `IFeature` interface. Here is the `IFeature` interface definition:
   ```typescript
   import { IDriverBase } from "./IDriverBase.js";
   import { IMessage } from "./IMessage.js";

   export interface IFeature {
       featureId: number;
       featureName: string;
       featureDescription: string;
       process(driver: IDriverBase, message: IMessage): Promise<IMessage>;
       isMessageValid(driver: IDriverBase, message: IMessage): Promise<boolean>;
   }
   ```

2. **Feature Implementation**:
   Develop the feature logic within the methods defined by `IFeature`. Here’s an example of a simple feature implementation:
   ```typescript
   import { IFeature } from '@vialabs-io/node-core/types/IFeature';
   import { IDriverBase } from '@vialabs-io/node-core/types/IDriverBase';
   import { IMessage } from '@vialabs-io/node-core/types/IMessage';

   class CustomFeature implements IFeature {
       public featureId = 7000000; // This is normally the correct feature ID to use in a custom project.
       public featureName = 'CustomFeature';
       public featureDescription = 'A custom feature that does something special.';

       async process(driver: IDriverBase, message: IMessage): Promise<IMessage> {
           console.log('Processing feature:', this.featureName);
           // Custom logic here, pull information from external database, call an API
           // or do multiple cross chain transactions. Any arbitrary code can run here
           // and any arbitrary data can be passed back to the receiving contract:
           //
           // It is also possible to encode complex data structures, which are decoded
           // on chain and able to be used by the implementing contract:
           //
           // message.featureReply = ethers.utils.defaultAbiCoder.encode();
    
           return message;
       }

       async isMessageValid(driver: IDriverBase, message: IMessage): Promise<boolean> {
           // Optional extra validation logic here - for example, off-chain KYC check or linking to
           // an off-chain database record or authentication service. 
           return true;
       }
   }
   export default CustomFeature;
   ```
#### Automatically Loading Features

To automatically load features, create your feature modules in the `src/features` directory. Ensure they are exported from the `src/features/index.ts` file. For example:

##### src/features/index.ts

```typescript
import CustomFeature from "./CustomFeature.js";

export default [new CustomFeature()];
```

## Support
For further assistance, feature requests, or contributions:
- **Email**: Contact us at developers@vialabs.io.
- **GitHub**: Visit our [GitHub repository](https://github.com/VIALabs-io/node-project) to report issues or contribute to the project.
