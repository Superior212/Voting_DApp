import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Vote,
  Clock,
  Users,
  Trophy,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { VotingEvent, Candidate } from "@/lib/contractABI";

interface VotingDashboardProps {
  events: VotingEvent[];
  selectedEvent: VotingEvent | null;
  candidates: Candidate[];
  hasVoted: boolean;
  timeRemaining: string;
  onSelectEvent: (event: VotingEvent) => void;
  onVote: (candidateIndex: number) => void;
  onCompleteEvent: () => void;
  onCreateEvent: () => void;
  onAddCandidate: () => void;
  loading: boolean;
}

export function VotingDashboard({
  events,
  selectedEvent,
  candidates,
  hasVoted,
  timeRemaining,
  onSelectEvent,
  onVote,
  onCompleteEvent,
  onCreateEvent,
  onAddCandidate,
  loading,
}: VotingDashboardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Voting Events</h2>
        <div className="flex space-x-3">
          <Button
            onClick={onCreateEvent}
            className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
          <Button
            onClick={onAddCandidate}
            variant="outline"
            className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Available Events</h3>
          <div className="space-y-3">
            {events.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No voting events available
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card
                  key={event.eventId}
                  className={`cursor-pointer transition-colors ${
                    selectedEvent?.eventId === event.eventId
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectEvent(event)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {event.eventName}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {event.isActive && !event.isCompleted && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {event.isCompleted && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.candidateCount} candidates</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Vote className="h-3 w-3" />
                        <span>{event.totalVotes} votes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Selected Event Details */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedEvent.eventName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {selectedEvent.isActive && !selectedEvent.isCompleted && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">Active</span>
                        </div>
                      )}
                      {selectedEvent.isCompleted && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Trophy className="h-4 w-4" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription>{selectedEvent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Time Remaining: {timeRemaining}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Candidates: {selectedEvent.candidateCount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Vote className="h-4 w-4 text-gray-500" />
                      <span>Total Votes: {selectedEvent.totalVotes}</span>
                    </div>
                    {selectedEvent.winner && (
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>
                          Winner: {formatAddress(selectedEvent.winner)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                {selectedEvent.isActive && !selectedEvent.isCompleted && (
                  <CardFooter>
                    <Button
                      onClick={onCompleteEvent}
                      disabled={loading}
                      className="w-full">
                      {loading ? "Completing..." : "Complete Event"}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Candidates */}
              <Card>
                <CardHeader>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>
                    {hasVoted ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>You have voted</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <XCircle className="h-4 w-4" />
                        <span>You haven't voted yet</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No candidates available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidates.map((candidate, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatAddress(candidate.address)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium">
                                {candidate.voteCount}
                              </div>
                              <div className="text-sm text-gray-500">votes</div>
                            </div>
                            {selectedEvent.isActive &&
                              !selectedEvent.isCompleted &&
                              !hasVoted && (
                                <Button
                                  onClick={() => onVote(index)}
                                  disabled={loading}
                                  size="sm">
                                  Vote
                                </Button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Vote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Event Selected</h3>
                <p>Select an event from the list to view details and vote</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
