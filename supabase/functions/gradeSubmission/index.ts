import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SubmissionData {
  id: string
  checkpoint_id: string
  user_id: string
  submission_type: 'file_upload' | 'external_url' | 'text_description'
  file_path?: string
  external_url?: string
  description?: string
  status: string
}

interface GoalData {
  id: string
  grading_rubric: string
  referee_type: 'ai' | 'human_witness'
}

interface CheckpointData {
  id: string
  goal_id: string
  requirements?: string
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface GradingResult {
  verdict: 'pass' | 'fail'
  confidence_score: number
  reasoning: string
  word_count?: number
  url_accessible?: boolean
}

interface ApiUsageMetrics {
  function_name: string
  api_provider: string
  tokens_used?: number
  cost_estimate?: number
  request_timestamp: string
  response_time_ms: number
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const startTime = Date.now()
    const { submission_id } = await req.json()

    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: 'Submission ID is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get submission with related goal and checkpoint data
    const { data: submissionData, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        checkpoints!inner (
          id,
          goal_id,
          requirements,
          goals!inner (
            id,
            grading_rubric,
            referee_type
          )
        )
      `)
      .eq('id', submission_id)
      .eq('status', 'pending')
      .single()

    if (submissionError || !submissionData) {
      return new Response(
        JSON.stringify({ error: 'Submission not found or not pending' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    const submission = submissionData as SubmissionData & {
      checkpoints: CheckpointData & {
        goals: GoalData
      }
    }

    const goal = submission.checkpoints.goals
    const checkpoint = submission.checkpoints

    // Only process AI referee type
    if (goal.referee_type !== 'ai') {
      return new Response(
        JSON.stringify({ error: 'Submission requires human referee' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }

    // Update submission status to 'grading'
    await supabase
      .from('submissions')
      .update({ status: 'grading' })
      .eq('id', submission_id)

    let gradingResult: GradingResult

    try {
      // Perform cost optimization - simple checks first
      gradingResult = await performSimpleChecks(submission, goal, supabase)
      
      // If simple checks pass, proceed with AI grading
      if (gradingResult.verdict === 'pass' || needsAIAnalysis(submission, goal)) {
        gradingResult = await performAIGrading(submission, goal, checkpoint)
      }
    } catch (error) {
      console.error('Grading error:', error)
      gradingResult = {
        verdict: 'fail',
        confidence_score: 0.0,
        reasoning: `Grading failed due to technical error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // Update submission with results
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        ai_analysis_result: gradingResult,
        status: gradingResult.verdict === 'pass' ? 'passed' : 'failed',
        feedback_text: gradingResult.reasoning,
        confidence_score: gradingResult.confidence_score,
        graded_at: new Date().toISOString()
      })
      .eq('id', submission_id)

    if (updateError) {
      throw new Error(`Failed to update submission: ${updateError.message}`)
    }

    // Store API usage metrics
    const responseTime = Date.now() - startTime
    await storeApiMetrics({
      function_name: 'gradeSubmission',
      api_provider: 'gemini',
      request_timestamp: new Date().toISOString(),
      response_time_ms: responseTime
    })

