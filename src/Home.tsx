// import BOOKS from "./constants/books_process";
// import BooksCrud from "./components/books-crud";
// import { ArweaveWalletKit } from "arweave-wallet-kit";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import ViewPosts from "./components/ViewPosts";
import { useArweaveProvider } from "./context/ProfileContext";
import { useEffect } from "react";
import { processId } from "./config/config";
// import { ArweaveProvider } from "./context/ProfileContext";
// import UserProfile, { User } from "./components/UserProfile";

function Home() {
    const arProvider = useArweaveProvider(); // Get the provider

//   const [userProfile, setUserProfile] = useState<User | null>(null); // Use the User interface
useEffect(() => {
    const sendMessageToAOProcess = async () => {
        console.log("attempting to register user")
        console.log("profile version", arProvider.profile?.version)
      if (arProvider.profile?.version) {
        try {
          const res = await message({
            process: processId,
            tags: [
              { name: "Action", value: "Register-User" }, // Replace with your action name
              { name: "PID", value: arProvider.profile.id},
              { name: "Name", value: arProvider.profile.username || "ANON" },
            ],
            signer: createDataItemSigner(window.arweaveWallet), // Sign the message
          });

          console.log("Message sent successfully:", res);
          const createResult = await result({
            process: processId,
            message: res,
          });
    
          console.log("Created successfully", createResult);
          console.log(createResult.Messages[0].Data);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    };

    sendMessageToAOProcess();
  }, [arProvider.profile, arProvider.profile?.version]); 

  return (

        <>
        {/* <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} /> */}
        <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <div className="flex-grow">
            <div className="flex-grow">
                <div className="text-white">
                    <ViewPosts />
                </div>
                
            </div>
            </div>
        </div>
        </>
  );
}

export default Home;
