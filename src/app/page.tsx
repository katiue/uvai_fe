"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function StreamAndDownloadPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let ws: WebSocket | null = null;

  async function handleSearch() {
    setIsLoading(true);
    setError(null);

    const authToken = process.env.NEXT_PUBLIC_WS_AUTH_TOKEN;
    
    if (!authToken) {
      setError("Authentication token is missing");
      setIsLoading(false);
      return;
    }
    
    ws = new WebSocket('ws://14.225.205.80:80/ws');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send the URL in the initial message
      if (ws) {
        ws.send(JSON.stringify({ url , authentication: authToken}));
      }
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'image':
          updatePreview(data.data);  // data.data is expected to be HTML for the preview
          break;
        case 'status':
          handleCompletion(data.data);
          break;
        case 'error':
          handleError(data.data);
          break;
        default:
          console.log("Unknown message type:", data);
      }
    };
  
    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsLoading(false);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      handleError('Connection error');
      setIsLoading(false);
    };
  }  
  
  function updatePreview(htmlContent: string) {
    const previewDiv = document.getElementById('browser-preview');
    if (previewDiv) {
      previewDiv.innerHTML = htmlContent;
    } else {
      console.error('Preview element not found');
    }
  }
  
  function handleCompletion(message: string) {
    console.log('Task completed:', message);
    if (ws) ws.close();
  }
  
  function handleError(error: string) {
    console.error('Error:', error);
    if (ws) ws.close();
  }
  
  // To stop the connection
  function stopAgent() {
    if (ws) {
      ws.close();
    }
  }

  const handleDownload = () => {
    // This is a placeholder function.
    console.log("Downloading GIF...");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Stream Viewer and GIF Downloader</h1>

      {/* URL Input with Search Button */}
      <div className="flex space-x-2">
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Put your URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <span className="animate-spin">⏳</span> : <Search className="h-4 w-4" />}
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      {/* Preview Container for the streamed image/html */}
      <div
        id="browser-preview"
        className="bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 h-fit"
      >
        The streamed preview will appear here.
      </div>
    </div>
  );
}
