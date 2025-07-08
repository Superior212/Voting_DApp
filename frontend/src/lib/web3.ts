import { ethers } from "ethers";
import {
  VOTING_CONTRACT_ABI,
  type VotingEvent,
  type Candidate,
} from "./contractABI";
import { showToast } from "./toast";

// Kairos testnet configuration
const KAIROS_RPC_URL =
  import.meta.env.VITE_KAIROS_RPC_URL ||
  "https://public-en-kairos.node.kaia.io";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

// Kaia Kairos testnet chain configuration
const KAIROS_CHAIN_CONFIG = {
  chainId: "0x3e9", // 1001 in decimal - verified from RPC endpoint
  chainName: "Kaia Kairos Testnet",
  nativeCurrency: {
    name: "Kaia",
    symbol: "KAI",
    decimals: 18,
  },
  rpcUrls: [KAIROS_RPC_URL],
  blockExplorerUrls: ["https://explorer.kairos.kaia.io"],
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private account: string | null = null;

  async connectWallet(): Promise<{
    success: boolean;
    account?: string;
    provider?: ethers.BrowserProvider;
    contract?: ethers.Contract;
    error?: string;
  }> {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to use this dApp."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.account = accounts[0];

      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== KAIROS_CHAIN_CONFIG.chainId) {
        // Try to switch to Kairos testnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: KAIROS_CHAIN_CONFIG.chainId }],
          });
        } catch (switchError: unknown) {
          // If the network doesn't exist, add it
          if ((switchError as { code: number }).code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [KAIROS_CHAIN_CONFIG],
              });
            } catch {
              throw new Error(
                "Failed to add Kaia Kairos testnet to MetaMask. Please add it manually."
              );
            }
          } else {
            throw new Error(
              "Please switch to Kaia Kairos testnet in MetaMask."
            );
          }
        }
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Create contract instance
      if (CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          this.signer
        );

        // Set up real-time contract event listeners
        this.setupContractEventListeners();
      }

      // Enhanced account change listener with immediate response
      window.ethereum.on("accountsChanged", async (accounts: string[]) => {
        console.log("Account changed:", accounts);

        if (accounts.length === 0) {
          showToast.info("Wallet disconnected");
          this.disconnect();
          // Trigger UI update
          window.dispatchEvent(new CustomEvent("walletDisconnected"));
        } else {
          const newAccount = accounts[0];
          if (this.account !== newAccount) {
            this.account = newAccount;
            showToast.success(`Connected to ${this.formatAddress(newAccount)}`);

            // Reconnect provider and contract with new account
            try {
              if (window.ethereum) {
                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();

                if (CONTRACT_ADDRESS) {
                  this.contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    VOTING_CONTRACT_ABI,
                    this.signer
                  );
                }

                // Trigger UI update
                window.dispatchEvent(
                  new CustomEvent("walletConnected", {
                    detail: { account: newAccount },
                  })
                );
              }
            } catch (error) {
              console.error("Error reconnecting after account change:", error);
              showToast.error("Failed to reconnect after account change");
            }
          }
        }
      });

      // Enhanced chain change listener with immediate network check
      window.ethereum.on("chainChanged", async (chainId: string) => {
        console.log("Chain changed:", chainId);

        if (chainId !== KAIROS_CHAIN_CONFIG.chainId) {
          showToast.warning(
            "Network changed. Please switch to Kaia Kairos testnet to use this dApp."
          );

          // Trigger UI update for network change
          window.dispatchEvent(
            new CustomEvent("networkChanged", {
              detail: { chainId, isKairos: false },
            })
          );

          // Don't disconnect immediately, let user decide
          // this.disconnect();
        } else {
          showToast.success("Connected to Kaia Kairos testnet");

          // Trigger UI update for correct network
          window.dispatchEvent(
            new CustomEvent("networkChanged", {
              detail: { chainId, isKairos: true },
            })
          );
        }
      });

      // Add connection listener for real-time status
      window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
        console.log("Wallet connected:", connectInfo);
        showToast.success("Wallet connected successfully");

        // Trigger UI update
        window.dispatchEvent(
          new CustomEvent("walletConnected", {
            detail: { chainId: connectInfo.chainId },
          })
        );
      });

      // Add disconnection listener
      window.ethereum.on(
        "disconnect",
        (error: { code: number; message: string }) => {
          console.log("Wallet disconnected:", error);
          showToast.info("Wallet disconnected");

          this.disconnect();

          // Trigger UI update
          window.dispatchEvent(new CustomEvent("walletDisconnected"));
        }
      );

      return {
        success: true,
        account: this.account || undefined,
        provider: this.provider || undefined,
        contract: this.contract || undefined,
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async switchToKairos(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed.");
      }

      // Try to switch to Kairos testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: KAIROS_CHAIN_CONFIG.chainId }],
        });
        return { success: true };
      } catch (switchError: unknown) {
        // If the network doesn't exist, add it
        if ((switchError as { code: number }).code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [KAIROS_CHAIN_CONFIG],
            });
            return { success: true };
          } catch {
            return {
              success: false,
              error: `Failed to add Kaia Kairos testnet automatically. Please add it manually to MetaMask with these details:
              
Network Name: Kaia Kairos Testnet
RPC URL: ${KAIROS_RPC_URL}
Chain ID: ${KAIROS_CHAIN_CONFIG.chainId} (${parseInt(
                KAIROS_CHAIN_CONFIG.chainId,
                16
              )})
Currency Symbol: KAI
Block Explorer URL: https://explorer.kairos.kaia.io`,
            };
          }
        } else {
          return {
            success: false,
            error: "Failed to switch to Kaia Kairos testnet.",
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getCurrentNetwork(): Promise<{
    chainId: string;
    chainName: string;
    isKairos: boolean;
  }> {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed.");
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const isKairos = chainId === KAIROS_CHAIN_CONFIG.chainId;

      let chainName = "Unknown";
      if (isKairos) {
        chainName = "Kaia Kairos Testnet";
      } else if (chainId === "0x1") {
        chainName = "Ethereum Mainnet";
      } else if (chainId === "0x89") {
        chainName = "Polygon";
      } else if (chainId === "0xa") {
        chainName = "Optimism";
      } else if (chainId === "0xa4b1") {
        chainName = "Arbitrum One";
      }

      return {
        chainId,
        chainName,
        isKairos,
      };
    } catch {
      return {
        chainId: "0x0",
        chainName: "Unknown",
        isKairos: false,
      };
    }
  }

  disconnect(): void {
    // Remove contract event listeners before disconnecting
    this.removeContractEventListeners();

    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // Set up real-time contract event listeners
  setupContractEventListeners(): void {
    if (!this.contract) return;

    // Listen for new voting events
    this.contract.on(
      "VotingEventCreated",
      (eventId: string, eventName: string, creator: string) => {
        console.log("New voting event created:", {
          eventId,
          eventName,
          creator,
        });
        showToast.success(`New voting event created: ${eventName}`);

        // Trigger UI update
        window.dispatchEvent(
          new CustomEvent("votingEventCreated", {
            detail: { eventId, eventName, creator },
          })
        );
      }
    );

    // Listen for new candidates
    this.contract.on(
      "CandidateAdded",
      (eventId: string, candidateAddress: string, candidateName: string) => {
        console.log("New candidate added:", {
          eventId,
          candidateAddress,
          candidateName,
        });
        showToast.success(`New candidate added: ${candidateName}`);

        // Trigger UI update
        window.dispatchEvent(
          new CustomEvent("candidateAdded", {
            detail: { eventId, candidateAddress, candidateName },
          })
        );
      }
    );

    // Listen for votes
    this.contract.on(
      "VoteCast",
      (eventId: string, voter: string, candidateIndex: string) => {
        console.log("Vote cast:", { eventId, voter, candidateIndex });
        showToast.success("Vote cast successfully!");

        // Trigger UI update
        window.dispatchEvent(
          new CustomEvent("voteCast", {
            detail: { eventId, voter, candidateIndex },
          })
        );
      }
    );

    // Listen for event completion
    this.contract.on(
      "VotingEventCompleted",
      (eventId: string, winner: string) => {
        console.log("Voting event completed:", { eventId, winner });
        showToast.success("Voting event completed!");

        // Trigger UI update
        window.dispatchEvent(
          new CustomEvent("votingEventCompleted", {
            detail: { eventId, winner },
          })
        );
      }
    );
  }

  // Remove contract event listeners
  removeContractEventListeners(): void {
    if (!this.contract) return;

    this.contract.removeAllListeners("VotingEventCreated");
    this.contract.removeAllListeners("CandidateAdded");
    this.contract.removeAllListeners("VoteCast");
    this.contract.removeAllListeners("VotingEventCompleted");
  }

  isConnected(): boolean {
    return this.contract !== null && this.account !== null;
  }

  getAccount(): string | null {
    return this.account;
  }

  getContract(): ethers.Contract | null {
    return this.contract;
  }

  async getEventCount(): Promise<string> {
    if (!this.contract) return "0";
    try {
      const count = await this.contract.getEventCount();
      return count.toString();
    } catch (error) {
      console.error("Error getting event count:", error);
      return "0";
    }
  }

  async getVotingEvent(eventId: string): Promise<VotingEvent | null> {
    if (!this.contract) return null;
    try {
      const event = await this.contract.getVotingEvent(eventId);
      return {
        eventId: event[0].toString(),
        eventName: event[1],
        description: event[2],
        endDate: event[3].toString(),
        isActive: event[4],
        isCompleted: event[5],
        winner: event[6],
        totalVotes: event[7].toString(),
        candidateCount: event[8].toString(),
      };
    } catch (error) {
      console.error("Error getting voting event:", error);
      return null;
    }
  }

  async getCandidate(
    eventId: string,
    candidateIndex: number
  ): Promise<Candidate | null> {
    if (!this.contract) return null;
    try {
      const candidate = await this.contract.getCandidate(
        eventId,
        candidateIndex
      );
      return {
        address: candidate[0],
        name: candidate[1],
        voteCount: candidate[2].toString(),
      };
    } catch (error) {
      console.error("Error getting candidate:", error);
      return null;
    }
  }

  async hasVoted(eventId: string, voterAddress: string): Promise<boolean> {
    if (!this.contract) return false;
    try {
      return await this.contract.hasVoted(eventId, voterAddress);
    } catch (error) {
      console.error("Error checking if voted:", error);
      return false;
    }
  }

  async getTimeRemaining(eventId: string): Promise<string> {
    if (!this.contract) return "0";
    try {
      const timeRemaining = await this.contract.getTimeRemaining(eventId);
      return timeRemaining.toString();
    } catch (error) {
      console.error("Error getting time remaining:", error);
      return "0";
    }
  }

  async createVotingEvent(
    eventName: string,
    description: string,
    durationInMinutes: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    eventId?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error("Contract not connected");
    try {
      const tx = await this.contract.createVotingEvent(
        eventName,
        description,
        durationInMinutes
      );
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt?.hash,
        eventId: receipt?.logs?.[0]?.args?.eventId?.toString(),
      };
    } catch (error) {
      console.error("Error creating voting event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async addCandidate(
    eventId: string,
    candidateAddress: string,
    candidateName: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error("Contract not connected");
    try {
      const tx = await this.contract.addCandidate(
        eventId,
        candidateAddress,
        candidateName
      );
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt?.hash,
      };
    } catch (error) {
      console.error("Error adding candidate:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async vote(
    eventId: string,
    candidateIndex: number
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error("Contract not connected");
    try {
      const tx = await this.contract.vote(eventId, candidateIndex);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt?.hash,
      };
    } catch (error) {
      console.error("Error voting:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async completeVotingEvent(eventId: string): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error("Contract not connected");
    try {
      const tx = await this.contract.completeVotingEvent(eventId);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt?.hash,
      };
    } catch (error) {
      console.error("Error completing voting event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return "Ended";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Get current block number for real-time updates
  async getCurrentBlockNumber(): Promise<number> {
    if (!this.provider) return 0;
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error("Error getting current block number:", error);
      return 0;
    }
  }

  // Get real-time network status
  async getNetworkStatus(): Promise<{
    isConnected: boolean;
    chainId: string;
    blockNumber: number;
    isKairos: boolean;
  }> {
    try {
      if (!this.provider) {
        return {
          isConnected: false,
          chainId: "0x0",
          blockNumber: 0,
          isKairos: false,
        };
      }

      const chainId = await this.provider.send("eth_chainId", []);
      const blockNumber = await this.getCurrentBlockNumber();
      const isKairos = chainId === KAIROS_CHAIN_CONFIG.chainId;

      return {
        isConnected: true,
        chainId,
        blockNumber,
        isKairos,
      };
    } catch (error) {
      console.error("Error getting network status:", error);
      return {
        isConnected: false,
        chainId: "0x0",
        blockNumber: 0,
        isKairos: false,
      };
    }
  }
}

export const web3Service = new Web3Service();
