// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/VotingContract.sol";

contract DeployVoting is Script {
    function run() public {
        // Get the private key from the "superior" wallet
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // If PRIVATE_KEY is not set, try to use the wallet
        if (deployerPrivateKey == 0) {
            // Try to get from wallet name
            deployerPrivateKey = vm.envUint("SUPERIOR_PRIVATE_KEY");
        }

        vm.startBroadcast(deployerPrivateKey);

        VotingContract votingContract = new VotingContract();

        vm.stopBroadcast();

        console.log("VotingContract deployed at:", address(votingContract));
    }
}
