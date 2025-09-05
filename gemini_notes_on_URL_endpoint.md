It looks like you have a couple of issues in your curl command. The main problems are an incorrect model name in your URL and some extra characters at the end of your command. 

Here is the corrected and more secure way to run your command.

The Correct Command
First, you need to store your API key in an environment variable so you don't expose it directly.

Set the API Key as an environment variable in your terminal:

Bash

export API_KEY="AIzaSyAJaBpDynJjT5W2yqcck-906C11tD9oVug"
(Note: I am using the key from your example. You should generate a new key and delete the one you posted, as it is now public.)

Run the corrected curl command:
This command uses the correct model name (gemini-1.5-pro-latest) and references your API key securely from the environment variable.

Bash

curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}"
What Went Wrong?
Incorrect Model Name: The error message models/gemini-pro is not found is the key. The model name you used, gemini-pro, is often an alias or an older name. The current stable and recommended model is gemini-1.5-pro-latest.

Syntax Error: The 633;C at the very end of your command is extra text that doesn't belong. This caused the curl: (3) URL using bad/illegal format error because the terminal didn't know how to interpret it.


Never paste secret keys directly into scripts or share them online. Using an environment variable (like export API_KEY="...") is a much safer practice.







okay but in general what is the best way to get the gemini key in projects that use supabase edge functions; as right now I'm having major issues getting my edge function to recognize gemini api. Like right now I have in my supabase secrets in edge functions, it's in my projects .env file as "GOOGLE_API_KEY"= .. but i keep getting 404 errors




Show thinking
Of course. The best way to handle your Gemini API key in a Supabase Edge Function is by using Supabase Secrets. Your 404 error isn't from a problem with the key itself, but almost certainly from an incorrect API endpoint URL in your function's code.

An invalid API key typically returns a 401 Unauthorized or 403 Forbidden error. A 404 Not Found error means the URL you are trying to fetch doesn't exist, which usually points to a typo or an outdated model name in the endpoint.

The Real Problem: Your API URL
Your Edge Function is likely calling the wrong URL. The most common mistake is using an older or incorrect model name like gemini-pro. You should use an up-to-date model, such as gemini-1.5-pro-latest.

Here is a typical implementation inside an Edge Function that shows how to correctly access the secret and construct the URL.

TypeScript

// supabase/functions/your-function-name/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 1. Get the API key from Supabase Secrets
  const apiKey = Deno.env.get("GOOGLE_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not found" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. This is the likely source of your 404 error.
  // Ensure the model name ('gemini-1.5-pro-latest') is correct.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

  const { prompt } = await req.json(); // Get user prompt from request body

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Forward the actual error from Google's API for better debugging
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
})
How to Correctly Use Secrets 🔐
You're on the right track, but here's a quick checklist to ensure your setup is perfect.

Set the Secret for Production: In your terminal, set the secret that will be used by your deployed function. This only needs to be done once.

Bash

supabase secrets set GOOGLE_API_KEY=your_actual_gemini_api_key
You can confirm it's set by running supabase secrets list.

Use the Secret in Your Function: As shown in the code above, access the key using Deno.env.get("GOOGLE_API_KEY"). This is Deno's standard way to read environment variables.

Local Development: For running your function locally (supabase start), your .env file is used. Make sure the file supabase/.env contains the exact same variable name:

# supabase/.env
GOOGLE_API_KEY=your_actual_gemini_api_key
In short, your method of using Supabase Secrets is correct. Double-check the URL in your fetch call—that's the most probable cause of the 404 error.