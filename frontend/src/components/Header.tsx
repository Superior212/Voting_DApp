import { Button } from "@/components/ui/button";
import { Wallet, Wifi, WifiOff, Vote, Menu, X } from "lucide-react";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Vote className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Voting DApp
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Network Status */}
            {networkStatus && (
              <div className="flex items-center space-x-2 text-xs lg:text-sm">
                {networkStatus.isConnected ? (
                  <Wifi className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                )}
                <span className="text-gray-600 hidden lg:inline">
                  Block #{networkStatus.blockNumber}
                </span>
                <span className="text-gray-600 lg:hidden">
                  #{networkStatus.blockNumber}
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
                <span className="text-xs lg:text-sm text-gray-600 hidden sm:inline">
                  {currentNetwork.chainName}
                </span>
                <span className="text-xs lg:text-sm text-gray-600 sm:hidden">
                  {currentNetwork.isKairos ? "Kairos" : "Other"}
                </span>
              </div>
            )}

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button
                onClick={onConnect}
                size="sm"
                className="flex items-center space-x-1 lg:space-x-2">
                <Wallet className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="text-xs lg:text-sm text-gray-600 hidden sm:inline">
                  {account && formatAddress(account)}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 sm:hidden">
                  {account && `${account.slice(0, 4)}...${account.slice(-3)}`}
                </div>
                {currentNetwork && !currentNetwork.isKairos && (
                  <Button
                    onClick={onSwitchNetwork}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs">
                    <span className="hidden sm:inline">Switch to Kairos</span>
                    <span className="sm:hidden">Switch</span>
                  </Button>
                )}
                <Button
                  onClick={onDisconnect}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50 text-xs">
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">Disconnect</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2">
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-2">
              {/* Network Status Mobile */}
              {networkStatus && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {networkStatus.isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      Block #{networkStatus.blockNumber}
                    </span>
                  </div>
                </div>
              )}

              {/* Network Info Mobile */}
              {currentNetwork && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
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
                </div>
              )}

              {/* Wallet Connection Mobile */}
              {!isConnected ? (
                <Button
                  onClick={() => {
                    onConnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      {account && formatAddress(account)}
                    </div>
                  </div>
                  {currentNetwork && !currentNetwork.isKairos && (
                    <Button
                      onClick={() => {
                        onSwitchNetwork();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full text-orange-600 border-orange-600 hover:bg-orange-50">
                      Switch to Kairos
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      onDisconnect();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50">
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
