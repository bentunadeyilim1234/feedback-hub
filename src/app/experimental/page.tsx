/*
"use client"

import TopBar from "@/components/ui/topbar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRealtimeTaskTriggerWithStreams } from "@trigger.dev/react-hooks";
import { createClient } from "@/utils/supabase/client";

type STREAMS = {
  success: boolean;
  script: string;
};

const AddGamePage = () => {
  const supabase = createClient()
  const [script, setScript] = useState<string | null>(null);
  const [triggerToken, setTriggerToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hookInitialized, setHookInitialized] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  // First, fetch the token
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch("/api/get-token")
        const body = await response.json()
        if (body.success && body.data) {
          setTriggerToken(body.data);
        } else {
          console.error("Failed to get token:", body);
        }
      } catch (error) {
        console.error("Failed to create trigger token:", error);
      }
    };
    
    initialize();
  }, []);

  // Initialize the hook with the token
  const { 
    submit, 
    run, 
    streams, 
    error, 
    isLoading: triggerLoading,
    response,
    data
  } = useRealtimeTaskTriggerWithStreams<any, STREAMS>(
    "generate-script",
    {
      accessToken: triggerToken || undefined,
      enabled: !!triggerToken,
    }
  );

  // Submit data once we have the token
  useEffect(() => {
    if (!triggerToken || hookInitialized) return;
    
    const submitData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          console.log("Submitting with user ID:", user.id);
          const result = await submit({ user_id: user.id });
          console.log("Submit result:", result);
          if (result?.id) {
            setRunId(result.id);
          }
          setHookInitialized(true);
        }
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    };
    
    submitData();
  }, [triggerToken, submit, hookInitialized]);

  // Update script when streams or data change
  useEffect(() => {
    // Check for stream data
    if (streams?.script) {
      console.log("Stream script received:", streams.script);
      setScript(streams.script);
      setIsLoading(false);
    }
    // Also check for data from the completed run
    else if (data?.script) {
      console.log("Final script received:", data.script);
      setScript(data.script);
      setIsLoading(false);
    }
    // Check response as well, as data might be inside it
    else if (response?.output?.script) {
      console.log("Response script received:", response.output.script);
      setScript(response.output.script);
      setIsLoading(false);
    }
  }, [streams, data, response]);

  // Debug logging for monitoring state
  useEffect(() => {
    console.log("Current state:", { 
      triggerToken: !!triggerToken, 
      hookInitialized, 
      isLoading, 
      triggerLoading, 
      hasScript: !!script,
      runId,
      hasStreams: !!streams,
      hasData: !!data,
      hasResponse: !!response,
      error: error?.message
    });
  }, [triggerToken, hookInitialized, isLoading, triggerLoading, script, runId, streams, data, response, error]);

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script)
        .then(() => alert("Script copied to clipboard!"))
        .catch(err => console.error("Failed to copy: ", err));
    }
  };

  const handleDownload = () => {
    if (script) {
      const blob = new Blob([script], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ModuleScript.lua";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const retryGeneration = async () => {
    if (!triggerToken) return;
    
    setIsLoading(true);
    setScript(null);
    setHookInitialized(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const result = await submit({ user_id: user.id });
        if (result?.id) {
          setRunId(result.id);
        }
        setHookInitialized(true);
      }
    } catch (error) {
      console.error("Error retrying submission:", error);
    }
  };
  
  const MainContent = () => {
    return (
      <div className="flex-col w-full flex px-5 sm:px-11 space-y-2">
        <div className="flex-col w-full justify-center flex gap-2 p-2.5">
          <p className="text-xl font-medium">we've generated a special <strong>ModuleScript</strong> for you.</p>
          <p className="text-xl font-medium">please put it under <strong>ReplicatedStorage</strong> inside Roblox Studio</p>
        </div>
        <div className="flex-col w-full justify-center px-2.5 space-y-2.5">
          <div className="space-y-2.5 sm:flex sm:space-y-0 sm:space-x-2.5">
            <button 
              onClick={handleDownload} 
              disabled={!script} 
              className="h-12 cursor-pointer w-full transition bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              download
            </button>
            <button 
              onClick={handleCopy} 
              disabled={!script} 
              className="h-12 cursor-pointer w-full transition bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              copy to clipboard
            </button>
          </div>
          <div className="flex justify-between w-full px-1 mt-2 sm:mt-0 flex-col sm:flex-row">
            <Link href="/" className="font-medium text-lg sm:text-sm">go back</Link>
            <Link href="#" className="font-medium text-lg sm:text-sm">how do i use it</Link>
          </div>
          {script ? (
            <div className="mt-4 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-80">
              <pre className="text-sm whitespace-pre-wrap">{script}</pre>
            </div>
          ) : error ? (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-red-500 mb-2">Failed to generate script</p>
              <button 
                onClick={retryGeneration}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
  
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center w-full space-y-4">
      <p className="text-xl text-center w-full font-medium">error: {error?.message || "Something went wrong"}</p>
      <button 
        onClick={retryGeneration}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
  
  const showLoading = isLoading || triggerLoading || !triggerToken;
  
  return (
    <main className="sm:px-6 w-full h-full items-center flex flex-col">
      <TopBar/>
      <div className="h-full w-full max-w-xl items-center flex pb-21">
        {showLoading ? (
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-xl text-center w-full font-medium">[loading...]</p>
          </div>
        ) : error ? (
          <ErrorContent />
        ) : (
          <MainContent />
        )}
      </div>
    </main>
  )
}

export default AddGamePage*/