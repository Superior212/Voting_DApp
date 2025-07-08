import { useState, useEffect } from "react";
import { web3Service } from "@/lib/web3";
import { showToast } from "@/lib/toast";
import type { VotingEvent, Candidate } from "@/lib/contractABI";

export function useWeb3() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [events, setEvents] = useState<VotingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<VotingEvent | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<{
    chainId: string;
    chainName: string;
    isKairos: boolean;
  } | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    isConnected: boolean;
    chainId: string;
    blockNumber: number;
    isKairos: boolean;
  } | null>(null);

  // Load events
  const loadEvents = async () => {
    try {
      const eventCount = await web3Service.getEventCount();
      const eventsList: VotingEvent[] = [];

      for (let i = 0; i < parseInt(eventCount); i++) {
        const event = await web3Service.getVotingEvent(i.toString());
        if (event) {
          eventsList.push(event);
        }
      }

      setEvents(eventsList);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  // Load candidates for selected event
  const loadCandidates = async () => {
    if (!selectedEvent) return;

    try {
      const candidatesList: Candidate[] = [];
      const candidateCount = parseInt(selectedEvent.candidateCount);

      for (let i = 0; i < candidateCount; i++) {
        const candidate = await web3Service.getCandidate(
          selectedEvent.eventId,
          i
        );
        if (candidate) {
          candidatesList.push(candidate);
        }
      }

      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  };

  // Check vote status
  const checkVoteStatus = async () => {
    if (!selectedEvent || !account) return;

    try {
      const voted = await web3Service.hasVoted(selectedEvent.eventId, account);
      setHasVoted(voted);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  // Update time remaining
  const updateTimeRemaining = async () => {
    if (!selectedEvent) return;

    try {
      const timeRemainingSeconds = await web3Service.getTimeRemaining(
        selectedEvent.eventId
      );
      const formattedTime = web3Service.formatTimeRemaining(
        parseInt(timeRemainingSeconds)
      );
      setTimeRemaining(formattedTime);
    } catch (error) {
      console.error("Error updating time remaining:", error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setLoading(true);
    try {
      const network = await web3Service.getCurrentNetwork();
      setCurrentNetwork(network);

      const result = await web3Service.connectWallet();
      if (result.success) {
        setIsConnected(true);
        setAccount(result.account || null);
        const updatedNetwork = await web3Service.getCurrentNetwork();
        setCurrentNetwork(updatedNetwork);
      } else {
        showToast.error(result.error || "Failed to connect wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      showToast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    web3Service.disconnect();
    setIsConnected(false);
    setAccount(null);
    setEvents([]);
    setSelectedEvent(null);
    setCandidates([]);
    setCurrentNetwork(null);
    setNetworkStatus(null);
  };

  // Switch to Kairos network
  const switchToKairos = async () => {
    setLoading(true);
    try {
      const result = await web3Service.switchToKairos();
      if (result.success) {
        const updatedNetwork = await web3Service.getCurrentNetwork();
        setCurrentNetwork(updatedNetwork);
        showToast.success("Successfully switched to Kaia Kairos testnet!");
      } else {
        const errorMessage = result.error || "Failed to switch network";
        showToast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error switching network:", error);
      showToast.error("Failed to switch network");
    } finally {
      setLoading(false);
    }
  };

  // Create voting event
  const createEvent = async (
    eventName: string,
    description: string,
    duration: string
  ) => {
    setLoading(true);
    try {
      const result = await web3Service.createVotingEvent(
        eventName,
        description,
        parseInt(duration)
      );
      if (result.success) {
        showToast.success("Voting event created successfully!");
        loadEvents();
      } else {
        showToast.error(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showToast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Add candidate
  const addCandidate = async (
    eventId: string,
    candidateAddress: string,
    candidateName: string
  ) => {
    setLoading(true);
    try {
      const result = await web3Service.addCandidate(
        eventId,
        candidateAddress,
        candidateName
      );
      if (result.success) {
        showToast.success("Candidate added successfully!");
        loadCandidates();
      } else {
        showToast.error(result.error || "Failed to add candidate");
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      showToast.error("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  // Vote for candidate
  const vote = async (candidateIndex: number) => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const result = await web3Service.vote(
        selectedEvent.eventId,
        candidateIndex
      );
      if (result.success) {
        showToast.success("Vote cast successfully!");
        setHasVoted(true);
        loadCandidates();
        loadEvents();
      } else {
        showToast.error(result.error || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      showToast.error("Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  // Complete voting event
  const completeEvent = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const result = await web3Service.completeVotingEvent(
        selectedEvent.eventId
      );
      if (result.success) {
        showToast.success("Voting event completed successfully!");
        loadEvents();
        setSelectedEvent(null);
      } else {
        showToast.error(result.error || "Failed to complete event");
      }
    } catch (error) {
      console.error("Error completing event:", error);
      showToast.error("Failed to complete event");
    } finally {
      setLoading(false);
    }
  };

  // Select event
  const selectEvent = (event: VotingEvent) => {
    setSelectedEvent(event);
  };

  // Update network status
  const updateNetworkStatus = async () => {
    try {
      const status = await web3Service.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error("Error updating network status:", error);
    }
  };

  // Check network on app load
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const network = await web3Service.getCurrentNetwork();
        setCurrentNetwork(network);
      } catch (error) {
        console.error("Error checking network:", error);
      }
    };

    checkNetwork();
  }, []);

  // Real-time network status updates
  useEffect(() => {
    if (isConnected) {
      updateNetworkStatus();
      const statusInterval = setInterval(updateNetworkStatus, 5000);
      return () => clearInterval(statusInterval);
    } else {
      setNetworkStatus(null);
    }
  }, [isConnected]);

  // Set up real-time event listeners
  useEffect(() => {
    const handleWalletConnected = (event: CustomEvent) => {
      console.log("Wallet connected event received:", event.detail);
      setIsConnected(true);
      setAccount(event.detail?.account || null);
      loadEvents();
    };

    const handleWalletDisconnected = () => {
      console.log("Wallet disconnected event received");
      setIsConnected(false);
      setAccount(null);
      setEvents([]);
      setSelectedEvent(null);
      setCandidates([]);
      setCurrentNetwork(null);
      setNetworkStatus(null);
    };

    const handleNetworkChanged = (event: CustomEvent) => {
      console.log("Network changed event received:", event.detail);
      if (event.detail) {
        setCurrentNetwork({
          chainId: event.detail.chainId,
          chainName: event.detail.isKairos ? "Kaia Kairos Testnet" : "Unknown",
          isKairos: event.detail.isKairos,
        });
      }
    };

    const handleVotingEventCreated = () => {
      console.log("Voting event created event received");
      loadEvents();
    };

    const handleCandidateAdded = () => {
      console.log("Candidate added event received");
      loadCandidates();
    };

    const handleVoteCast = () => {
      console.log("Vote cast event received");
      loadCandidates();
      loadEvents();
      checkVoteStatus();
    };

    const handleVotingEventCompleted = () => {
      console.log("Voting event completed event received");
      loadEvents();
    };

    window.addEventListener(
      "walletConnected",
      handleWalletConnected as EventListener
    );
    window.addEventListener("walletDisconnected", handleWalletDisconnected);
    window.addEventListener(
      "networkChanged",
      handleNetworkChanged as EventListener
    );
    window.addEventListener("votingEventCreated", handleVotingEventCreated);
    window.addEventListener("candidateAdded", handleCandidateAdded);
    window.addEventListener("voteCast", handleVoteCast);
    window.addEventListener("votingEventCompleted", handleVotingEventCompleted);

    return () => {
      window.removeEventListener(
        "walletConnected",
        handleWalletConnected as EventListener
      );
      window.removeEventListener(
        "walletDisconnected",
        handleWalletDisconnected
      );
      window.removeEventListener(
        "networkChanged",
        handleNetworkChanged as EventListener
      );
      window.removeEventListener(
        "votingEventCreated",
        handleVotingEventCreated
      );
      window.removeEventListener("candidateAdded", handleCandidateAdded);
      window.removeEventListener("voteCast", handleVoteCast);
      window.removeEventListener(
        "votingEventCompleted",
        handleVotingEventCompleted
      );
    };
  }, []);

  // Load events when connected
  useEffect(() => {
    if (isConnected) {
      loadEvents();
      const pollInterval = setInterval(() => {
        if (isConnected) {
          loadEvents();
          if (selectedEvent) {
            loadCandidates();
            checkVoteStatus();
          }
        }
      }, 10000);
      return () => clearInterval(pollInterval);
    }
  }, [isConnected, selectedEvent]);

  // Update time remaining and load candidates when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadCandidates();
      checkVoteStatus();
      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedEvent, account]);

  return {
    // State
    isConnected,
    account,
    events,
    selectedEvent,
    candidates,
    loading,
    timeRemaining,
    hasVoted,
    currentNetwork,
    networkStatus,

    // Actions
    connectWallet,
    disconnectWallet,
    switchToKairos,
    createEvent,
    addCandidate,
    vote,
    completeEvent,
    selectEvent,
  };
}
