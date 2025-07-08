import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, X } from "lucide-react";
import type { VotingEvent } from "@/lib/contractABI";

interface AddCandidateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    eventId: string,
    candidateAddress: string,
    candidateName: string
  ) => void;
  events: VotingEvent[];
  loading: boolean;
}

export function AddCandidate({
  isOpen,
  onClose,
  onSubmit,
  events,
  loading,
}: AddCandidateProps) {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent || !candidateAddress || !candidateName) {
      return;
    }
    onSubmit(selectedEvent, candidateAddress, candidateName);
    // Reset form
    setSelectedEvent("");
    setCandidateAddress("");
    setCandidateName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Add Candidate</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add a new candidate to an existing voting event
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventSelect">Select Event</Label>
              <select
                id="eventSelect"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required>
                <option value="">Choose an event...</option>
                {events
                  .filter((event) => event.isActive && !event.isCompleted)
                  .map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateAddress">Candidate Address</Label>
              <Input
                id="candidateAddress"
                value={candidateAddress}
                onChange={(e) => setCandidateAddress(e.target.value)}
                placeholder="Enter candidate wallet address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate name"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
