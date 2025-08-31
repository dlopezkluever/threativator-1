 Database Architecture and Schema
Core Entity Relationships:
sql-- Users table with authentication integration
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT,
  holding_cell_balance DECIMAL(10,2) DEFAULT 0.00,
  twitter_access_token TEXT ENCRYPTED,
  twitter_refresh_token TEXT ENCRYPTED,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Goals with comprehensive metadata
goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  final_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  grading_rubric TEXT NOT NULL,
  referee_type grading_type NOT NULL, -- 'ai' or 'human_witness'
  witness_contact_id UUID REFERENCES contacts(id),
  monetary_stake DECIMAL(10,2) NOT NULL,
  charity_destination charity_enum NOT NULL,
  minor_kompromat_id UUID REFERENCES kompromat(id),
  major_kompromat_id UUID REFERENCES kompromat(id),
  status goal_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkpoints with individual stakes and requirements
checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  order_position INTEGER NOT NULL,
  requirements TEXT,
  status checkpoint_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions with comprehensive metadata
submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_type submission_type_enum NOT NULL,
  file_path TEXT, -- for file uploads
  external_url TEXT, -- for external links
  description TEXT,
  ai_analysis_result JSONB,
  human_verdict verdict_enum,
  status submission_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Secure kompromat storage with encryption
kompromat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  severity kompromat_severity NOT NULL, -- 'minor' or 'major'
  encrypted_content BYTEA, -- encrypted file content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact management with role assignments
contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role contact_role[] NOT NULL, -- array: 'witness', 'consequence_target'
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consequence tracking and audit trail
consequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID REFERENCES checkpoints(id),
  goal_id UUID REFERENCES goals(id),
  user_id UUID NOT NULL REFERENCES users(id),
  consequence_type consequence_type_enum NOT NULL,
  monetary_amount DECIMAL(10,2),
  charity_destination charity_enum,
  kompromat_id UUID REFERENCES kompromat(id),
  target_contact_id UUID REFERENCES contacts(id),
  social_platform TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  execution_status execution_status_enum DEFAULT 'pending'
);
Advanced Database Features:
Row Level Security Policies:
sql-- Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Goals accessibility
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Team members can view shared goals" ON goals
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM team_members WHERE goal_id = goals.id AND user_id = auth.uid())
  );
Automated Database Functions:
sql-- Trigger function for deadline consequence checking
CREATE OR REPLACE FUNCTION check_missed_deadlines()
RETURNS void AS $$
BEGIN
  -- Complex logic for identifying missed deadlines
  -- Calls Edge Function for consequence execution
  PERFORM net.http_post(
    'https://your-project.supabase.co/functions/v1/trigger-consequences',
    '{"action": "check_deadlines"}',
    'application/json'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Scheduled execution via pg_cron
SELECT cron.schedule('deadline-check', '*/5 * * * *', 'SELECT check_missed_deadlines()');
API Architecture and Integration Layer
Supabase Edge Functions (Serverless Architecture):
1. Submission Grading Function (gradeSubmission):
typescript// Edge Function: /functions/grade-submission/index.ts
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GradingRequest {
  submissionId: string;
  rubric: string;
  submissionData: {
    type: 'file' | 'url';
    content: string;
  };
}

export const handler = async (req: Request) => {
  const { submissionId, rubric, submissionData }: GradingRequest = await req.json();
  
  // Initialize Google Gemini API
  const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
  
  // Prepare submission content for analysis
  let analysisContent = '';
  if (submissionData.type === 'file') {
    // Handle file analysis (OCR for images, text extraction for documents)
    analysisContent = await processFileSubmission(submissionData.content);
  } else {
    // Handle URL-based submissions
    analysisContent = await fetchAndProcessURL(submissionData.content);
  }
  
  // Construct AI prompt with user rubric
  const prompt = `
    Analyze the following submission against these criteria:
    ${rubric}
    
    Submission content:
    ${analysisContent}
    
    Respond with JSON: {"pass": boolean, "feedback": string, "confidence": number}
  `;
  
  // Call Gemini API
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const analysis = JSON.parse(result.response.text());
  
  // Update database with results
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  await supabase
    .from('submissions')
    .update({
      ai_analysis_result: analysis,
      status: analysis.pass ? 'passed' : 'failed',
      graded_at: new Date().toISOString()
    })
    .eq('id', submissionId);
  
  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  });
};
2. Consequence Execution Function (triggerConsequence):
typescript// Edge Function: /functions/trigger-consequence/index.ts
export const handler = async (req: Request) => {
  const { consequenceId, type } = await req.json();
  
  const supabase = createClient(/*...*/);
  
  // Fetch consequence details
  const { data: consequence } = await supabase
    .from('consequences')
    .select(`
      *,
      users(*),
      kompromat(*),
      contacts(*)
    `)
    .eq('id', consequenceId)
    .single();
  
  if (type === 'monetary') {
    await executeMonetaryConsequence(consequence);
  } else if (type === 'humiliation') {
    await executeHumiliationConsequence(consequence);
  }
  
  // Update execution status
  await supabase
    .from('consequences')
    .update({
      execution_status: 'completed',
      executed_at: new Date().toISOString()
    })
    .eq('id', consequenceId);
};

