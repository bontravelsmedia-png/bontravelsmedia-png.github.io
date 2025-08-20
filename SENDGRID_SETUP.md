# SendGrid Integration Setup Guide

## 🔐 **2FA Email Delivery with SendGrid**

This guide will help you set up SendGrid to send 2FA codes to `bontravelsmedia@gmail.com` for the Bon Travels admin portal.

## **📋 Prerequisites**

1. **SendGrid Account**: Sign up at [sendgrid.com](https://sendgrid.com)
2. **Domain Verification**: Verify your domain (bontravels.com) with SendGrid
3. **API Key**: Generate a SendGrid API key with mail send permissions

## **🚀 Step-by-Step Setup**

### **1. Create SendGrid Account**
- Go to [sendgrid.com](https://sendgrid.com)
- Sign up for a free account (100 emails/day)
- Verify your email address

### **2. Verify Your Domain**
- In SendGrid dashboard, go to **Settings** → **Sender Authentication**
- Click **Authenticate Your Domain**
- Follow the DNS setup instructions for `bontravels.com`
- Wait for verification (can take up to 48 hours)

### **3. Generate API Key**
- Go to **Settings** → **API Keys**
- Click **Create API Key**
- Name: `Bon Travels 2FA`
- Permissions: **Restricted Access** → **Mail Send**
- Copy the generated API key

### **4. Update Configuration**
Edit `sendgrid-config.js` and replace:
```javascript
this.apiKey = 'YOUR_SENDGRID_API_KEY'; // Replace with your actual API key
this.fromEmail = 'noreply@bontravels.com'; // Your verified sender email
```

**Example:**
```javascript
this.apiKey = 'SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
this.fromEmail = 'admin@bontravels.com';
```

### **5. Test the Integration**
1. Open `admin-login.html`
2. Enter admin credentials:
   - **Email**: `admin@bontravels.com`
   - **Password**: `BonTravels2024!`
3. Check `bontravelsmedia@gmail.com` for the 2FA code
4. Enter the code to complete login

## **📧 Email Template Features**

The 2FA email includes:
- ✅ **Professional branding** with Bon Travels colors
- ✅ **Clear 6-digit code** display
- ✅ **Security warnings** and expiration notice
- ✅ **Responsive design** for all devices
- ✅ **Professional formatting** with company branding

## **🔒 Security Features**

- **Code Expiration**: 2FA codes expire after 10 minutes
- **Rate Limiting**: Resend button disabled for 30 seconds after use
- **Fallback System**: Shows code on screen if email fails
- **Audit Trail**: All login attempts are logged

## **⚠️ Important Notes**

1. **API Key Security**: Never commit your API key to version control
2. **Domain Verification**: Must complete before emails can be sent
3. **Email Limits**: Free tier allows 100 emails/day
4. **Testing**: Use test mode initially to avoid spam filters

## **🔄 Fallback System**

If SendGrid fails:
- Code is displayed on screen as fallback
- User can still complete authentication
- System logs the failure for monitoring

## **📊 Monitoring & Analytics**

SendGrid provides:
- Email delivery rates
- Bounce tracking
- Spam reports
- Geographic delivery data
- Real-time analytics

## **🆘 Troubleshooting**

### **Common Issues:**

1. **"Invalid API Key"**
   - Check API key is correct
   - Ensure API key has mail send permissions

2. **"Domain Not Verified"**
   - Complete domain authentication
   - Wait for DNS propagation

3. **"Email Not Received"**
   - Check spam/junk folder
   - Verify recipient email address
   - Check SendGrid delivery logs

4. **"Rate Limit Exceeded"**
   - Upgrade SendGrid plan
   - Implement rate limiting

## **📈 Production Considerations**

1. **Environment Variables**: Store API key in server environment
2. **Error Handling**: Implement comprehensive error logging
3. **Monitoring**: Set up alerts for email delivery failures
4. **Backup Service**: Consider secondary email service
5. **Compliance**: Ensure GDPR/CCPA compliance

## **🔗 Useful Links**

- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [Email API Reference](https://docs.sendgrid.com/api-reference/mail-send)
- [Best Practices](https://docs.sendgrid.com/ui/sending-email/best-practices)
- [Sender Authentication](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

## **✅ Success Checklist**

- [ ] SendGrid account created
- [ ] Domain verified
- [ ] API key generated
- [ ] Configuration updated
- [ ] Test email sent successfully
- [ ] 2FA code received in inbox
- [ ] Login completed with email code

---

**Need Help?** Contact your system administrator or refer to SendGrid support documentation.
