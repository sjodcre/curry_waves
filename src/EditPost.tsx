import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message, createDataItemSigner, result } from "@permaweb/aoconnect";
import { useArweaveProvider } from "@/context/ArweaveProvider";
import { toast } from "@/components/ui/use-toast";
import { processId } from "./config/config";
import { Post } from "./components/ViewPosts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import UploadSlides from "./components/UploadSlides";

const EditPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const arProvider = useArweaveProvider();
  const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [postTitle, setPostTitle] = useState<string>("");
  const [postBody, setPostBody] = useState<string>("");

  // const [manifestTxid, setManifestTxid] = useState<string | null>(null);
  const [videoTxid, setVideoTxid] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [slides, setSlides] = useState<string[]>([]);
  const [media, setMedia] = useState<string>("");
  // const [currentSlide, setCurrentSlide] = useState(0);

  // const fetchVideo = async (videoId: string): Promise<any | null> => {
  //   try {
  //     const response = await fetch(`https://arweave.net/${videoId}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch manifest');
  //     }

  //     console.log("response", response)
  //     return response;
  //   } catch (error) {
  //     console.error('Error fetching video:', error);
  //     return null;
  //   }
  // };

  // const extractImageUrls = (paths: { path: string; txid: string }[]): string[] => {
  //   return paths.map(({ txid }) => `https://arweave.net/${txid}`);
  // };

  useEffect(() => {
    const fetchPostData = async () => {
      console.log("fetching post data")
      if (!arProvider.profile) return;
      if (!postId) return;

      try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Get-Post" },
            { name: "Post-Id", value: postId },
          ],
          // signer: createDataItemSigner(window.arweaveWallet),
          signer: createDataItemSigner(arProvider.wallet),
        });

        const postResult = await result({
          process: processId,
          message: res,
        });

        const fetchedPost = postResult.Messages[0].Data;
        const postData = JSON.parse(fetchedPost)[0];
        setPost(postData);
        setPostTitle(postData.Title);
        setPostBody(postData.Body || "");

        // const video = await fetchVideo(postData.Manifest);
        // if (video) {
        //   let mediaUrls: string[] = [];
        //   if (postData.MediaType === 'image' && manifest.images) {
        //     mediaUrls = extractImageUrls(manifest.images);
        //   } else if (postData.MediaType === 'video' && manifest.media) {
        //     mediaUrls = manifest.media.map((item: { txid: string }) => 
        //       `https://arweave.net/${item.txid}`
        //     );
        //   }
        const video = `https://arweave.net/${postData.VideoTxId}`
          setMedia(video);
        // }
      } catch (error) {
        console.error("Error fetching post data:", error);
        toast({ description: "Failed to fetch post data." });
      }
    };
    
    const locationPost = location.state?.post;
    if (locationPost) {
      setPost(locationPost);
      setPostTitle(locationPost.Title);
      setPostBody(locationPost.Body || "");
    } else {
      fetchPostData();
    }
  }, [postId, arProvider.profile, location.state]);

  const handleSlidesUpload = (txid: string | null) => {
    console.log(" storing txid to state after  uploading: ", txid)
    if (txid) {
      // setManifestTxid(txid);
      setVideoTxid(txid);
      setIsDialogOpen(false);
      toast({
        description: 'Images updated successfully.',
      });
    } else {
      toast({
        description: 'Failed to upload slides.',
      });
    }
  };

  const updatePost = async () => {
    if (!post?.AutoID) return;
    try {
      const res = await message({
        process: processId,
        tags: [
          { name: "Action", value: "Update-Post" },
          { name: "PostId", value: post?.AutoID.toString() },
          { name: "Title", value: postTitle },
          // ...(manifestTxid ? [{ name: "Manifest", value: manifestTxid }] : []),
          ...(videoTxid ? [{ name: "VideoTxId", value: videoTxid }] : []),
        ],
        data: postBody,
        // signer: createDataItemSigner(window.arweaveWallet),
        signer: createDataItemSigner(arProvider.wallet),
      });

      console.log("res", res)

      const updateResult = await result({
        process: processId,
        message: res,
      });

      console.log("updateResult", updateResult)

      if (updateResult.Messages[0].Data === "Post updated successfully.") {
        toast({
          description: "Post updated successfully!!",
        });
        navigate('/');
      }
    } catch (error) {
      console.log("Error updating post:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#242424] text-white">
      <div className="max-w-3xl mx-auto bg-[#2a2a2a] rounded-xl p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-5xl font-light mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Edit Post
        </h1>

        {/* Display current media */}
        {/* {slides.length > 0 && post?.MediaType === 'image' && (
          <div className="mb-12">
            <div className="relative aspect-[16/9] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {slides.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Slide ${index + 1}`}
                    className="absolute w-full h-full object-contain transition-all duration-500 ease-in-out"
                    style={{ 
                      opacity: currentSlide === index ? 1 : 0,
                      transform: currentSlide === index ? 'scale(1)' : 'scale(0.95)'
                    }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  →
                </button>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white/80">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>
          </div>
        )} */}

        {media.length > 0  && (
          <div className="mb-12">
            <div className="relative aspect-[16/9] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden">
              <video
                src={media} 
                controls
                className="absolute w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {videoTxid && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400">Images have been successfully reuploaded!</p>
          </div>
        )}
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="title" className="text-lg font-light text-gray-300">
              Title
            </label>
            <input
              id="title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full h-12 px-4 bg-[#333333] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-100"
              placeholder="Edit title..."
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="body" className="text-lg font-light text-gray-300">
              Content
            </label>
            <textarea
              id="body"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              className="w-full h-64 p-4 bg-[#333333] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-100 resize-none"
              placeholder="Edit your post..."
            />
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 mb-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#242424]"
          >
            Reupload Images
          </button>
          <button 
            onClick={updatePost} 
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#242424]"
          >
            Save Changes
          </button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify Post Images</DialogTitle>
              <DialogDescription>Upload new images for your post</DialogDescription>
            </DialogHeader>
            <UploadSlides onUpload={handleSlidesUpload} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditPost;