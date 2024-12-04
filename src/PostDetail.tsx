import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { useArweaveProvider } from "@/context/ProfileContext"; // Import your provider
import { toast } from "@/components/ui/use-toast"; // Import toast for notifications
import { processId } from "./config/config";
import { Post } from "./components/ViewPosts";
import MediaDisplay from "./components/MediaDisplay";

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Get the post ID from the URL
  const arProvider = useArweaveProvider(); // Get the Arweave provider
//   const [post, setPost] = useState<any>(null); // State to hold the post data
const [post, setPost] = useState<Post | null>(null); // State to manage the selected post for the dialog
// const [slides, setSlides] = useState<string[]>([]); // State to hold image URLs
const [video, setVideo] = useState<string[]>([]); // State to hold video URLs
  // const [currentSlide, setCurrentSlide] = useState(0); // State to manage the current slide index
  const navigate = useNavigate(); // Initialize useNavigate


  useEffect(() => {
    const fetchPostData = async () => {
      if (!arProvider.profile) return; // Ensure the profile is available
      if (!postId) return;
      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Get-Post" },
            { name: "Post-Id", value: postId },
          ],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        const postResult = await result({
          process: processId,
          message: res,
        });

        // console.log("postResult: ", postResult);

        const fetchedPost = postResult.Messages[0].Data; // Assuming the post data is in the first message
        const parsedPost = JSON.parse(fetchedPost)[0];
        setPost(parsedPost); // Parse and set the post data
        console.log("post: ", parsedPost);
        
        // Fetch the manifest for media
        // const video = await fetchVideo(parsedPost.);
        // if (video) {
        //   let mediaUrls: string[] = [];
        //   if (parsedPost.MediaType === 'image' && manifest.images) {
        //     mediaUrls = extractImageUrls(manifest.images);
        //   } else if (parsedPost.MediaType === 'video' && manifest.media) {
        //     mediaUrls = manifest.media.map((item: { txid: string }) => 
        //       `https://arweave.net/${item.txid}`
        //     );
        //   }
        //   setSlides(mediaUrls);
        // }
        const video = `https://arweave.net/${parsedPost.VideoTxId}`
        setVideo([video]);
      } catch (error) {
        console.error("Error fetching post data:", error);
        toast({ description: "Failed to fetch post data." });
      }
    };

    fetchPostData();
    // arProvider.profile?.id === post.Author
    console.log("arProvider", arProvider)
    console.log("post", post)
  }, [postId, arProvider.profile]);

  // const fetchVideo = async (videoId: string): Promise<any | null> => {
  //   try {
  //     const response = await fetch(`https://arweave.net/${videoId}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch manifest');
  //     }
  //     console.log("response: ", response)
  //     // const manifest = await response.json();
  //     return response; // Return the full manifest
  //   } catch (error) {
  //     console.error('Error fetching manifest:', error);
  //     return null;
  //   }
  // };

  // const extractImageUrls = (paths: { path: string; txid: string }[]): string[] => {
  //   return paths.map(({ txid }) => `https://arweave.net/${txid}`);
  // };

  if (!post) return <div>Loading...</div>; // Loading state

  return (
    <div className="min-h-screen p-8 bg-[#242424] text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent p-4 border-2 border-blue-400/30 rounded-lg shadow-lg">
            {post.Title}
          </h1>
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center">
              <span className="text-sm">By</span>
              <button 
                onClick={() => toast({ description: `Viewing ${post.Author}'s profile` })}
                className="ml-2 font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
              >
                {post.Author}
              </button>
              {arProvider.profile?.id === post.PID && (
                <button 
                    // onClick={() => navigate(`/edit-post/${post.ID}`)} // Navigate to edit page
                    onClick={() => navigate(`/edit-post/${post.ID}`, { state: { post } })} // Pass the entire post
                    className="ml-4 text-sm text-blue-500 hover:text-blue-400 underline"
                >
                    Edit
                </button>
                )}
            </div>
            <div className="text-sm text-right">
              {new Date(post.Timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} {' • '}
              {(() => {
                const diff = Date.now() - new Date(post.Timestamp).getTime();
                const minutes = Math.floor(diff / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
                if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
                if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
                return 'Just now';
              })()}
            </div>
          </div>
        </div>

        <MediaDisplay
          media={video}
          mediaType={"video"}
        />

        {/* Content Section */}
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-gray-300">
            {post.Body}
          </p>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span className="text-gray-400">{post.LikeCount} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;