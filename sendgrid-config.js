// SendGrid Configuration for 2FA Email Delivery
class SendGridService {
    constructor() {
        // SendGrid API Key - In production, this should be in environment variables
        this.apiKey = 'YOUR_SENDGRID_API_KEY'; // Replace with your actual API key
        this.fromEmail = 'noreply@bontravels.com'; // Your verified sender email
        this.fromName = 'Bon Travels Admin';
        this.baseUrl = 'https://api.sendgrid.com/v3';
    }

    // Send 2FA code via email
    async sendTwoFactorCode(toEmail, code, userName) {
        try {
            const emailData = {
                personalizations: [{
                    to: [{ email: toEmail, name: userName }],
                    subject: 'Your 2FA Code - Bon Travels Admin'
                }],
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                content: [{
                    type: 'text/html',
                    value: this.createEmailTemplate(code, userName)
                }]
            };

            const response = await fetch(`${this.baseUrl}/mail/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`SendGrid API Error: ${errorData.errors?.[0]?.message || response.statusText}`);
            }

            return { success: true, message: '2FA code sent successfully' };
        } catch (error) {
            console.error('SendGrid Error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create professional email template
    createEmailTemplate(code, userName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>2FA Code - Bon Travels Admin</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #462c61 0%, #de4185 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .code-box { background: #462c61; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Two-Factor Authentication</h1>
                        <p>Bon Travels Administrative Portal</p>
                    </div>
                    
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        
                        <p>You have requested access to the Bon Travels administrative dashboard. Please use the following verification code to complete your login:</p>
                        
                        <div class="code-box">${code}</div>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This code will expire in 10 minutes</li>
                            <li>Do not share this code with anyone</li>
                            <li>If you didn't request this code, please contact support immediately</li>
                        </ul>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> This is an automated message. Please do not reply to this email.
                        </div>
                        
                        <p>Best regards,<br>
                        <strong>Bon Travels IT Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent from the Bon Travels administrative system.<br>
                        If you have any questions, please contact your system administrator.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Test SendGrid connection
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (response.ok) {
                const profile = await response.json();
                return { success: true, profile };
            } else {
                throw new Error('Invalid API key or connection failed');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SendGridService;
} else {
    window.SendGridService = SendGridService;
}
