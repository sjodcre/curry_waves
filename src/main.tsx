import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ArweaveProvider } from "./context/ProfileContext.tsx";
import 'video-react/dist/video-react.css';
// Create a React Query client
const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ArweaveWalletKit
          config={{
            permissions: [
              "ACCESS_ADDRESS",
              "ACCESS_PUBLIC_KEY",
              "SIGN_TRANSACTION",
              "DISPATCH",
            ],
            ensurePermissions: true,
          }}
          theme={{
            displayTheme: "light",
          }}
        >
      <ArweaveProvider>

        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ArweaveProvider>
    </ArweaveWalletKit>
  </React.StrictMode>,
);
