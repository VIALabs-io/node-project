# VIA Project Node

Welcome to the VIA Project Node documentation. This guide outlines how to install the VIA Project Node on Ubuntu 22.04 LTS, how to develop and integrate custom features, and where to seek additional help.

## Installation

### Prerequisites
Ensure your system meets the following specifications to successfully install and run the VIA Project Node:
- **Operating System**: Ubuntu 22.04 LTS
- **Memory**: Minimum of 1GB RAM
- **CPU**: At least 1 CPU core
- **Network**: Stable internet connection

### Base System Setup
To set up the VIA Project Node, follow these instructions:

1. **Install Git**:
   Open a terminal and run the following command to install Git:
   ```bash
   sudo apt-get install -y git
   ```

2. **Clone the Repository**:
   Download the project source code from GitHub:
   ```bash
   git clone https://github.com/VIALabs-io/node-project.git
   cd node-project
   ```

3. **Run the Installation Script**:
   Execute the installation script to set up all necessary dependencies:
   ```bash
   bash scripts/install
   ```

4. **Execute the Startup Script**:
   Start your node using the startup script:
   ```bash
   bash scripts/startup
   ```
   *Note: The node runs in the background even after closing the terminal.*

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
