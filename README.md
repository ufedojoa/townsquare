# Town Square

## Project Demo URL

https://ubit-townsquare.vercel.app

## Demo Video

View demo video here: https://dub.sh/townsquare-video

## Project Description

### Overview

**Town Square** is a revolutionary protocol and decentralized application (dApp) designed to facilitate the management of Decentralized Autonomous Organizations (DAOs) in a secure, decentralized, and efficient manner. In today’s rapidly evolving blockchain landscape, DAOs represent a transformative model of governance, where decisions are made collectively by token holders. However, managing a DAO effectively requires tools that ensure transparency, security, and active participation. Town Square addresses these needs by providing a comprehensive platform for DAO governance.

The core functionality of Town Square enables anyone to create a space for their organization and participate in governance by holding the specific token agreed upon by the space members. This model not only democratizes the process of space creation and governance but also incentivizes long-term holdings of the organization’s token, aligning the interests of the members with the long-term goals of the DAO.

Key to the Town Square platform are the robust security mechanisms in place to prevent spam and malicious activity. In any decentralized system, security is paramount to maintaining trust and integrity. Town Square leverages advanced cryptographic techniques and smart contract audits to ensure that the governance process is protected from fraudulent activities and that only legitimate proposals and votes are considered.

### Features and Functionality

1. **Permissionless Space Creation**: Users can independently create spaces for their DAOs without requiring any prior approval, promoting a decentralized and inclusive governance model.

2. **Automatic On-Chain Proposal Execution**: Proposals that pass within the DAO are automatically executed on the blockchain, ensuring seamless, transparent, and efficient implementation of decisions.

### Technical Implementation

**Town Square** is built using the following technologies:

- **Frontend**: Developed with Next.js to provide a responsive and dynamic user interface.
- **Blockchain**: Solidity for writing smart contracts which were deployed on the UBIT blockchain.
- **API Integration**: Incorporates Ubitscan API for interacting with the blockchain and fetching necessary data.

### Challenges and Solutions

One of the major challenges encountered during the development was working with the UBIT blockchain, which was new to me. Navigating through the unfamiliar territory of this blockchain required extra effort in understanding its unique features and functionalities.

### Future Improvements

To enhance the functionality and user experience of Town Square, the following improvements are planned:

- **Modularize the Smart Contracts**: This will improve the extensibility of the protocol, allowing for easier updates and integration of new features.
- **Implement More Voting Mechanisms**: Introducing a variety of voting mechanisms to cater to different types of DAOs and their specific governance needs.

## Team Members

1. **Ufedojo Atabo (Me)**: Software Engineer - Developed the entire dApp from the ground up, including both the frontend and the smart contracts.

## Originality and Permissions

- This submission is original work, solely owned by me.
- No third-party trademarks or copyrighted material have been used without proper permission.

## Setting up

### Prerequisites

Configure the environment variables in a `.env` file in the root directory. The following environment variables are required:

```bash
export MNEMONIC=<your-mnemonic>
export NEXT_PUBLIC_UBITSCAN_API_URL=https://testnet.ubitscan.io/api
export NEXT_PUBLIC_MAIN_CONTRACT_ADDRESS="0x486a135f08aa774cfb909cda4ad6e3afe486bddb"
export DEPLOYMENT_CHAIN_ID=44433 # 44433 for UBIT testnet, 1337 for local development
```

### Installation

To install the dependencies:

```bash
bun install
```

### Running the Development Server

To run the development server:

```bash
bun run dev
```
