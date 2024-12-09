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
  Bookmark,
  BadgeDollarSign,
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

import UploadVideos from "./UploadVideos";

import { processId } from "@/config/config";
import MediaDisplay from "./MediaDisplay";
import { sellPost, buyPost, cancelSellPost } from "@/lib/PostTx";
import { Input } from "./ui/input";
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
  Bookmarked?: boolean;
  LikeCount: number; // New property for like count, default to 0 if not provided
  // Manifest: string;
  // MediaType?: 'image' | 'video';
  Price: number;
  VideoTxId: string;
  SellingStatus: boolean; // Whether the post is available for sale

}

// const ViewPosts = ({ userProfile }: ViewPostsProps) => {
const ViewPosts = () => {
  const [currentPostId, setCurrentPostId] = useState<string | null>(null); // State to hold the current post ID
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // State to manage the selected post for the dialog
  const { connected } = useConnection();
  // @ts-ignore
  const [videoTxId, setVideoTxId] = useState<string | null>(null); // State to hold the video transaction ID
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog open/close
  const [isloading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editPostTitle, setEditPostTitle] = useState(""); // State for editing title
  const [editPostBody, setEditPostBody] = useState(""); // State for editing body
  // @ts-ignore
  const [mediaType, setMediaType] = useState(""); // State for media type
  const navigate = useNavigate(); 
// @ts-ignore
  const [postDescription, setPostDescription] = useState("");
  // @ts-ignore
  const [postTitle, setPostTitle] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const { toast } = useToast();
  const api = useApi();
  const arProvider = useArweaveProvider();


  const fetchPosts = async () => {
    // if (!connected) return;
    setIsLoading(true);
    console.log("arProvider.profile: ", arProvider.profile);
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
        // console.log("parsedData before mapping: ", parsedData);
        return parsedData.map((post: any) => ({
            ...post,
            LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
            }));
        });
        console.log("fetched posts: ", parsedPosts[0]);
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

  const fetchBookmarkedPosts = async () => {
    if (!connected) return;
    if (!arProvider.profile) return;
    setIsLoading(true);
    try {
      const response = await dryrun({
        process: processId,
        tags: [
          { name: "Action", value: "Get-Bookmarked-Posts" },
          { name: "Author-Id", value: arProvider.profile.walletAddress },
        ],
      });
      const parsedPosts = response.Messages.map((msg) => {
        const parsedData = JSON.parse(msg.Data);
      //   return parsedData;
      console.log("parsedPosts before mapping: ", parsedData);
      return parsedData.map((post: any) => ({
          ...post,
          LikeCount: post.LikeCount || 0, // Ensure LikeCount defaults to 0
          }));
      });
      console.log("parsedPosts after mapping: ", parsedPosts[0]);
      setBookmarkedPosts(parsedPosts[0]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

//   const extractImageUrls = (paths: { path: string; txid: string }[]): string[] => {
//     return paths.map(({ txid }) => `https://arweave.net/${txid}`);
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
      
      }
    } catch (error) {
      console.log(error);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts(); // Fetch all posts
    await fetchUserPosts(); // Fetch user-specific posts
    await fetchBookmarkedPosts(); // Fetch bookmarked posts
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
      refreshPosts();

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

  const handleBookmarkPost = async (location: string, post: Post) => {
    const updatedPost = { ...post }; // Create a copy of the post to update
    if (!post.Bookmarked) {
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Save-Post" },
            { name: "PostID", value: post.AutoID.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        console.log("Save Post result", res);

        const saveResult = await result({
          process: processId,
          message: res,
        });

        console.log("Post saved", saveResult);
        console.log(saveResult.Messages[0].Data);

        if (saveResult.Messages[0].Data === "Post saved to bookmarks successfully.") {
          toast({
            description: "Post saved to bookmarks successfully!"
          });
          updatedPost.Bookmarked = true; // Update the local state
        }
          
      } catch (error) {
          console.log(error);
          toast({
              description: "Error saving post"
          });
          throw error;
      }
    } else {
      // Handle removing bookmark case
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Unsave-Post" },
            { name: "PostID", value: post.AutoID.toString() },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });
        console.log("Unsave Post result", res);

        const unsaveResult = await result({
          process: processId,
          message: res,
        });

        console.log("Post unsaved", unsaveResult);
        console.log(unsaveResult.Messages[0].Data);

        if (unsaveResult.Messages[0].Data === "Post removed from bookmarks successfully.") {
          toast({
            description: "Post removed from bookmarks successfully!"
          });
          updatedPost.Bookmarked = false; // Update the local state
        }
          
      } catch (error) {
          console.log(error);
          toast({
              description: "Error saving post"
          });
          throw error;
      }
    }

    if(location === "all-posts") {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
      );
    } else if (location === "bookmarked") {
      setBookmarkedPosts((prevPosts) =>
        prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
      );
    }
    
    // setPosts((prevPosts) =>
    //   prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
    // );
  };

  // Utility functions moved to utils file
  const handleSellOrCancelSell = async (post: Post, price: number) => {
    if (!arProvider.profile) return;
    setIsLoading(true);
    
    try {
      if (!post.SellingStatus) {
        const sellResult = await sellPost(post.AutoID.toString(), window.arweaveWallet, price);
        if (sellResult === "Post listed for sale successfully.") {
          toast({
            description: "Post listed for sale successfully!!"
          });

        }
      } else {
        const cancelResult = await cancelSellPost(post.AutoID.toString(), window.arweaveWallet);
        if (cancelResult === "Post sale cancelled successfully.") {
          toast({
            description: "Post sale cancelled successfully!"
          });

        }
      }
    } catch (error) {
      console.log(error);
      toast({
        description: "Error with post sale action"
      });
    } finally {
      setIsLoading(false);
      refreshPosts();
    }
  };

  const handleBuyOrCancelSell = async (post: Post) => {
    if (!arProvider.profile) return;
    setIsLoading(true);

    try {
      // Check if the current user is the post owner
      if (arProvider.profile.id === post.PID) {
        const cancelResult = await cancelSellPost(post.AutoID.toString(), window.arweaveWallet);
        if (cancelResult === "Post sale cancelled successfully.") {
          toast({
            description: "Post sale cancelled successfully!"
          });

        }
      } else {
        const buyResult = await buyPost(post.AutoID.toString(), window.arweaveWallet);
        if (buyResult === "Post purchased successfully.") {
          toast({
            description: "Post purchased successfully!"
          });

        }
      }
    } catch (error) {
      console.log(error);
      toast({
        description: "Error with post action"
      });
    } finally {
      setIsLoading(false);
      refreshPosts();

    }
  };

  const handlePostClick = (post: Post) => {
    navigate(`/post/${post.ID}`); // Navigate to the post detail page
  };


  // const handleCommentLoad = async (post: Post) => {
  //   console.log("post comment: ", post);
  //   toast({
  //       description: "Commentable in the future!!",
  //     });
  // };

  const handleLikeToggle = async (location: string, post: Post) => {
    const updatedPost = { ...post }; // Create a copy of the post to update

    if (post.Liked) {
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
    if(location === "all-posts") {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
      );
    } else if (location === "bookmarked") {
      setBookmarkedPosts((prevPosts) =>
        prevPosts.map((p) => (p.ID === updatedPost.ID ? updatedPost : p))
      );
    }
    
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
        refreshPosts();
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
      fetchPosts();
  }, []);

  useEffect(() => {
    if (connected) {
      refreshPosts();

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-posts" >All Posts</TabsTrigger>
              <TabsTrigger value="your-posts" onClick={() => fetchUserPosts()}>Your Posts</TabsTrigger>
              <TabsTrigger value="bookmarked" onClick={() => fetchBookmarkedPosts()}>Bookmarked</TabsTrigger>
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
                                    handleLikeToggle("all-posts", post);
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
                                {/* <span
                                  className="cursor-pointer flex items-center text-gray-500"
                                  onClick={() => handleCommentLoad(post)}
                                  title="Comment"
                                >
                                  <MessageCircle size={20} />
                                </span> */}
                                <span
                                  className={`cursor-pointer flex items-center ${post.Bookmarked ? 'text-blue-500' : 'text-white'}`}
                                  onClick={() => handleBookmarkPost("all-posts", post)}
                                  title="Bookmark"
                                >
                                  <Bookmark fill={post.Bookmarked ? 'blue' : ''} size={20} />
                                </span>
                                <span
                                  className="cursor-pointer flex items-center text-green-500"
                                  onClick={() => handleSendTip(post)}
                                  title="Tip"
                                >
                                  <BadgeDollarSign size={20} />
                                </span>
                                {post.SellingStatus && (
                                  <div className="flex items-center gap-2 ml-auto">
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
                                              `This post costs ${post.Price} AR. Are you sure you want to buy it?`
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
                                    <span className={`border rounded px-2 py-1 ${arProvider.profile?.id === post.PID ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                      {post.Price} AR
                                    </span>
                                  </div>
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
                                          title="Delete"
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
                                          title="Edit"
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

                                    <div className="flex items-center gap-2 ml-auto">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              className="h-8 w-8 p-0"
                                              title={post.SellingStatus ? "Cancel Sale" : "Sell"}
                                            >
                                              {post.SellingStatus ? (
                                                <Ban size={20} className="text-red-500" />
                                              ) : (
                                                <ShoppingBag size={20} className="text-yellow-500" />
                                              )}
                                            </Button>
                                            {post.SellingStatus && (
                                              <span className={`border rounded px-2 py-1 ${post.SellingStatus ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}`}>
                                                {post.Price} AR
                                              </span>
                                            )}
                                          </div>
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
                                                "Enter the price you would like to sell this post for"
                                              }
                                            </DialogDescription>
                                          </DialogHeader>
                                          {!post.SellingStatus && (
                                            <div className="grid gap-4 py-4">
                                              <div className="grid gap-2">
                                                <Label htmlFor="price">Price (in AR)</Label>
                                                <Input
                                                  id="price"
                                                  type="number"
                                                  placeholder="Enter price..."
                                                  value={sellPrice}
                                                  onChange={(e) => setSellPrice(Number(e.target.value))}
                                                  min="0"
                                                  step="0.01"
                                                />
                                              </div>
                                            </div>
                                          )}
                                          <DialogFooter className="flex justify-end gap-2">
                                            <DialogClose asChild>
                                              <Button variant="outline">
                                                No
                                              </Button>
                                            </DialogClose>
                                            <Button 
                                              variant={post.SellingStatus ? "destructive" : "default"}
                                              onClick={() => handleSellOrCancelSell(post, sellPrice)}
                                            >
                                              Yes
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
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
            <TabsContent value="bookmarked">
              <ScrollArea className="h-[500px] rounded-md border p-4 text-white">
                <div>
                  {isloading ? (
                    <div className="flex items-center space-x-4 text-3xl text-white">
                      Loading...
                    </div>
                  ) : (
                    <div>
                      {bookmarkedPosts?.length > 0 ? (
                        bookmarkedPosts.map((post) => (
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
                                    handleLikeToggle("bookmarked", post);
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
                                  className={`cursor-pointer flex items-center ${post.Bookmarked ? 'text-blue-500' : 'text-white'}`}
                                  onClick={() => handleBookmarkPost("bookmarked", post)}
                                  title="Bookmark"
                                >
                                  <Bookmark fill={post.Bookmarked ? 'blue' : ''} size={20} />
                                </span>
                                <span
                                  className="cursor-pointer flex items-center text-green-500"
                                  onClick={() => handleSendTip(post)}
                                  title="Tip"
                                >
                                  <BadgeDollarSign size={20} />
                                </span>
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
                       
                        <DialogFooter>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
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
