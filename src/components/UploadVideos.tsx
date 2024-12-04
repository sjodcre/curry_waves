import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useActiveAddress } from 'arweave-wallet-kit';
import { useConnection } from 'arweave-wallet-kit';
import Arweave from 'arweave';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { TagType } from '@/lib/ProfileUtils';
import { useArweaveProvider } from '@/context/ProfileContext';
import { connect as aoConnect, createDataItemSigner } from '@permaweb/aoconnect';
import { GATEWAYS, getGQLData } from '@/lib/utils';

interface Video {
  id: string;
  file: File;
  preview: string;
  size: number;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const arrayBuffer = reader.result as ArrayBuffer;
			const buffer = Buffer.from(arrayBuffer);
			resolve(buffer);
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsArrayBuffer(file);
	});
}

export function cleanProcessField(value: string) {
	let updatedValue: string;
	updatedValue = value.replace(/\[|\]/g, '');
	return `[[${updatedValue}]]`;
}

interface UploadVideosProps {
  onUpload: (videoTxId: string | null) => void;
  onCancel: () => void;
  api: any;
}

const VideoUploader: React.FC<UploadVideosProps> = ({ onUpload, onCancel, api }) => {
  const [video, setVideo] = useState<Video | null>(null);
  const { connect: connectWallet } = useConnection();
  const activeAddress = useActiveAddress();
  const arProvider = useArweaveProvider();

  const hasLargeVideo = video?.size && video.size > 5 * 1024 * 1024; // 5MB in bytes

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]; // Only take the first file
      const newVideo = {
        id: URL.createObjectURL(file),
        file,
        preview: URL.createObjectURL(file),
        size: file.size
      };
      setVideo(newVideo);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: { 'video/*': [] },
    maxFiles: 1 // Only allow one file
  });

  const uploadToArweave = async () => {
    const aos = aoConnect();

    if (!video) {
      toast({
        description: "No video to upload!"
      });
      return;
    }
    
    console.log("activeAddress", activeAddress);
    if (!activeAddress) {
      await connectWallet();
    }

    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    const videoTxIds: { txid: string; path: string; type: string }[] = [];

    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const data = event.target?.result;
          if (data) {
            const dateTime = new Date().getTime().toString();
            const title = "hardcode title";
            const description = "hardcode description";
            const balance = 1;
            let contentType = video.file.type;
            console.log("contentType", contentType);
            try {
                const assetTags: TagType[] = [
                    { name: 'Content-Type', value: contentType },
                    { name: 'Creator', value: arProvider?.profile?.id || "ANON" },
                    { name: 'Title', value: title },
                    { name: 'Description', value: description }, 
                    { name: 'Type', value: contentType },
                    { name: 'Implements', value: 'ANS-110' },
                    { name: 'Date-Created', value: dateTime },
                    { name: 'Action', value: 'Add-Uploaded-Asset' },
                    { name: 'topic:gaming', value: 'gaming' },
                    { name: 'License', value: 'dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw' },
                    { name: 'Currency', value: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10' },
                    { name: 'Access-Fee', value: 'One-Time-0.001' },
                    { name: 'Derivations', value: 'Allowed-With-One-Time-Fee-0.01' },
                    { name: 'Commercial-Use', value: 'Allowed-With-One-Time-Fee-0.01' },
                    { name: 'Data-Model-Training', value: 'Disallowed' },
                    { name: 'Payment-Mode', value: 'Single' },
                    { name: 'Payment-Address', value: 'dMAl8ZjkibRhma_rN8pDYiBW1DeWhvKYcBfqUfu-VhA' }
                ];
                const buffer: any = await fileToBuffer(video.file);
                let processSrc = null;
                try {
                    const processSrcFetch = await fetch("https://arweave.net/6-Km3rEooyc0lS4_mr9pksnJZNCHxb0XcsI7pSCE-yY");
                    if (processSrcFetch.ok) {
                        processSrc = await processSrcFetch.text();
                    }
                } catch (e: any) {
                    console.error(e);
                }

                if (processSrc) {
                    processSrc = processSrc.replaceAll('<CREATOR>', arProvider?.profile?.id || "ANON");
                    processSrc = processSrc.replaceAll(`'<NAME>'`, cleanProcessField(title));
                    processSrc = processSrc.replaceAll('<TICKER>', 'ATOMIC');
                    processSrc = processSrc.replaceAll('<DENOMINATION>', '1');
                    processSrc = processSrc.replaceAll('<BALANCE>', balance.toString());
                    processSrc = processSrc.replaceAll('<COLLECTION>', "");
                }

                let processId: string | undefined = undefined;
                let retryCount = 0;
                const maxSpawnRetries = 25;

                while (processId === undefined && retryCount < maxSpawnRetries) {
                    try {
                        processId = await aos.spawn({
                            module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
                            scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
                            signer: createDataItemSigner(window.arweaveWallet),
                            tags: assetTags,
                            data: buffer,
                        });
                        console.log(`Asset process: ${processId}`);
                    } catch (e: any) {
                        console.error(`Spawn attempt ${retryCount + 1} failed:`, e);
                        retryCount++;
                        if (retryCount < maxSpawnRetries) {
                            await new Promise((r) => setTimeout(r, 1000));
                        } else {
                            throw new Error(`Failed to spawn process after ${maxSpawnRetries} attempts`);
                        }
                    }
                }

                if (!processId) {
                    throw new Error("Failed to get valid process ID");
                }

                let fetchedAssetId: string | undefined = undefined;
                retryCount = 0;
                const maxFetchRetries = 100;
                while (fetchedAssetId === undefined) {
                    await new Promise((r) => setTimeout(r, 2000));
                    const gqlResponse = await getGQLData({
                        gateway: GATEWAYS.goldsky,
                        ids: [processId],
                        tagFilters: null,
                        owners: null,
                        cursor: null,
                    });

                    if (gqlResponse && gqlResponse.data.length) {
                        console.log(`Fetched transaction:`, gqlResponse.data[0].node.id);
                        fetchedAssetId = gqlResponse.data[0].node.id;
                    } else {
                        console.log(`Transaction not found:`, processId);
                        retryCount++;
                        if (retryCount >= maxFetchRetries) {
                            throw new Error(
                                `Transaction not found after ${maxFetchRetries} attempts, process deployment retries failed`
                            );
                        }
                    }
                }

                if (fetchedAssetId) {
                    const evalMessage = await aos.message({
                        process: processId,
                        signer: createDataItemSigner(window.arweaveWallet),
                        tags: [{ name: 'Action', value: 'Eval' }],
                        data: processSrc || "",
                    });

                    const evalResult = await aos.result({
                        message: evalMessage,
                        process: processId,
                    });

                    if (evalResult) {
                        await aos.message({
                            process: processId,
                            signer: createDataItemSigner(window.arweaveWallet),
                            tags: [
                                { name: 'Action', value: 'Add-Asset-To-Profile' },
                                { name: 'ProfileProcess', value: arProvider?.profile?.id || "ANON" },
                                { name: 'Quantity', value: balance.toString() },
                            ],
                            data: JSON.stringify({ Id: processId, Quantity: balance }),
                        });
                        videoTxIds.push({ txid: processId, path: "0", type: video.file.type });
                        resolve();
                    }
                } else {
                    toast({
                      description: "Error fetching from gateway",
                    });
                    reject(new Error("Error fetching from gateway"));
                }
            } catch (error) {
              reject(error);
            }
          }
        };
        reader.readAsArrayBuffer(video.file);
      });

        console.log('Images uploaded successfully:', videoTxIds[0].txid);
        toast({
          description: "Uploaded to Arweave!",
        });
        onUpload(videoTxIds[0].txid);

      // const jsonIndex = {
      //   media: videoTxIds.map(({ txid, path, type }) => ({
      //     path: path,
      //     txid: txid,
      //     type: type
      //   }))
      // };
      // const jsonContent = JSON.stringify(jsonIndex, null, 2);
      // // const jsonTransaction = await arweave.createTransaction({ data: jsonContent }, "use_wallet");
      // const jsonTransaction = await arweave.createTransaction({ data: jsonContent });

      // jsonTransaction.addTag("Content-Type", "application/json");
      // // await arweave.transactions.sign(jsonTransaction, "use_wallet");
      // await api.sign(jsonTransaction);

      // const jsonResponse = await arweave.transactions.post(jsonTransaction);
      // if (jsonResponse.status !== 200) {
      //   throw new Error("Failed to upload JSON index");
      // }
      // const jsonIndexTxId = jsonTransaction.id;
      // console.log("JSON index uploaded successfully:", jsonIndexTxId);

      // const manifest = {
      //   manifest: "arweave/paths",
      //   version: "0.2.0",
      //   index: { path: "index.json" },
      //   paths: {
      //     "0": { id: videoTxIds[0].txid },
      //     "index.json": { id: jsonIndexTxId }
      //   }
      // };

      // const manifestTransaction = await arweave.createTransaction(
      //   { data: JSON.stringify(manifest) },
      //   "use_wallet"
      // );
      // manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');
      // await arweave.transactions.sign(manifestTransaction, "use_wallet");
      // const manifestResponse = await arweave.transactions.post(manifestTransaction);

      // if (manifestResponse.status === 200) {
      //   console.log('Manifest uploaded successfully:', manifestTransaction.id);
      //   toast({
      //     description: "Uploaded to Arweave!",
      //   });
      //   onUpload(manifestTransaction.id);
      // } else {
      //   console.error('Failed to upload manifest');
      //   onUpload(null);
      // }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <p>Drag & drop a video here, or click to select a file</p>
      </div>
      {video && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <video
            src={video.preview}
            controls
            style={{ width: '100%', maxWidth: '600px' }}
            className="mx-auto"
          />
        </div>
      )}
      <div className="flex items-center">
        <span className="mr-2 text-xs font-medium">This asset will contain a license</span>
        <input type="checkbox" defaultChecked className="mt-0.5" />
      </div>
      {hasLargeVideo && (
        <p className="text-red-500 mt-2">Cannot upload videos larger than 5MB</p>
      )}
      <div className="flex gap-4 mt-4">
        <Button
          type="submit"
          onClick={uploadToArweave}
          disabled={hasLargeVideo || false}
        >Upload
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default VideoUploader;