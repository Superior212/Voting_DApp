// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/VotingContract.sol";

contract DeployVotingScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        VotingContract votingContract = new VotingContract();

        vm.stopBroadcast();

        console.log("VotingContract deployed at:", address(votingContract));
    }
}
