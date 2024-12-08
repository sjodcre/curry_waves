import { toast } from "@/components/ui/use-toast";
import { processId } from "@/config/config";
import { message, result } from "@permaweb/aoconnect";
import { createDataItemSigner } from "@permaweb/aoconnect";

export { sellPost, buyPost, cancelSellPost };

async function sellPost(postId: string, wallet: any, price: number) {
    try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Publish-Post-For-Sale" },
            { name: "PostID", value: postId },
            { name: "Price", value: price.toString() },
          ],
          signer: createDataItemSigner(wallet),
        });

        const sellResult = await result({
          process: processId,
          message: res,
        });

        console.log("Created successfully", sellResult);
        console.log(sellResult.Messages[0].Data);

        if (sellResult.Messages[0].Data === "Post listed for sale successfully.") {
            return sellResult.Messages[0].Data;
        }
          
    } catch (error) {
        console.log(error);
        toast({
            description: "Error listing post for sale"
        });
        throw error;
    } 
}


async function buyPost(postId: string, wallet: any) {
    try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Buy-Post" },
            { name: "PostID", value: postId },
          ],
          signer: createDataItemSigner(wallet),
        });

        const buyResult = await result({
          process: processId,
          message: res,
        });

        console.log("Buy Post result", buyResult);
        console.log(buyResult.Messages[0].Data);

        if (buyResult.Messages[0].Data === "Post purchased successfully.") {
            return buyResult.Messages[0].Data;
        }
        
        return "Error purchasing post";
    } catch (error) {
        console.log(error);
        toast({
            description: "Error purchasing post"
        });
        throw error;
    }
}

async function cancelSellPost(postId: string, wallet: any) {
    try {
        const res = await message({
          process: processId,
          tags: [
            { name: "Action", value: "Cancel-Post-Sale" },
            { name: "PostID", value: postId },
          ],
          signer: createDataItemSigner(wallet),
        });

        const cancelResult = await result({
          process: processId,
          message: res,
        });

        if (cancelResult.Messages[0].Data === "Post sale cancelled successfully.") {
            toast({
                description: "Post sale cancelled successfully!"
            });
            return "Post sale cancelled successfully.";
        }
        
        return "Error cancelling post sale";
    } catch (error) {
        console.log(error);
        toast({
            description: "Error cancelling post sale"
        });
        return "Error cancelling post sale";
    } 
}