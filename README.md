# VIA Project Node

Welcome to the VIA Project Node documentation. This guide outlines how to install the VIA Project Node on Ubuntu 22.04 LTS, how to develop and integrate custom features, and where to seek additional help.

## Installation

### Prerequisites
Ensure your system meets the following specifications to successfully install and run the VIA Project Node:
- **Operating System**: Ubuntu 22.04 LTS
- **Memory**: Minimum of 1GB RAM
- **CPU**: At least 1 CPU core
- **Network**: Stable internet connection

Here is the updated portion of the `README.md` with detailed instructions on what to change in the `.env` file:

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
   Open the `.env` file and update the following variables:
   - **`NODE_PRIVATE_KEY`**: This is a critical environment variable that should be set to your node's private key. It is required for the application to function correctly.
   - **`NODE_PUBLIC_KEY`**: Set this to your node's public key for the provided private key.
   - **`DATA_STREAM_PORT`**: This is the port that the Express server will run on. It defaults to `3000`, but you can change it if needed. If you do not provide a port, the Data Stream Server does not run.
   - **`NODE_ENV`**: This environment variable controls the mode in which the application runs. By default, the Docker setup will run the application in `development` mode for safety. You can leave this as `development` for testing, or set it to `production` if you are ready to deploy.

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

4. **Run the Docker Container**:
   Run the container using the command below. The container will automatically expose the application on port 3000 and run in development mode by default.
   ```bash
   docker run --env-file .env -p 3000:3000 vialabs-node
   ```

   *Note: The application will automatically start in development mode. If you wish to run it in production mode, you can set `NODE_ENV=production` when running the Docker container by using the following command:*
   ```bash
   docker run --env-file .env -e NODE_ENV=production -p 3000:3000 vialabs-node
   ```


## Developing Custom Features

Custom features allow the node to interact with off-chain systems, APIs, or process offline data. These features should be developed as follows:

### Feature Structure
- **Location**: Custom features should reside in the `features/` directory.
- **Interface**: Each feature must extend the `IFeature` interface which defines standard methods for feature interaction.

### Creating a Feature
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
       public featureId = 123;
       public featureName = 'CustomFeature';
       public featureDescription = 'A custom feature that does something special.';

       async process(driver: IDriverBase, message: IMessage): Promise<IMessage> {
           // Custom logic here
           console.log('Processing feature:', this.featureName);
           return message;
       }

       async isMessageValid(driver: IDriverBase, message: IMessage): Promise<boolean> {
           // Validation logic here
           return true;
       }
   }
   export default CustomFeature;
   ```

3. **Register and Load Features**:
   - Add and export the feature from the `features/index.js` file.
   - Automatically load features during node initialization from the `features/index.js` directory.

### Feature Integration Example
Here’s an example of how you can load features dynamically when initializing the node:
```javascript
import { Vladiator } from '@vialabs-io/node-core/Vladiator';
import dotenv from 'dotenv';
dotenv.config();

const config = require(process.env.NODE_ENV === 'development' ? '../chains-testnet.json' : '../chains-mainnet.json');

try {
    const vladiator = new Vladiator(process.env.NODE_PRIVATE_KEY, config);
    const features = require('./features/index.js');
    Object.keys(features).forEach(key => {
        vladiator.loadFeature(new features[key]());
    });
    console.log('All features loaded successfully.');
} catch (error) {
    console.error('Failed to initialize node:', error);
}
```

## Support
For further assistance, feature requests, or contributions:
- **Email**: Contact us at developers@vialabs.io.
- **GitHub**: Visit our [GitHub repository](https://github.com/VIALabs-io/node-project) to report issues or contribute to the project.