    return new Response(
      JSON.stringify({
        success: true,
        result: gradingResult
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error in gradeSubmission:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

async function performSimpleChecks(
  submission: SubmissionData,
  goal: GoalData,
  supabase: ReturnType<typeof createClient>
): Promise<GradingResult> {
  let wordCount = 0
  let urlAccessible = true
  let extractedNumbers: number[] = []

  // Handle different submission types
  if (submission.submission_type === 'file_upload' && submission.file_path) {
    try {
      const { data: fileData } = await supabase.storage
        .from('submissions')
        .download(submission.file_path)
      
      if (fileData) {
        const fileName = submission.file_path.toLowerCase()
        
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
          const text = await fileData.text()
          wordCount = countWords(text)
          extractedNumbers = extractNumbers(text)
        } else if (fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
          // For images, we'll prepare for OCR but keep it simple for MVP
          // OCR would extract text and numbers from images
          const ocrResult = await performBasicImageAnalysis(fileData)
          extractedNumbers = ocrResult.numbers
          wordCount = ocrResult.wordCount
        } else if (fileName.endsWith('.pdf')) {
          // For PDF, we'd need PDF parsing - placeholder for MVP
          console.log('PDF processing not yet implemented')
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
    }
  } else if (submission.submission_type === 'text_description' && submission.description) {
    wordCount = countWords(submission.description)
    extractedNumbers = extractNumbers(submission.description)
  } else if (submission.submission_type === 'external_url' && submission.external_url) {
    // URL accessibility and GitHub commit verification
    try {
      urlAccessible = await validateUrl(submission.external_url)
      
      if (isGitHubUrl(submission.external_url)) {
        const commitData = await verifyGitHubCommits(submission.external_url)
        extractedNumbers = [commitData.recentCommits]
      }
    } catch (error) {
      console.error('Error validating URL:', error)
      urlAccessible = false
    }
  }

  // Parse rubric for simple criteria
  const rubric = goal.grading_rubric.toLowerCase()
  const minWords = extractWordCount(rubric)
  const minNumber = extractMinimumNumber(rubric)
  const requiresCommits = rubric.includes('commit') || rubric.includes('github')

  // Simple pass/fail logic
  if (minWords && wordCount < minWords) {
    return {
      verdict: 'fail',
      confidence_score: 0.95,
      reasoning: `Insufficient word count: ${wordCount} words (minimum: ${minWords})`,
      word_count: wordCount,
      url_accessible: urlAccessible
    }
  }

  if (minNumber && extractedNumbers.length > 0) {
    const maxNumber = Math.max(...extractedNumbers)
    if (maxNumber >= minNumber) {
      return {
        verdict: 'pass',
        confidence_score: 0.9,
        reasoning: `Number requirement met: found ${maxNumber} (minimum: ${minNumber})`,
        word_count: wordCount,
        url_accessible: urlAccessible
      }
    } else {
      return {
        verdict: 'fail',
        confidence_score: 0.9,
        reasoning: `Number requirement not met: found ${maxNumber} (minimum: ${minNumber})`,
        word_count: wordCount,
        url_accessible: urlAccessible
      }
    }
  }

  if (!urlAccessible && submission.submission_type === 'external_url') {
    return {
      verdict: 'fail',
      confidence_score: 0.95,
      reasoning: 'Submitted URL is not accessible or valid',
      url_accessible: false
    }
  }

  if (requiresCommits && submission.submission_type === 'external_url' && isGitHubUrl(submission.external_url!)) {
    if (extractedNumbers.length > 0 && extractedNumbers[0] > 0) {
      return {
        verdict: 'pass',
        confidence_score: 0.85,
        reasoning: `GitHub activity verified: ${extractedNumbers[0]} recent commits found`,
        url_accessible: urlAccessible
      }
    } else {
      return {
        verdict: 'fail',
        confidence_score: 0.85,
        reasoning: 'No recent GitHub commits found in repository',
        url_accessible: urlAccessible
      }
    }
  }

  if (minWords && wordCount >= minWords) {
    return {
      verdict: 'pass',
      confidence_score: 0.9,
      reasoning: `Word count requirement met: ${wordCount} words (minimum: ${minWords})`,
      word_count: wordCount,
      url_accessible: urlAccessible
    }
  }

  // If simple checks are inconclusive, needs AI analysis
  return {
    verdict: 'fail',
    confidence_score: 0.0,
    reasoning: 'Needs AI analysis for comprehensive grading',
    word_count: wordCount,
    url_accessible: urlAccessible
  }
}

async function performBasicImageAnalysis(_imageData: Blob): Promise<{ numbers: number[], wordCount: number }> {
  // For MVP: Basic placeholder for OCR functionality
  // In a full implementation, this would use an OCR service like Google Vision API
  // For now, return empty results - OCR would be integrated in future iterations
  return {
    numbers: [],
    wordCount: 0
  }
}

async function validateUrl(url: string): Promise<boolean> {
  try {
    // Basic URL validation
    new URL(url)
    
    // Check if URL is accessible
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    return response.ok
  } catch {
    return false
  }
}

function isGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname === 'github.com'
  } catch {
    return false
  }
}

async function verifyGitHubCommits(githubUrl: string): Promise<{ recentCommits: number }> {
  try {
    // Extract owner/repo from GitHub URL
    const url = new URL(githubUrl)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    if (pathParts.length < 2) {
      return { recentCommits: 0 }
    }
    
    const owner = pathParts[0]
    const repo = pathParts[1]
    
    // Use GitHub API to get recent commits (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=100`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Threativator-Grading-System'
      }
    })
    
    if (!response.ok) {
      return { recentCommits: 0 }
    }
    
    const commits = await response.json()
    return { recentCommits: Array.isArray(commits) ? commits.length : 0 }
  } catch {
    return { recentCommits: 0 }
  }
}

function extractNumbers(text: string): number[] {
  if (!text) return []
  
  const numberRegex = /\b\d+(?:\.\d+)?\b/g
  const matches = text.match(numberRegex)
  
  if (!matches) return []
  
  return matches.map(match => parseFloat(match)).filter(num => !isNaN(num))
}

function extractMinimumNumber(rubric: string): number | null {
  // Extract minimum number requirements from rubric
  const patterns = [
    /(?:at least|minimum of|minimum|min)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:minimum|min|at least)/i,
    /score[:\s]*(\d+(?:\.\d+)?)/i,
    /weight[:\s]*(\d+(?:\.\d+)?)/i
  ]
  
  for (const pattern of patterns) {
    const match = rubric.match(pattern)
    if (match) {
      return parseFloat(match[1])
    }
  }
  
  return null
}

