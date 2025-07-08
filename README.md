# Voting DApp for Kaia Blockchain

A decentralized voting application built for the Kaia blockchain that allows users to create voting events, register candidates, cast votes, and determine winners.

## Features

- **Multiple Voting Events**: Create and manage multiple voting events simultaneously
- **Candidate Registration**: Register candidates with addresses and names
- **Secure Voting**: One vote per address per event
- **Time-based Voting**: Set voting duration with automatic end dates
- **Winner Determination**: Automatic winner calculation when voting ends
- **Responsive UI**: Modern, mobile-friendly interface
- **Real-time Updates**: Live time remaining and vote count updates

## Smart Contract Features

### VotingContract.sol

- Create voting events with custom duration
- Add candidates to voting events
- Cast votes (one per address per event)
- Complete voting events and determine winners
- View event details, candidates, and voting status
- Check if an address has already voted
- Get time remaining for active events

## Project Structure

```
Voting_DApp/
├── src/
│   ├── VotingContract.sol          # Main voting contract
│   └── Counter.sol                 # Example contract (can be removed)
├── script/
│   └── DeployVoting.s.sol          # Deployment script
├── test/
│   └── VotingContract.t.sol        # Comprehensive tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # Header with wallet connection
│   │   │   ├── VotingDashboard.js  # Main voting interface
│   │   │   └── CreateEvent.js      # Event creation interface
│   │   ├── utils/
│   │   │   ├── contractABI.js      # Contract ABI
│   │   │   └── web3.js            # Web3 service
│   │   ├── App.js                  # Main React component
│   │   ├── App.css                 # Main styles
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Additional styles
│   ├── public/
│   │   └── index.html              # HTML template
│   └── package.json                # Frontend dependencies
├── foundry.toml                    # Foundry configuration
└── README.md                       # This file
```

## Prerequisites

- [Foundry](https://getfoundry.sh/) - For smart contract development and deployment
- [Node.js](https://nodejs.org/) (v16 or higher) - For frontend development
- [MetaMask](https://metamask.io/) - For wallet connection
- Access to Kairos testnet RPC

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Voting_DApp
```

### 2. Install Foundry dependencies

```bash
forge install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Kairos testnet RPC URL
KAIROS_RPC_URL=https://testnet-rpc.kairos.network

# Your private key for deployment
PRIVATE_KEY=your_private_key_here

# Frontend environment variables
REACT_APP_KAIROS_RPC_URL=https://testnet-rpc.kairos.network
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

## Deployment

### 1. Deploy the Smart Contract

```bash
# Compile the contract
forge build

# Run tests
forge test

# Deploy to Kairos testnet
forge script script/DeployVoting.s.sol --rpc-url $KAIROS_RPC_URL --broadcast --verify
```

### 2. Update Frontend Configuration

After deployment, update the `REACT_APP_CONTRACT_ADDRESS` in your `.env` file with the deployed contract address.

### 3. Start the Frontend

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### For Event Creators (Contract Owner)

1. **Connect Wallet**: Use MetaMask to connect to the Kairos testnet
2. **Create Event**:
   - Navigate to "Create Event" tab
   - Fill in event name, description, and duration
   - Submit the transaction
3. **Add Candidates**:
   - Select the created event
   - Add candidate addresses and names
   - Submit each candidate addition

### For Voters

1. **Connect Wallet**: Use MetaMask to connect to the Kairos testnet
2. **View Events**: Browse available voting events in the dashboard
3. **Cast Vote**:
   - Select an active event
   - Choose a candidate
   - Submit your vote

### For Event Completion

1. **Wait for End**: Voting automatically ends after the specified duration
2. **Complete Event**: Click "Complete Event" to determine the winner
3. **View Results**: See the winner and final vote counts

## Smart Contract Functions

### Owner Functions

- `createVotingEvent(string eventName, string description, uint256 durationInMinutes)` - Create a new voting event
- `addCandidate(uint256 eventId, address candidateAddress, string candidateName)` - Add a candidate to an event

### Public Functions

- `vote(uint256 eventId, uint256 candidateIndex)` - Cast a vote
- `completeVotingEvent(uint256 eventId)` - Complete an event and determine winner

### View Functions

- `getVotingEvent(uint256 eventId)` - Get event details
- `getCandidate(uint256 eventId, uint256 candidateIndex)` - Get candidate details
- `hasVoted(uint256 eventId, address voter)` - Check if address has voted
- `getTimeRemaining(uint256 eventId)` - Get time remaining for active event
- `getEventCount()` - Get total number of events

## Testing

Run the comprehensive test suite:

```bash
forge test
```

Tests cover:

- Event creation and management
- Candidate addition
- Voting functionality
- Time-based restrictions
- Access control
- Error handling

## Frontend Features

### Responsive Design

- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

### Real-time Updates

- Live countdown timers
- Automatic vote count updates
- Real-time status changes

### User Experience

- Intuitive navigation
- Clear status indicators
- Helpful error messages
- Loading states

## Security Features

- **Access Control**: Only contract owner can create events and add candidates
- **Vote Protection**: One vote per address per event
- **Time Restrictions**: Voting only allowed during active periods
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error handling and user feedback

## Network Configuration

### Kairos Testnet

- **Chain ID**: [Check Kairos documentation]
- **RPC URL**: https://testnet-rpc.kairos.network
- **Currency**: KAI
- **Block Explorer**: [Check Kairos documentation]

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**

   - Ensure MetaMask is installed and unlocked
   - Add Kairos testnet to MetaMask
   - Check network connection

2. **Transaction Failures**

   - Ensure sufficient gas fees
   - Check if you're the contract owner for admin functions
   - Verify event is active for voting

3. **Frontend Issues**
   - Check contract address configuration
   - Ensure RPC URL is correct
   - Clear browser cache if needed

### Getting Help

- Check the console for error messages
- Verify network connectivity
- Ensure all environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the documentation
- Review the test files for usage examples
- Open an issue on GitHub
