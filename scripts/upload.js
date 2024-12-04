// import Arweave from 'arweave';
// import { readFileSync } from 'fs';

// // Initialize Arweave
// const arweave = Arweave.init({
//     host: 'arweave.net', // Hostname or IP address for a Arweave host
//     port: 443,           // Port
//     protocol: 'https'    // Network protocol http or https
// });

// // Function to upload text to Arweave
// async function uploadText(text, keyPath) {
//     // Load your wallet key file
//     const key = JSON.parse(readFileSync(keyPath, 'utf-8'));

//     // Create a transaction
//     const transaction = await arweave.createTransaction({ data: text }, key);

//     // Add a tag to the transaction
//     transaction.addTag('Content-Type', 'text/plain');

//     // Sign the transaction
//     await arweave.transactions.sign(transaction, key);

//     // Submit the transaction to Arweave's blockchain
//     const response = await arweave.transactions.post(transaction);

//     if (response.status === 200) {
//         console.log(`Text uploaded successfully! Transaction ID: ${transaction.id}`);
//     } else {
//         console.error('Failed to upload text:', response.status);
//     }
// }

// const text = "Hell";

// // Example usage
// uploadText("Hello, Arweave!", "../../.secrets/cookbook2.json");


import Arweave from 'arweave';
import { readFileSync } from 'fs';

// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net', // Hostname or IP address for a Arweave host
    port: 443,           // Port
    protocol: 'https'    // Network protocol http or https
});

// Function to upload text to Arweave from a file
async function uploadTextFromFile(filePath, keyPath) {
    const text = readFileSync(filePath, 'utf-8'); // Load text from file
    const key = JSON.parse(readFileSync(keyPath, 'utf-8')); // Load your wallet key file

    // Create a transaction
    const transaction = await arweave.createTransaction({ data: text }, key);

    // Add a tag to the transaction
    transaction.addTag('Content-Type', 'text/plain');

    // Sign the transaction
    await arweave.transactions.sign(transaction, key);

    // Submit the transaction to Arweave's blockchain
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200) {
        console.log(`Text uploaded successfully! Transaction ID: ${transaction.id}`);
    } else {
        console.error('Failed to upload text:', response.status);
    }
}

// Example usage
uploadTextFromFile('processEval.txt', '../../.secrets/cookbook2.json');