function needsAIAnalysis(submission: SubmissionData, goal: GoalData): boolean {
  const rubric = goal.grading_rubric.toLowerCase()
  
  // Check if rubric contains complex criteria that require AI
  const complexKeywords = [
    'quality', 'coherent', 'logical', 'well-written', 'analysis',
    'explanation', 'detailed', 'thorough', 'specific', 'accurate'
  ]
  
  return complexKeywords.some(keyword => rubric.includes(keyword))
}

async function performAIGrading(
  submission: SubmissionData,
  goal: GoalData,
  checkpoint: CheckpointData
): Promise<GradingResult> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY')
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  // Sanitize rubric to prevent prompt injection
  const sanitizedRubric = sanitizeRubric(goal.grading_rubric)
  
  // Construct submission content
  let submissionContent = ''
  
  switch (submission.submission_type) {
    case 'text_description':
      submissionContent = submission.description || ''
      break
    case 'external_url':
      submissionContent = `URL: ${submission.external_url}`
      // For MVP, we'll just validate URL accessibility
      break
    case 'file_upload':
      submissionContent = `File submitted: ${submission.file_path}`
      // For MVP, we'll focus on quantitative checks
      break
  }

  // Construct Gemini prompt
  const prompt = `You are a strict grading AI for a task accountability app. Grade this submission against the provided rubric.

GRADING RUBRIC:
${sanitizedRubric}

CHECKPOINT REQUIREMENTS:
${checkpoint.requirements || 'No specific checkpoint requirements'}

SUBMISSION CONTENT:
${submissionContent}

INSTRUCTIONS:
- Grade strictly according to the rubric
- Focus on quantitative measures where possible (word count, commit history, numbers in images)
- Provide a clear pass/fail verdict
- Give a confidence score from 0.0 to 1.0
- Explain your reasoning briefly
- Do not be lenient - this is an accountability system

Respond in this exact JSON format:
{
  "verdict": "pass" or "fail",
  "confidence_score": 0.0-1.0,
  "reasoning": "Brief explanation of your decision"
}`

  // Make API call with retry logic
  let response: Response
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (response.ok) {
        break
      }
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
        retryCount++
        continue
      }
      
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    } catch (error) {
      retryCount++
      if (retryCount >= maxRetries) {
        throw new Error(`API call failed after ${maxRetries} retries: ${error}`)
      }
      await new Promise(resolve => setTimeout(resolve, retryCount * 1000))
    }
  }

  const geminiData: GeminiResponse = await response!.json()
  
  if (!geminiData.candidates || geminiData.candidates.length === 0) {
    throw new Error('No response from Gemini API')
  }

  const responseText = geminiData.candidates[0].content.parts[0].text
  
  // Parse JSON response from Gemini
  try {
    const parsedResult = JSON.parse(responseText)
    return {
      verdict: parsedResult.verdict,
      confidence_score: Math.min(Math.max(parsedResult.confidence_score, 0.0), 1.0),
      reasoning: parsedResult.reasoning
    }
  } catch (error) {
    // Fallback parsing if JSON is malformed
    const verdict = responseText.toLowerCase().includes('pass') ? 'pass' : 'fail'
    return {
      verdict,
      confidence_score: 0.5,
      reasoning: `AI response parsing failed. Raw response: ${responseText.substring(0, 200)}`
    }
  }
}

function sanitizeRubric(rubric: string): string {
  // Remove potential prompt injection patterns
  return rubric
    .replace(/system\s*:|assistant\s*:|user\s*:/gi, '')
    .replace(/ignore\s+previous\s+instructions/gi, '')
    .replace(/forget\s+everything/gi, '')
    .replace(/you\s+are\s+now/gi, '')
    .replace(/new\s+role\s*:/gi, '')
    .replace(/[{}[\]]/g, '')
    .substring(0, 2000) // Limit length
    .trim()
}

function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function extractWordCount(rubric: string): number | null {
  // Extract minimum word count from rubric using regex
  const patterns = [
    /(?:at least|minimum of|minimum|min)\s*(\d+)\s*words?/i,
    /(\d+)\s*words?\s*(?:minimum|min|at least)/i,
    /word count[:\s]*(\d+)/i
  ]
  
  for (const pattern of patterns) {
    const match = rubric.match(pattern)
    if (match) {
      return parseInt(match[1])
    }
  }
  
  return null
}

async function storeApiMetrics(metrics: ApiUsageMetrics): Promise<void> {
  try {
    // For now, just log metrics - could be stored in a dedicated table later
    console.log('API Usage Metrics:', JSON.stringify(metrics))
  } catch (error) {
    console.error('Error storing metrics:', error)
    // Don't throw - metrics storage failure shouldn't break grading
  }
}