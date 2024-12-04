import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useActiveAddress } from 'arweave-wallet-kit';
import { useConnection } from 'arweave-wallet-kit';
import Arweave from 'arweave';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface Slide {
  id: string;
  file: File;
  preview: string;
}

interface UploadSlidesProps {
  onUpload: (manifestTxid: string | null) => void; // Define the onUpload prop
}

const SortableItem: React.FC<{ id: string; preview: string }> = ({ id, preview }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={preview} alt="Slide preview" style={{ width: '100px', height: 'auto' }} />
    </div>
  );
};

const SlideUploader: React.FC<UploadSlidesProps> = ({ onUpload }) => { // Accept the onUpload prop
  const [slides, setSlides] = useState<Slide[]>([]);
  const { connect } = useConnection();
  const activeAddress = useActiveAddress();

  const onDrop = (acceptedFiles: File[]) => {
    const newSlides = acceptedFiles.map((file) => ({
      id: URL.createObjectURL(file),
      file,
      preview: URL.createObjectURL(file),
    }));
    setSlides((prev) => [...prev, ...newSlides]);
    // onUpload(newSlides.map(slide => slide.file)); // Call onUpload with the new files
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over?.id);
      setSlides((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadToArweave = async () => {
    if (slides.length === 0) {
      toast({
        description: "No image(s) to upload!"
      });
      return;
    }

    if (!activeAddress) {
      await connect();
    }

    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    const imageTxIds: { txid: string; path: string }[] = [];


    // for (const slide of slides) {
    //   const reader = new FileReader();
    //   reader.onload = async (event) => {
    //     const data = event.target?.result;
    //     if (data) {
    //     //   const transaction = await arweave.createTransaction({ data }, wallet);
    //     const transaction = await arweave.createTransaction({ data }, "use_wallet");

    //       transaction.addTag('Content-Type', slide.file.type);
    //       await arweave.transactions.sign(transaction, "use_wallet");
    //     //   await arweave.transactions.sign(transaction, wallet);
    //       const response = await arweave.transactions.post(transaction);
    //       console.log("image upload response: ", response);
    //       if (response.status === 200) {
    //         // imageTxIds.push(transaction.id);
    //         console.log("image upload status 200");
    //         imageTxIds.push({ txid: transaction.id, path: transaction.id });
    //       } else {
    //         console.error('Failed to upload image:', slide.file.name);
    //       }
    //     }
    //   };
    //   reader.readAsArrayBuffer(slide.file);
    // }
    

    const imageUploadPromises = slides.map((slide, index) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const data = event.target?.result;
            if (data) {
              try {
                const transaction = await arweave.createTransaction({ data }, "use_wallet");
                transaction.addTag('Content-Type', slide.file.type);
                await arweave.transactions.sign(transaction, "use_wallet");
                const response = await arweave.transactions.post(transaction);
                if (response.status === 200) {
                  imageTxIds.push({ txid: transaction.id, path: `${index}` }); // Use index as the path
                  console.log("imageTxIds: ", imageTxIds);
                  resolve(); // Resolve the promise when upload is successful
                } else {
                  console.error('Failed to upload image:', index);
                  reject(new Error('Failed to upload image'));
                }
              } catch (error) {
                console.error('Error uploading image:', error);
                reject(error);
              }
            }
          };
          reader.readAsArrayBuffer(slide.file);
        });
      });
      try {
        // Wait for all image uploads to complete
        await Promise.all(imageUploadPromises);

        const jsonIndex = {
            images: imageTxIds.map(({ txid, path }) => ({ path, txid })),
          };
          const jsonContent = JSON.stringify(jsonIndex, null, 2);
          const jsonTransaction = await arweave.createTransaction({ data: jsonContent }, "use_wallet");
          jsonTransaction.addTag("Content-Type", "application/json");
          await arweave.transactions.sign(jsonTransaction, "use_wallet");
      
          const jsonResponse = await arweave.transactions.post(jsonTransaction);
          if (jsonResponse.status !== 200) {
            throw new Error("Failed to upload JSON index");
          }
          const jsonIndexTxId = jsonTransaction.id;
          console.log("JSON index uploaded successfully:", jsonIndexTxId);

        // const manifest = {
        //     manifest: "arweave/paths",
        //     version: "0.2.0",
        //     index: {
        //         path: imageTxIds[0]?.path || "-1", // Use the first image or a placeholder
        //     },
        //     paths: imageTxIds.reduce((acc, { txid, path }) => {
        //       acc[path] = { id:txid }; // Use file name as the key
        //       return acc;
        //     }, {} as Record<string, { id: string }>),
        //   };

        const manifest: {
            manifest: string;
            version: string;
            index: { path: string };
            paths: Record<string, { id: string }>;
          } = {
            manifest: "arweave/paths",
            version: "0.2.0",
            index: { path: "index.json" }, // Reference JSON index file
            paths: imageTxIds.reduce<Record<string, { id: string }>>((acc, { txid, path }) => {
              acc[path] = { id: txid }; // Dynamically add image entries
              return acc;
            }, { "index.json": { id: jsonIndexTxId } }), // Add JSON index entry
          };

        console.log("Manifest before upload:", JSON.stringify(manifest, null, 2));
        console.log("Manifest before upload 2 :", JSON.stringify(manifest));

        const manifestTransaction = await arweave.createTransaction(
            { data: JSON.stringify(manifest) },
            "use_wallet"
        );
        manifestTransaction.addTag('Content-Type', 'application/x.arweave-manifest+json');
        manifestTransaction.addTag("Type", "manifest"); // Optional: Add a custom tag for manifest type
        await arweave.transactions.sign(manifestTransaction, "use_wallet");
        const manifestResponse = await arweave.transactions.post(manifestTransaction);
    
        // if (manifestResponse.status === 200) {
        //   console.log('Manifest uploaded successfully:', manifestTransaction.id);
        // } else {
        //   console.error('Failed to upload manifest');
        // }
    
        if (manifestResponse.status === 200) {
            console.log("manifestResponse: ", manifestResponse);
            console.log('Manifest uploaded successfully:', manifestTransaction.id);
            toast({
                description: "Uploaded to Arweave!",
              });
            onUpload(manifestTransaction.id); // Pass the manifest ID back to the parent
            } else {
            console.error('Failed to upload manifest');
            onUpload(null); // Notify the parent of failure
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        }

  };

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <p>Drag & drop images here, or click to select files</p>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={slides.map((slide) => slide.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {slides.map((slide) => (
              <SortableItem key={slide.id} id={slide.id} preview={slide.preview} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* <button className="text-white" onClick={uploadToArweave}>Upload images to Arweave</button> */}
      <Button
            type="submit"
            onClick={uploadToArweave}
          >Upload images to Arweave</Button>
    </div>
  );
};

export default SlideUploader;