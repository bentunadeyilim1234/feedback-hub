/*import { task } from "@trigger.dev/sdk/v3";

export const generateScriptTask = task({
  id: "generate-script",
  run: async (payload: { user_id: string }) => {
    return {
      success: true,
      script: "asdasda"
    };
  },
})*/

import { task } from "@trigger.dev/sdk/v3";

export const generateScriptTask = task({
  id: "generate-script",
  run: async (payload: { user_id: string }) => {
    // Log that we've received the task
    console.log(`Generate script task started for user: ${payload.user_id}`);
    
    // Simulate a short delay (optional, remove if not needed)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate a simple Roblox ModuleScript
    const generatedScript = `--[[
  ModuleScript for Roblox integration
  User ID: ${payload.user_id}
  Generated on: ${new Date().toISOString()}
]]

local Module = {}

-- Configuration
Module.Config = {
  Enabled = true,
  Debug = false,
  Version = "1.0.0"
}

-- Initialize the module
function Module:Init()
  if not Module.Config.Enabled then
    return false
  end
  
  if Module.Config.Debug then
    print("Module initialized successfully!")
  end
  
  return true
end

-- Your core functionality here
function Module:GetData()
  return {
    userId = "${payload.user_id}",
    timestamp = os.time(),
    status = "active"
  }
end

-- Example function to process game data
function Module:ProcessGameData(data)
  if not data then
    warn("No data provided to process")
    return nil
  end
  
  -- Process the data
  local result = {
    processed = true,
    originalData = data,
    timestamp = os.time()
  }
  
  return result
end

return Module`;

    // Log that we're returning the result
    console.log("Generate script task completed successfully");

    return {
      success: true,
      script: generatedScript
    };
  },
});