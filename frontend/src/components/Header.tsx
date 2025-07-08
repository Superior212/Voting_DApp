import { Button } from "@/components/ui/button";
import { Wallet, Wifi, WifiOff, Vote } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  account: string | null;
  currentNetwork: {
    chainId: string;
    chainName: string;
    isKairos: boolean;
  } | null;
  networkStatus: {
    isConnected: boolean;
    chainId: string;
    blockNumber: number;
    isKairos: boolean;
  } | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
}

export function Header({
  isConnected,
  account,
  currentNetwork,
  networkStatus,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}: HeaderProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Vote className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Voting DApp</h1>
          </div>

          {/* Network Status */}
          <div className="flex items-center space-x-4">
            {networkStatus && (
              <div className="flex items-center space-x-2 text-sm">
                {networkStatus.isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-gray-600">
                  Block #{networkStatus.blockNumber}
                </span>
              </div>
            )}

            {/* Network Info */}
            {currentNetwork && (
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentNetwork.isKairos ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {currentNetwork.chainName}
                </span>
              </div>
            )}

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button
                onClick={onConnect}
                className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  {account && formatAddress(account)}
                </div>
                {currentNetwork && !currentNetwork.isKairos && (
                  <Button
                    onClick={onSwitchNetwork}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50">
                    Switch to Kairos
                  </Button>
                )}
                <Button
                  onClick={onDisconnect}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50">
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
