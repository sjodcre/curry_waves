// src/components/Header.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "arweave-wallet-kit";
import { useArweaveProvider } from "@/context/ProfileContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; 

const Header: React.FC = () => {
  const location = useLocation();
  const arProvider = useArweaveProvider();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog

  const handleCreateProfile = () => {
    setIsDialogOpen(true); // Open the dialog
  };

  return (
    <header className="w-full flex justify-between items-center p-4 text-white">
      <div className="flex items-center">
        <img src="/ao.svg" alt="Logo" className="h-8 mr-2" />
        {location.pathname === "/" && (
          <Link
            to={"/about/"}
            className="text-lg hover:underline border border-white px-3 py-1 rounded"
          >
            About
          </Link>
        )}
        {(location.pathname === "/about/" || location.pathname.startsWith("/post/") || location.pathname.startsWith("/edit-post/")) && (
          <Link
            to={"/"}
            className="text-lg hover:underline border border-white px-3 py-1 rounded"
          >
            Home
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4 text-black">
        {arProvider.profile?.version === null && (
          <Button variant="outline" onClick={handleCreateProfile}>
            Create Profile
          </Button>
        )}
        <ConnectButton profileModal={true} showBalance={true} />
      </div>

      {/* Dialog for creating profile */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Profile</DialogTitle>
            <DialogDescription>
              For now, profiles need to be created through{" "}
              <a 
                href="https://bazar.arweave.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Bazar
              </a>
              {" "}({" "}
              <a
                href="https://bazar.arweave.dev"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                https://bazar.arweave.dev
              </a>
              {" "}). Connect your wallet and look for the profile creation option in the top right.
              <p className="mt-4 text-sm italic">don't worry dawg. we got you. we will be implementing this soon!</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );

};

export default Header;
