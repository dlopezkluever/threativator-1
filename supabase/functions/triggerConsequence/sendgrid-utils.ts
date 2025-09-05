// SendGrid utility functions for humiliation consequence emails

interface SendGridResult {
  success: boolean
  message_id?: string
  recipient?: string
  error?: string
}

interface KompromatData {
  id: string
  original_filename: string
  file_path: string
  file_type: string
  severity: 'minor' | 'major'
  description?: string
}

interface ContactData {
  id: string
  name: string
  email: string
}

export async function sendHumiliationEmail(
  recipient: ContactData,
  kompromat: KompromatData,
  failureType: 'checkpoint' | 'final_deadline',
  supabase: any
): Promise<SendGridResult> {
  
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  
  if (!sendGridApiKey) {
    console.error('SENDGRID_API_KEY not found in environment')
    return { success: false, error: 'SendGrid not configured' }
  }

  try {
    console.log(`Preparing humiliation email for ${recipient.email}`)

    // Get kompromat content from Supabase Storage if it's a file
    let kompromátContent = null
    let attachments = []

    if (kompromat.file_type.startsWith('image/') || kompromat.file_type === 'application/pdf') {
      // Download file from Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('kompromat')
        .download(kompromat.file_path)

      if (!fileError && fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        
        attachments.push({
          content: base64Content,
          filename: kompromat.original_filename,
          type: kompromat.file_type,
          disposition: 'attachment'
        })
      }
    }

    // Create dramatic email content
    const subject = failureType === 'final_deadline' ? 
      'GREAT DISHONOR: Final Judgment Executed' : 
      'State Directive: Minor Consequence Triggered'

    const emailBody = generateHumiliationEmailBody(
      recipient.name,
      kompromat,
      failureType
    )

    // Prepare SendGrid email payload
    const emailPayload = {
      personalizations: [{
        to: [{
          email: recipient.email,
          name: recipient.name
        }]
      }],
      from: {
        email: 'consequences@threativator.com', // Replace with verified sender
        name: 'Threativator State Authority'
      },
      subject: subject,
      content: [{
        type: 'text/html',
        value: emailBody
      }],
      attachments: attachments,
      categories: ['consequence', failureType],
      custom_args: {
        consequence_type: 'humiliation_email',
        severity: kompromat.severity,
        failure_type: failureType
      }
    }

    console.log('Sending email via SendGrid...')

    // Send email via SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('SendGrid error:', errorData)
      return { 
        success: false, 
        error: `SendGrid failed: ${response.status} ${errorData}` 
      }
    }

    // SendGrid returns message ID in X-Message-Id header
    const messageId = response.headers.get('X-Message-Id') || 'unknown'
    
    console.log('Humiliation email sent successfully:', messageId)

    return {
      success: true,
      message_id: messageId,
      recipient: recipient.email
    }

  } catch (error) {
    console.error('Error sending humiliation email:', error)
    return { 
      success: false, 
      error: `Email failed: ${error.message}` 
    }
  }
}

function generateHumiliationEmailBody(
  recipientName: string,
  kompromat: KompromatData,
  failureType: 'checkpoint' | 'final_deadline'
): string {
  const isFinalDeadline = failureType === 'final_deadline'
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            background: #F5EEDC; 
            margin: 0; 
            padding: 20px;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border: 6px solid #000000;
            border-radius: 0;
        }
        .header { 
            background: #DA291C; 
            color: white; 
            padding: 20px; 
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            letter-spacing: 2px;
        }
        .content { 
            padding: 30px;
            background: white;
        }
        .stamp { 
            background: #DA291C; 
            color: white; 
            padding: 10px 20px; 
            display: inline-block; 
            font-weight: bold;
            margin: 20px 0;
            border: 3px solid #000000;
        }
        .footer { 
            background: #000000; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px;
        }
        .warning { 
            background: #5A7761; 
            color: white; 
            padding: 15px; 
            margin: 20px 0;
            border: 2px solid #000000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ⚠️ OFFICIAL THREATIVATOR STATE COMMUNICATION ⚠️
        </div>
        
        <div class="content">
            <p><strong>ATTENTION COMRADE ${recipientName.toUpperCase()},</strong></p>
            
            <div class="stamp">
                ${isFinalDeadline ? 'FINAL JUDGMENT EXECUTED' : 'MINOR CONSEQUENCE TRIGGERED'}
            </div>
            
            <p>This is an <strong>OFFICIAL NOTICE</strong> from the Threativator State Authority.</p>
            
            <p>A person within your social network has committed a grave act of <strong>procrastination</strong> 
            and has failed to meet their accountability deadline${isFinalDeadline ? ' COMPLETELY' : ''}.</p>
            
            <div class="warning">
                <strong>STATE DIRECTIVE EXECUTED:</strong><br>
                As per the failing individual's pre-authorized accountability protocol, 
                you are now witness to their ${kompromat.severity.toUpperCase()} shame material.
                ${isFinalDeadline ? ' This represents their MAXIMUM consequence level.' : ''}
            </div>
            
            <p><strong>CLASSIFIED MATERIAL:</strong> ${kompromat.original_filename}</p>
            <p><strong>SEVERITY LEVEL:</strong> ${kompromat.severity.toUpperCase()}</p>
            ${kompromat.description ? `<p><strong>CONTEXT:</strong> ${kompromat.description}</p>` : ''}
            
            <p style="margin-top: 30px;">
                <em>Remember, comrade: Great dishonor comes upon those who fail their commitments. 
                Use this knowledge wisely and let it serve as a warning of the consequences 
                of insufficient self-discipline.</em>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 40px;">
                This consequence was voluntarily pre-authorized by the failing party as part of their 
                Threativator accountability protocol. You are receiving this because you were designated 
                as a "consequence target" contact. No actual blackmail or coercion is involved - 
                this is a self-imposed discipline mechanism.
            </p>
        </div>
        
        <div class="footer">
            THREATIVATOR STATE AUTHORITY - ACCOUNTABILITY DIVISION<br>
            "DISCIPLINE THROUGH CONSEQUENCES"
        </div>
    </div>
</body>
</html>
  `
}

// Function to send a test email (for development)
export async function sendTestHumiliationEmail(recipientEmail: string): Promise<SendGridResult> {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  
  if (!sendGridApiKey) {
    return { success: false, error: 'SendGrid not configured' }
  }

  const testPayload = {
    personalizations: [{
      to: [{ email: recipientEmail }]
    }],
    from: {
      email: 'test@threativator.com',
      name: 'Threativator Test'
    },
    subject: 'TEST: Consequence System Test Email',
    content: [{
      type: 'text/html',
      value: `
        <h1>Threativator Consequence System Test</h1>
        <p>This is a test email from the Threativator consequence system.</p>
        <p>If you received this, the SendGrid integration is working correctly.</p>
      `
    }]
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    if (!response.ok) {
      const errorData = await response.text()
      return { success: false, error: errorData }
    }

    return {
      success: true,
      message_id: response.headers.get('X-Message-Id') || 'test',
      recipient: recipientEmail
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}