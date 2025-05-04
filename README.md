# MiniReward Dapp on LUKSO

## Project Description

MiniReward is a decentralized application (dapp) built on the LUKSO blockchain that allows Universal Profile owners to reward their visitors with LSP7 tokens. This dapp leverages the LUKSO LSP26 Follower System to incentivize user engagement, enabling a novel way for creators, communities, and businesses to connect with and appreciate their audience.

By deploying the MiniReward dapp to their GRID, Universal Profile owners can:

* **Reward Visitors:** Distribute LSP7 tokens to users who interact with their profile.
* **Incentivize Engagement:** Encourage specific actions, such as following the profile, with token rewards.
* **Build Community:** Foster a stronger connection with their audience by providing tangible incentives.
* **Customize Rewards:** Configure reward amounts and criteria to suit their specific needs.

## Features

* **LSP7 Token Rewards:** Distribute any LSP7 token as a reward.
* **LSP26 Follower System Integration:** Require users to follow a specified Universal Profile to claim rewards.
* **Universal Profile Integration:** Seamlessly integrates with Universal Profiles, allowing for a personalized and user-owned experience.
* **GRID Deployment:** Deployable to a user's GRID, ensuring decentralized access and control.
* **Customizable Rewards:** Define reward amounts and conditions.
* **Claiming Mechanism:** Users can easily claim their earned rewards through the dapp.
* **Secure Smart Contracts:** Implemented using Solidity with security best practices.
* **Event Logging:** Tracks reward distribution and claims for transparency.

## How It Works

1.  **Deployment:** A Universal Profile owner deploys the MiniReward smart contract to their GRID.
2.  **Configuration:** The profile owner configures the contract, specifying the LSP7 token to use for rewards and the Universal Profile that users must follow.
3.  **Reward Distribution:** The profile owner funds the contract with the reward tokens and sets the reward amounts.
4.  **User Interaction:** Visitors interact with the Universal Profile, and if they meet the reward conditions (e.g., following the profile), they become eligible to claim rewards.
5.  **Claiming:** Eligible users claim their rewards by interacting with the MiniReward dapp, which verifies that they are following the specified profile using the LSP26 Follower System.
6.  **Token Transfer:** Upon successful claim, the smart contract transfers the specified amount of LSP7 tokens to the user's Universal Profile.

## Technical Details

The MiniReward dapp consists of the following components:

* **Smart Contract (`VisitorRewards.sol`):**
    * Manages the reward distribution logic.
    * Interacts with the LSP7 token contract.
    * Integrates with the LSP26 Follower System contract.
    * Stores reward balances for each user.
    * Handles reward claiming.
    * Implements access control using the Ownable pattern.
* **Frontend (Optional):**
    * A user interface (not included in this code-only example) can be built to interact with the smart contract.
    * The frontend would allow profile owners to configure rewards and visitors to claim them.
    * The frontend would interact with the user's Universal Profile and the LUKSO network.

## Prerequisites

* Node.js and npm
* LUKSO development environment (e.g., Hardhat, Remix)
* A Universal Profile on the LUKSO network
* LSP7 tokens for rewarding visitors
* LUKSO LSP26 Follower System contract deployed on the target network

## Installation

1.  Clone this repository:

    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```
2.  Install dependencies (if applicable - for frontend):

    ```bash
    npm install
    ```
3.  Deploy the smart contract:

    * Use Hardhat, Remix, or your preferred deployment tool.
    * Ensure you have the addresses of the LSP7 token contract and the LSP26 Follower System contract.
    * Provide these addresses, along with the target Universal Profile address, to the `VisitorRewards` contract during deployment.

## Usage

1.  **Fund the Contract:** After deployment, transfer the LSP7 tokens you want to distribute as rewards to the `VisitorRewards` contract.
2.  **Give Rewards:** The contract owner can call the `giveReward()` function to allocate rewards to visitor addresses.
3.  **Claim Rewards:** Users can call the `claimReward()` function to claim their rewards, but only if they are following the specified Universal Profile.

## Events

* `RewardGiven(address indexed recipient, uint256 amount)`
    * Emitted when the contract owner allocates rewards to a user.
    * Parameters:
        * `recipient`: The address of the reward recipient.
        * `amount`: The amount of LSP7 tokens awarded.

* `RewardClaimed(address indexed recipient, uint256 amount)`
    * Emitted when a user claims their rewards.
    * Parameters:
        * `recipient`: The address of the user claiming the reward.
        * `amount`: The amount of LSP7 tokens claimed.

## Security Considerations

* **Access Control:** The contract uses the Ownable pattern to restrict access to sensitive functions (e.g., `giveReward()`) to the contract owner.
* **LSP7 Token Transfers:** The contract uses the `transfer()` function of the LSP7 token contract to transfer tokens. Ensure that the LSP7 token contract is secure and trusted.
* **Reentrancy:** The `claimReward()` function does not appear to be vulnerable to reentrancy attacks, as it updates the user's balance and claim status before transferring tokens.
* **Input Validation:** The contract includes basic input validation (e.g., checking for a non-zero reward balance before claiming).
* **LSP26 Interaction:** The contract relies on the LSP26 Follower System contract. Ensure that this contract is secure and trusted.

## Future Improvements

* **Frontend Interface:** Develop a user-friendly frontend to simplify reward management and claiming.
* **More Flexible Reward Rules:** Implement more complex reward rules (e.g., time-based rewards, rewards for specific actions).
* **Batch Reward Distribution:** Add functionality to distribute rewards to multiple users in a single transaction.
* **Gas Optimization:** Optimize the contract code to reduce gas costs.
* **Events for Configuration Changes:** Add events for changes in reward configuration.

## Contributing

Contributions are welcome! If you find a bug or have a suggestion for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