async function executeMonetaryConsequence(consequence: any) {
  // Stripe payout to charity
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  
  await stripe.transfers.create({
    amount: consequence.monetary_amount * 100, // Convert to cents
    currency: 'usd',
    destination: getCharityStripeAccount(consequence.charity_destination),
    metadata: {
      user_id: consequence.user_id,
      goal_id: consequence.goal_id,
      type: 'consequence_payout'
    }
  });
}

async function executeHumiliationConsequence(consequence: any) {
  if (consequence.social_platform === 'twitter') {
    await postToTwitter(consequence);
  } else {
    await sendHumiliationEmail(consequence);
  }
}
3. Email Notification Function (sendNotification):
typescript// Edge Function: /functions/send-notification/index.ts
import sgMail from '@sendgrid/mail';

interface NotificationRequest {
  type: 'deadline_reminder' | 'submission_result' | 'consequence_notification';
  userId: string;
  templateData: Record<string, any>;
}

export const handler = async (req: Request) => {
  const { type, userId, templateData }: NotificationRequest = await req.json();
  
  sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!);
  
  // Get user details
  const supabase = createClient(/*...*/);
  const { data: user } = await supabase
    .from('users')
    .select('email, avatar_type')
    .eq('id', userId)
    .single();
  
  // Select appropriate template and avatar
  const templateId = getTemplateId(type);
  const avatarUrl = getAvatarUrl(user.avatar_type, templateData.emotion);
  
  const msg = {
    to: user.email,
    from: 'notifications@threativator.com',
    templateId: templateId,
    dynamicTemplateData: {
      ...templateData,
      avatar_url: avatarUrl,
      user_email: user.email
    }
  };
  
  await sgMail.send(msg);
  
  return new Response('Email sent successfully');
};
Security and Privacy Architecture
Data Protection Framework:
1. Encryption at Rest:
sql-- Kompromat encryption using PostgreSQL pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted storage function
CREATE OR REPLACE FUNCTION encrypt_kompromat(content BYTEA)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(content, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption function (restricted access)
CREATE OR REPLACE FUNCTION decrypt_kompromat(encrypted_content BYTEA)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_content, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
2. Row Level Security Implementation:
sql-- Comprehensive RLS policies
CREATE POLICY "kompromat_owner_only" ON kompromat
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "consequences_user_access" ON consequences
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (consequence_type = 'humiliation' AND auth.uid() IN (
      SELECT user_id FROM contacts WHERE id = target_contact_id
    ))
  );
3. API Security:
typescript// JWT validation middleware for Edge Functions
const validateJWT = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  
  const jwt = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(jwt);
  
  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }
  
  return data.user;
};