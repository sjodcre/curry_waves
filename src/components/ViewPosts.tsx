import { useState, useEffect } from "react";
// import { useConnection, useActiveAddress } from "@arweave-wallet-kit/react";
import {
  dryrun,
  result,
  message,
  createDataItemSigner,
} from "@permaweb/aoconnect";
// import Arweave from "arweave";
import { Outlet, useNavigate } from "react-router-dom";
// import { signTransaction } from 'arweavekit/transaction';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
// import { Input } from "@/components/ui/input";
import Sidebar from "@/components/ui/sidebar";
import {
  CircleUserRound,
  Trash2,
  Heart,
  FilePenLine,
  Share,
  BadgeDollarSign,
  MessageCircle,
  ShoppingCart,
  Ban,
  ShoppingBag
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {useApi, useConnection } from "arweave-wallet-kit";
// import RegisterModal from "./ui/register-modal";
// import { User } from "./UserProfile";
import { transferAR } from "@/lib/TransferAR";
import { useArweaveProvider } from "@/context/ProfileContext";
// import UploadSlides from "./UploadSlides";
import UploadVideos from "./UploadVideos";

import { processId } from "@/config/config";
import MediaDisplay from "./MediaDisplay";
// import { createManifest, uploadImage, uploadManifest } from "@/lib/ImagesUpload";
// import { User } from "./UserProfile";

// declare global {
//     interface Window {
//         arweaveWallet: any;
//     }
// }
// interface ViewPostsProps {
//   userProfile: User | null; // Use the User interface
// }
export interface Post {
  Title: string;
  Author: string;
  AuthorWallet: string;
  AutoID: number;
  PID: string; // Optional because it may not be present in every case
  ID: string;
  Body?: string; // Optional for cases where it's not included
  Timestamp: number;
  Liked?: boolean;
  LikeCount: number; // New property for like count, default to 0 if not provided
  // Manifest: string;
  // MediaType?: 'image' | 'video';
  VideoTxId: string;
  SellingStatus: boolean; // Whether the post is available for sale

}

// const ViewPosts = ({ userProfile }: ViewPostsProps) => {
const ViewPosts = () => {
  const [currentPostId, setCurrentPostId] = useState<string | null>(null); // State to hold the current post ID
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // State to manage the selected post for the dialog
  const { connected } = useConnection();
  const [currentSlide, setCurrentSlide] = useState(0); // State to manage the current slide index
  const [videoTxId, setVideoTxId] = useState<string | null>(null); // State to hold the video transaction ID
  // const [uploadedSlides, setUploadedSlides] = useState<File[]>([]); // State to hold uploaded slides
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog open/close
  const [isloading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editPostTitle, setEditPostTitle] = useState(""); // State for editing title
  const [editPostBody, setEditPostBody] = useState(""); // State for editing body
  // const [manifestTxid, setManifestTxid] = useState<string | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState(""); // State for media type
  const navigate = useNavigate(); 
  // const [name, setName] = useState("");
//   const activeAddress = useActiveAddress();
  const [postDescription, setPostDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  // const [profile, setProfile] = useState<any[]>([]);
  const { toast } = useToast();
  const api = useApi();
  const arProvider = useArweaveProvider();


  const fetchPosts = async () => {
    // if (!connected) return;
    setIsLoading(true);
    if (arProvider.profile) {
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "List-Posts-Likes" },
          { name: "Author-Id", value: arProvider.profile.walletAddress },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      //   console.log("fetch posts w likes result", result);

      const fetchPostsResult = await result({
        process: processId,
        message: res,
      });

      const parsedPosts = fetchPostsResult.Messages.map((msg) => {
        const parsedData = JSON.parse(msg.Data);
        // return parsedData;
        return parsedData.map((post: any) => ({
          ...post,
          Liked: post.Liked === 1, // Convert Liked to boolean (if present)
          LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
          SellingStatus: post.SellingStatus === 1, // Convert SellingStatus to boolean (if present)

        }));
      });
      console.log("fetched posts with likes: ", parsedPosts[0]);
      setPosts(parsedPosts[0]);

      //   console.log("fetched posts with likes successfully", fetchPostsResult);
      //   console.log(fetchPostsResult.Messages[0].Data);
    } else {
      try {
        // console.log("fetching posts without likes")
        const response = await dryrun({
          process: processId,
          // data: "",
          tags: [{ name: "Action", value: "List-Posts" }],
          // anchor: "latest"
        });
        const parsedPosts = response.Messages.map((msg) => {
          const parsedData = JSON.parse(msg.Data);
        //   return parsedData;
        return parsedData.map((post: any) => ({
            ...post,
            LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
            }));
        });
        // console.log("fetched posts: ", parsedPosts[0]);
        setPosts(parsedPosts[0]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchUserPosts = async () => {
    if (!connected) return;
    if (!arProvider.profile) return;
    setIsLoading(true);
    try {
      // console.log("user profile: ", arProvider.profile);
      const response = await dryrun({
        process: processId,
        // data: "",
        tags: [
          { name: "Action", value: "List-User-Posts" },
          { name: "Author-Id", value: arProvider.profile.walletAddress },
        ],
        // anchor: "latest"
      });
      // console.log("fetched user posts  before parsing: ", response);

      const parsedPosts = response.Messages.map((msg) => {
        const parsedData = JSON.parse(msg.Data);
        // return parsedData;
        return parsedData.map((post: any) => ({
          ...post,
          Liked: post.Liked === 1, // Convert Liked to boolean (if present)
          LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
          SellingStatus: post.SellingStatus === 1, // Convert SellingStatus to boolean (if present)
        }));
      });
      // console.log("fetched user posts: ", parsedPosts[0]);
      setUserPosts(parsedPosts[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchManifest = async (manifestId: string): Promise<Record<string, string> | null> => {
  //   try {
  //     const response = await fetch(`https://arweave.net/${manifestId}`);
  //     console.log("manifest query response: ", response);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch manifest');
  //     }
  
  //     // Check Content-Type header
  //     const contentType = response.headers.get('Content-Type');
  //     console.log("manifest response contentType: ", contentType);
  //     // TODO: check if the manifest is json
  //     // if (!contentType || !contentType.includes('application/json')) {
  //     //   throw new Error('Manifest is not JSON');
  //     // }
  
  //     const manifest = await response.json(); // Parse JSON
  //     console.log("Fetched manifest: ", manifest.images);
  //     return manifest.images;
  //   } catch (error) {
  //     console.error('Error fetching manifest:', error);
  //     return null;
  //   }
  // };

  // const fetchJsonIndex = async (jsonTxId: string): Promise<{ path: string; txid: string }[]> => {
  //   const response = await fetch(`https://arweave.net/${jsonTxId}`);
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch JSON index");
  //   }
  //   const jsonIndex = await response.json();
  //   return jsonIndex.images;
  // };
  
  // const extractImageUrls = (paths: Record<string, string>): string[] => {
  //   return Object.values(paths).map((txId) => `https://arweave.net/${txId}`);
  // };
  const extractImageUrls = (paths: { path: string; txid: string }[]): string[] => {
    return paths.map(({ txid }) => `https://arweave.net/${txid}`);
};

  // const postPosts = async (e: any) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     if (!userProfile) return;
  //     if (!api) return;
  //     try {
  //         // Initialize Arweave
  //         const arweave = Arweave.init({
  //             host: 'arweave.net',
  //             port: 443,
  //             protocol: 'https',
  //         });

  //         // Create a transaction
  //         const transaction = await arweave.createTransaction({
  //             data: postDescription, // The body of the post
  //         }); // Assuming userProfile.wallet contains the wallet key

  //         // Add tags to the transaction
  //         transaction.addTag('Content-Type', 'text/plain'); // Adjust content type as needed
  //         transaction.addTag('Title', postTitle);
  //         transaction.addTag('Author', userProfile.id);

  //         // Sign the transaction
  //         // await arweave.transactions.sign(transaction, window.arweaveWallet);
  //         // await window.arweaveWallet.sign(transaction);
  //         await api.sign(transaction);

  //         // Submit the transaction
  //         const response = await arweave.transactions.post(transaction);

  //         if (response.status === 200) {
  //             console.log("Transaction submitted successfully:", transaction.id);
  //             // Store the transaction ID for further processing
  //             const transactionId = transaction.id;
  //             toast({
  //                 description: "Post created successfully! Transaction ID: " + transactionId,
  //             });
  //         } else {
  //             console.error("Transaction submission failed:", response);
  //         }
  //     } catch (error) {
  //         console.log("Error creating post:", error);
  //     }
  // };

  // const createPosts = async (e: any) => {
  const createPosts = async (videoTxId: string, title: string, description: string) => {

    // e.preventDefault();
    // e.stopPropagation();
    
    if (!arProvider.profile) return;

    // if (!manifestTxid) {
    //   toast({
    //     description: 'Please upload slides before creating the post.',
    //   });
    //   return;
    // }
    toast({
      description: "Storing on AO...",
    });
    try {
      // console.log("postTitle: ", title);
      // console.log("postDescription: ", description);
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Create-Post" },
          { name: "VideoTxId", value: videoTxId },
          { name: "Title", value: title || "Untitled" },
          { name: "Name", value: arProvider.profile.username || "ANON" },
          // { name: "MediaType", value: mediaType.toString() || "video"}, // Add this tag
        ],
        data: description || "No description",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Create Post result", result);

      const createResult = await result({
        process: processId,
        message: res,
      });

      console.log("Created successfully", createResult);
      console.log(createResult.Messages[0].Data);
      //   toast({
      //     description: "Post createad Successfully!!",
      //   });
      if (createResult.Messages[0].Data === "Post created successfully.") {
        toast({
          description: "Post created successfully!!",
        });
        setIsDialogOpen(false); // Close the dialog

        await fetchPosts(); // Fetch all posts
        await fetchUserPosts(); // Fetch user-specific posts
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updatePost = async (postId: string | null) => {
    if (!postId) return; // Ensure postId is valid
    // console.log("postId: ", postId);

    try {
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Update-Post" },
          { name: "PostId", value: postId.toString() },
          { name: "Title", value: editPostTitle },
        ],
        data: editPostBody, // Send updated data
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Update Post result", res);

      const updateResult = await result({
        process: processId,
        message: res,
      });

      console.log("Updated successfully", updateResult);
      console.log(updateResult.Messages[0].Data);

      // toast({
      //     description: "Post updated successfully!!",
      // });
      if (updateResult.Messages[0].Data === "Post updated successfully.") {
        toast({
          description: "Post updated successfully!!",
        });
        // setIsDialogOpen(false); // Close the dialog
      }
      fetchUserPosts(); // Refresh user posts after update
    } catch (error) {
      console.log("Error updating post:", error);
    }
  };

  // const handleSlidesUpload = (txid: string | null) => {
  //   if (txid) {
  //     setManifestTxid(txid); // Save the manifest transaction ID for use in createPosts
  //     setMediaType("image");
  //   } else {
  //     toast({
  //       description: 'Failed to upload slides.',
  //     });
  //   }
  // };

  // const handleVideosUpload = (txid: string | null) => {
  //   if (txid) {
  //     setManifestTxid(txid); // Save the manifest transaction ID for use in createPosts
  //     setMediaType("video");
  //   } else {
  //     toast({
  //       description: 'Failed to upload videos.',
  //     });
  //   }
  // };

  const handleVideosUpload = async (txid: string | null, title: string, description: string) => {
    if (txid) {
      console.log("title at viewposts: ", title);
      console.log("description at viewposts: ", description);
      setVideoTxId(txid);
      setMediaType("video");
      setPostTitle(title);
      setPostDescription(description);
  
      await createPosts(txid, title, description);
      setIsDialogOpen(false); // Close the dialog
      await fetchPosts();
      await fetchUserPosts();
    } else {
      toast({
        description: 'Failed to upload videos.',
      });
    }
  };

  // const handleCancelUpload = () => {
  //   setIsDialogOpen(false);
  // };

  const handleEditPost = (post: Post) => {
    // navigate(`/edit-post/${post.ID}`); // Navigate to edit page
    navigate(`/edit-post/${post.ID}`, { state: { post } }); // Pass the entire post
  };

  const handleDeletePost = (post: Post) => {
    setCurrentPostId(post.AutoID.toString()); // Set the AutoID for the post being deleted
  };

  const handleSharePost = async (post: Post) => {
    console.log("post shared: ", post);
    toast({
        description: "Sharable in the future!!",
      });
  };

  const handleSellOrCancelSell = async (post: Post) => {
    if (!arProvider.profile) return;
    setIsLoading(true);
    if (!post.SellingStatus) {
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Publish-Post-For-Sale" },
            { name: "PostID", value: post.AutoID.toString() },
            { name: "Price", value: "1" },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const sellResult = await result({
          process: processId,
          message: res,
        });

        console.log("Created successfully", sellResult);
        console.log(sellResult.Messages[0].Data);
        //   toast({
        //     description: "Post createad Successfully!!",
        //   });
        if (sellResult.Messages[0].Data === "Post listed for sale successfully.") {
          toast({
            description: "Post listed for sale successfully!!",
          });
          await fetchPosts(); // Fetch all posts
          await fetchUserPosts(); // Fetch user-specific posts
        }
        
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle case when post is already for sale
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Cancel-Post-Sale" },
            { name: "PostID", value: post.AutoID.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const cancelResult = await result({
          process: processId,
          message: res,
        });

        if (cancelResult.Messages[0].Data === "Post sale cancelled successfully.") {
          toast({
            description: "Post sale cancelled successfully!"
          });
          await fetchPosts(); // Fetch all posts
          await fetchUserPosts(); // Fetch user-specific posts
        }
      } catch (error) {
        console.log(error);
        toast({
          description: "Error cancelling post sale"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBuyOrCancelSell = async (post: Post) => {
    if (!arProvider.profile) return;
    setIsLoading(true);

    // Check if the current user is the post owner
    if (arProvider.profile.id === post.PID) {
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Cancel-Post-Sale" },
            { name: "PostID", value: post.AutoID.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const cancelResult = await result({
          process: processId,
          message: res,
        });

        
        if (cancelResult.Messages[0].Data === "Post sale cancelled successfully.") {
          toast({
            description: "Post sale cancelled successfully!"
          });
          await fetchPosts();
          await fetchUserPosts();
        }
      } catch (error) {
        console.log(error);
        toast({
          description: "Error cancelling post sale"
        });
      }
    } else {
      // Placeholder for buy functionality
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Buy-Post" },
            { name: "PostID", value: post.AutoID.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const buyResult = await result({
          process: processId,
          message: res,
        });

        console.log("Buy Post result", buyResult);
        console.log(buyResult.Messages[0].Data);

        if (buyResult.Messages[0].Data === "Post purchased successfully.") {
          toast({
            description: "Post purchased successfully!"
          });
          await fetchPosts();
          await fetchUserPosts();
        }
      } catch (error) {
        console.log(error);
        toast({
          description: "Error cancelling post sale"
        });
      }
    }
    setIsLoading(false);
  };

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.ID}`); // Navigate to the post detail page
  };


  const handleCommentLoad = async (post: Post) => {
    console.log("post comment: ", post);
    toast({
        description: "Commentable in the future!!",
      });
  };

  const handleLikeToggle = async (post: Post) => {
    const updatedPost = { ...post }; // Create a copy of the post to update

    if (post.Liked) {
      console.log("liked");
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Unlike-Post" },
          { name: "PostId", value: post.AutoID.toString() },
        ],
        // data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Unlike Post result", result);

      const unlikeResult = await result({
        process: processId,
        message: res,
      });

      console.log("Unlike successfully", unlikeResult);
      console.log(unlikeResult.Messages[0].Data);
      if (unlikeResult.Messages[0].Data === "Post unliked successfully.") {
        toast({
          description: "Post unliked Successfully!!",
        });
        updatedPost.Liked = false; // Update the local state
        updatedPost.LikeCount = Math.max(0, updatedPost.LikeCount - 1); 
      }
    } else {
      console.log("not liked");
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Like-Post" },
          { name: "PostId", value: post.AutoID.toString() },
        ],
        // data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Like Post result", result);

      const likeResult = await result({
        process: processId,
        message: res,
      });

      console.log("Like successfully", likeResult);
      console.log(likeResult.Messages[0].Data);
      if (likeResult.Messages[0].Data === "Post liked successfully.") {
        toast({
          description: "Post liked Successfully!!",
        });
        updatedPost.Liked = true; // Update the local state
        updatedPost.LikeCount += 1; // Increase like count
      }
    }
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
    );
  };

  const handleSendTip = async (post: Post) => {
    if (!arProvider.profile) return;
    try {
    //   await transferAR(api);
    console.log("post author: ", post.AuthorWallet);
    await transferAR(api, toast, arProvider.profile.walletAddress, post.AuthorWallet); // Pass the toast function

    } catch (error: any) {
      console.error("Error sending tip:", error);
      if (error.message === "Arweave Wallet not connected") {
        alert("Please connect your Arweave Wallet to send a tip.");
      } else {
        alert("Failed to send tip. Please try again.");
      }
    }
  };

  const deletePosts = async (postId: string | null) => {
    if (!postId) return; // Ensure postId is valid
    try {
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Delete-Post" },
          { name: "PostId", value: postId.toString() },
        ],
        // data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("Delete Post result", result);

      const deleteResult = await result({
        process: processId,
        message: res,
      });

      console.log("Deleted successfully", deleteResult);
      console.log(deleteResult.Messages[0].Data);
      if (deleteResult.Messages[0].Data === "Post deleted successfully.") {
        toast({
          description: "Post Deleted Successfully!!",
        });
      }
      fetchUserPosts();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
      fetchPosts();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchPosts();
      fetchUserPosts();
      // Profile();
      console.log("refetching posts and user posts");

    //   console.log("This is the active address: ", activeAddress);
    }
  }, [connected, arProvider.profile]);

  return (
    <main className="px-4 p-4">
      <div className="flex gap-4">
        <div className="flex flex-col w-1/3 rounded-lg p-2 h-[500px]">
          <div className="p-3 grid gap-4">
            <div>
              {arProvider.profile && arProvider.profile.version !== null && (
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <img
                    src={
                      arProvider.profile.avatar
                        ? `https://www.arweave.net/${arProvider.profile.avatar}`
                        : "/random.svg"
                    }
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                  <p>Welcome, {arProvider.profile.username}!</p>
                </div>
              )}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger className="w-full">
                  <Sidebar title="Create Posts" />
                </DialogTrigger>
                {arProvider.profile?.id && arProvider.profile.id !== "" ? (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Posts</DialogTitle>
                      <DialogDescription>Create a new post!</DialogDescription>
                    </DialogHeader>
                    <div className="border-2 border-primary/20 rounded-lg p-4 mt-2">
                    <UploadVideos onUpload={handleVideosUpload} onCancel={() => setIsDialogOpen(false)} api={api} />
                    </div>
                    {/* <DialogFooter> */}
                      
                      {/* <Button
                        type="submit"
                        onClick={(e) => {
                          createPosts(e);
                        }}
                      >
                        Save changes
                      </Button> */}
                    {/* </DialogFooter> */}
                  </DialogContent>
                ) : (
                  <DialogContent>
                    <div>No AO Profile yet. Create one to start posting!</div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
            <div>
              <Dialog>
                <DialogTrigger className="w-full">
                  <Sidebar title="Profile" />
                </DialogTrigger>
                {arProvider.profile && arProvider.profile.id && arProvider.profile.id !== "" ? (
                  <DialogContent>
                    <div className="grid gap-4 py-4">
                      {isloading ? (
                        <div>
                          <div className="flex items-center space-x-4 text-3xl text-black">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="grid mb-3">
                            <div className="rounded-lg px-auto grid gap-y-4 py-1">
                              <p className="text-black text-3xl font-semibold">
                                {arProvider.profile.username}
                              </p>
                              <Label className="text-md font-medium">
                                Wallet ID:{" "}
                              </Label>
                              <h3 className="border text-lg p-3">
                                {arProvider.profile.walletAddress}
                              </h3>
                              {arProvider.profile.id ? (
                                <>
                                  <Label className="text-md font-medium">
                                    AO Profile ID:{" "}
                                  </Label>
                                  <h3 className="border text-lg p-3">
                                    {arProvider.profile.id}
                                  </h3>
                                </>
                              ) : (
                                <h3 className="text-lg">
                                  No AO profile yet. Create one!
                                </h3>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                ) : (
                  <DialogContent>
                    <h3 className="border text-lg p-3">
                      No AO profile yet. Create one!
                    </h3>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        </div>

        {/* <div className="2/3"> */}
        <div className="flex-grow">
          {/* <Tabs defaultValue="all-posts" className="w-[900px]"> */}
          <Tabs defaultValue="all-posts" className="w-full">
            {" "}
            {/* Change width to full */}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all-posts">All Posts</TabsTrigger>
              <TabsTrigger value="your-posts">Your Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="all-posts">
              <ScrollArea className="h-[500px] rounded-md border p-4 text-white">
                <div>
                  {isloading ? (
                    <div className="flex items-center space-x-4 text-3xl text-white">
                      Loading...
                    </div>
                  ) : (
                    <div>
                      {posts?.length > 0 ? (
                        posts.map((post) => (
                          <div key={post.ID} className="grid mb-3">
                            <div className="border rounded-lg px-3 grid gap-y-2 py-3">
                              <div className="flex gap-2 items-center">
                                <CircleUserRound size={20} />
                                <div className="flex gap-2 items-center">
                                  <span className="font-semibold">
                                    {post.Author} | {post.PID.slice(0, 6)}...{post.ID.slice(-6)}
                                  </span>
                                </div>{" "}
                              </div>
                              <div>
                                <h3 
                                  className="text-xl hover:underline hover:cursor-pointer" 
                                  onClick={() => handlePostClick(post)}
                                >
                                  {post.Title}
                                </h3>
                                <div className="flex flex-col gap-4">
                                  <div className="w-full">
                                    <MediaDisplay
                                      media={[`https://arweave.net/${post.VideoTxId}`]}
                                      mediaType={"video"}
                                    />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <span>{post.Body?.slice(0, 30)}</span>
                                    <span 
                                      className="text-blue-500 hover:underline hover:cursor-pointer ml-2"
                                      onClick={() => handlePostClick(post)}
                                    >
                                      View details...
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 post-actions">
                                <span
                                  className="cursor-pointer flex items-center gap-1"
                                  onClick={() => {
                                    if (!arProvider.profile?.version) {
                                      toast({
                                        description: "You cannot like a post, create an AO profile first!"
                                      });
                                      return;
                                    }
                                    handleLikeToggle(post);
                                  }}
                                  title="Like"
                                >
                                  <HeartIcon filled={post.Liked || false} />
                                  <span>
                                    {post.LikeCount >= 1000 
                                      ? (post.LikeCount / 1000).toFixed(1) + 'k'
                                      : post.LikeCount}
                                  </span>
                                </span>
                                <span
                                  className="cursor-pointer text-gray-500"
                                  onClick={() => handleCommentLoad(post)}
                                  title="Comment"
                                >
                                  <MessageCircle size={20} />
                                </span>
                                <span
                                  className="cursor-pointer text-gray-500"
                                  onClick={() => handleSharePost(post)}
                                  title="Share"
                                >
                                  <Share size={20} />
                                </span>
                                <span
                                  className="cursor-pointer text-green-500"
                                  onClick={() => handleSendTip(post)}
                                  title="Tip"
                                >
                                  <BadgeDollarSign size={20} />
                                </span>
                                {post.SellingStatus && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <span
                                        className={`cursor-pointer ${arProvider.profile?.id === post.PID ? 'text-red-500' : 'text-green-500'}`}
                                        title={arProvider.profile?.id === post.PID ? "Cancel Sell" : "Buy Post"}
                                      >
                                        {arProvider.profile?.id === post.PID ? (
                                          <Ban size={20} />
                                        ) : (
                                          <ShoppingCart size={20} />
                                        )}
                                      </span>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          {arProvider.profile?.id === post.PID ? 
                                            "Cancel Sale?" :
                                            "Buy Post?"
                                          }
                                        </DialogTitle>
                                        <DialogDescription>
                                          {arProvider.profile?.id === post.PID ?
                                            "Are you sure you want to cancel the sale of this post?" :
                                            "Are you sure you want to buy this post?"
                                          }
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter className="flex justify-end gap-2">
                                        <DialogClose asChild>
                                          <Button variant="outline">
                                            No
                                          </Button>
                                        </DialogClose>
                                        <Button 
                                          variant={arProvider.profile?.id === post.PID ? "destructive" : "default"}
                                          onClick={() => handleBuyOrCancelSell(post)}
                                        >
                                          Yes
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          No posts available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
              {selectedPost && (
                    <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>{selectedPost.Title}</DialogTitle>
                        <DialogDescription>
                            <p>{selectedPost.Body}</p>
                            <p>Author: {selectedPost.Author}</p>
                            <p>Likes: {selectedPost.LikeCount}</p>
                            <p>Posted: {new Date(selectedPost.Timestamp).toLocaleString('en-US', { timeZoneName: 'short' })}</p>
                        </DialogDescription>
                        </DialogHeader>
                        {slides.length > 0 && (
                          <div className="modal relative">
                            <div className="slideshow w-full h-[400px] relative">
                              <div className="flex items-center justify-center h-full">
                                {slides.map((url, index) => (
                                  <img 
                                    key={index}
                                    src={url}
                                    alt={`Slide ${index + 1}`}
                                    className="w-[600px] h-[400px] object-contain absolute transition-opacity duration-300"
                                    style={{opacity: currentSlide === index ? 1 : 0}}
                                  />
                                ))}
                              </div>
                              <button 
                                onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                              >
                                ←
                              </button>
                              <button 
                                onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                              >
                                →
                              </button>
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {slides.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
                )}
            </TabsContent>
            <TabsContent value="your-posts">
              {!connected ? (
                <div className="flex justify-center text-3xl font-semibold">
                  Please login/connect first
                </div>
              ) : (
                <div>
                  <ScrollArea className="h-[500px] rounded-md border p-4 text-white">
                    <div>
                      {isloading ? (
                        <div className="flex items-center space-x-4 text-3xl text-white">
                          Loading...
                        </div>
                      ) : (
                        <div>
                          {userPosts?.length > 0 ? (

                            userPosts.map((post) => (
                              <div key={post.ID} className="grid mb-3">
                                <div className="border rounded-lg px-3 grid gap-y-2 py-3">
                                  <h3 className="text-xl font-semibold">
                                    {post.Title}
                                  </h3>{" "}
                                  {/* Display Title */}
                                  <p className="text-gray-400 text-sm">
                                    {new Date(post.Timestamp).toLocaleString()}
                                  </p>{" "}
                                  {/* Format Timestamp */}
                                  <div className="text-md">{post.Body}</div>{" "}
                                  {/* Display Body */}
                                  <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleDeletePost(post)}
                                        >
                                          <Trash2 size={20} />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Are you absolutely sure?
                                          </DialogTitle>
                                          <DialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete your post from
                                            the computer!
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button
                                            onClick={() =>
                                              deletePosts(currentPostId)
                                            }
                                            variant={"destructive"}
                                          >
                                            Delete Post
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleEditPost(post)}
                                        >
                                          <FilePenLine size={20} />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit Post</DialogTitle>
                                          <DialogDescription>
                                            Make changes to your post here. Click
                                            save when you're done.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Textarea
                                              id="title"
                                              placeholder="Edit title..."
                                              value={editPostTitle} // Bind to state
                                              onChange={(e) =>
                                                setEditPostTitle(e.target.value)
                                              } // Update state on change
                                              className="h-10"
                                            />
                                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="body">Content</Label>
                                            <Textarea
                                              id="body"
                                              placeholder="Edit your post..."
                                              value={editPostBody} // Bind to state
                                              onChange={(e) =>
                                                setEditPostBody(e.target.value)
                                              } // Update state on change
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <div className="w-full flex justify-between items-center">
                                            <p className="text-sm text-gray-500">Images uploaded will be able to be edited soon!</p>
                                            <Button
                                              type="submit"
                                              onClick={() =>
                                                updatePost(currentPostId)
                                              }
                                            >
                                              Save changes
                                            </Button>
                                          </div>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                        >
                                          {post.SellingStatus ? (
                                            <Ban size={20} className="text-red-500" />
                                          ) : (
                                            <ShoppingBag size={20} className="text-yellow-500" />
                                          )}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            {post.SellingStatus ? 
                                              "Cancel Sale?" :
                                              "List Post For Sale?"
                                            }
                                          </DialogTitle>
                                          <DialogDescription>
                                            {post.SellingStatus ?
                                              "Are you sure you want to cancel the sale of this post?" :
                                              "Would you like to list this post for sale?"
                                            }
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="flex justify-end gap-2">
                                          <DialogClose asChild>
                                            <Button variant="outline">
                                              No
                                            </Button>
                                          </DialogClose>
                                          <Button 
                                            variant={post.SellingStatus ? "destructive" : "default"}
                                            onClick={() => handleSellOrCancelSell(post)}
                                          >
                                            Yes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            ))
                          ):(
                            <div className="text-center py-4">
                          No posts available
                        </div>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
      <Outlet />
    </main>
  );
};

const HeartIcon = ({ filled }: { filled: boolean }) => {
  return filled ? (
    <Heart size={20} fill="red" strokeWidth={0} />
  ) : (
    <Heart size={20} />
  );
};

export default ViewPosts;
