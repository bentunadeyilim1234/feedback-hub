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
  const [script, setScript] = useState<string | any>("");
  const [triggerToken, setTriggerToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hookInitialized, setHookInitialized] = useState(false);

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

  const { submit, run, streams, error, isLoading: triggerLoading } = useRealtimeTaskTriggerWithStreams<any, STREAMS>(
    "generate-script",
    {
      accessToken: triggerToken || undefined,
      enabled: !!triggerToken,
    }
  );

  useEffect(() => {
    if (!triggerToken) return;
    const submitData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          submit({ user_id: user.id });
          setHookInitialized(true);
        }
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    };
    
    if (!hookInitialized) {
      submitData();
    }
  }, [triggerToken, submit, hookInitialized]);

  useEffect(() => {
    if (streams?.script) {
      setScript(streams.script);
      setIsLoading(false);
    }
  }, [streams]);

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
  
  const MainContent = () => {
    return (
      <div className="w-full flex flex-col space-y-4">
        <div className="w-full flex flex-col gap-2 p-2">
          <p className="text-xl font-medium">we've generated a special <strong>ModuleScript</strong> for you.</p>
          <p className="text-xl font-medium">please put it under <strong>ReplicatedStorage</strong> inside Roblox Studio</p>
        </div>
        <div className="w-full flex flex-col px-2 space-y-4">
          <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
            <button 
              onClick={handleDownload} 
              disabled={!script} 
              className="w-full h-12 cursor-pointer transition bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white"
            >
              download
            </button>
            <button 
              onClick={handleCopy} 
              disabled={!script} 
              className="w-full h-12 cursor-pointer transition bg-[#1A1A1A] dark:bg-white dark:text-black rounded-xl font-medium text-lg text-white"
            >
              copy to clipboard
            </button>
          </div>
          <div className="w-full flex flex-col sm:flex-row justify-between px-1">
            <Link href="/" className="font-medium text-lg sm:text-sm">go back</Link>
            <Link href="#" className="font-medium text-lg sm:text-sm">how do i use it</Link>
          </div>
          {script && (
            <div className="mt-4 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-80">
              <pre className="text-sm whitespace-pre-wrap">{script}</pre>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const showLoading = isLoading || triggerLoading;
  
  return (
    <main className="w-full h-full flex flex-col items-center">
      <TopBar/>
      <div className="w-full h-full max-w-xl flex items-center ">
        {showLoading
          ? <p className="text-xl text-center w-full font-medium">[loading...]</p>
          : error
            ? <p className="text-xl text-center w-full font-medium">error: {error.message}</p>
            : <MainContent />
        }
      </div>
    </main>
  )
}

export default AddGamePage