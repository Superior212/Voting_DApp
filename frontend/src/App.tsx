import { useState } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { VotingDashboard } from "@/components/VotingDashboard";
import { CreateEvent } from "@/components/CreateEvent";
import { AddCandidate } from "@/components/AddCandidate";
import { useWeb3 } from "@/hooks/useWeb3";

function App() {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  const {
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
  } = useWeb3();

  const handleCreateEvent = (
    eventName: string,
    description: string,
    duration: string
  ) => {
    createEvent(eventName, description, duration);
    setShowCreateEvent(false);
  };

  const handleAddCandidate = (
    eventId: string,
    candidateAddress: string,
    candidateName: string
  ) => {
    addCandidate(eventId, candidateAddress, candidateName);
    setShowAddCandidate(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isConnected={isConnected}
        account={account}
        currentNetwork={currentNetwork}
        networkStatus={networkStatus}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onSwitchNetwork={switchToKairos}
      />

      {isConnected ? (
        <VotingDashboard
          events={events}
          selectedEvent={selectedEvent}
          candidates={candidates}
          hasVoted={hasVoted}
          timeRemaining={timeRemaining}
          onSelectEvent={selectEvent}
          onVote={vote}
          onCompleteEvent={completeEvent}
          onCreateEvent={() => setShowCreateEvent(true)}
          onAddCandidate={() => setShowAddCandidate(true)}
          loading={loading}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Voting DApp
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to start creating and participating in voting
              events
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        </div>
      )}

      <CreateEvent
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onSubmit={handleCreateEvent}
        loading={loading}
      />

      <AddCandidate
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        onSubmit={handleAddCandidate}
        events={events}
        loading={loading}
      />

      <Toaster />
    </div>
  );
}

export default App;
