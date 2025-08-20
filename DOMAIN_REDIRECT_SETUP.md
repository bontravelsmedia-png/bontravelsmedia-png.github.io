# Domain Redirect Setup Guide

## Redirecting bonpotravels.com to https://bontravels.netlify.app/

This guide explains how to set up a redirect from your domain `bonpotravels.com` to your Netlify website `https://bontravels.netlify.app/`.

## Method 1: DNS-Level Redirect (Recommended)

### Step 1: Access Your Domain Registrar
1. Log into your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. Navigate to the DNS management section for `bonpotravels.com`

### Step 2: Configure DNS Records
You have two main options:

#### Option A: URL Redirect Record (Easiest)
- Add a new DNS record
- Type: `URL Redirect` or `URL Forward`
- Name: `@` (or leave blank for root domain)
- Value: `https://bontravels.netlify.app/`
- Redirect Type: `301 Permanent Redirect`
- Include Path: `Yes` (to preserve URLs like bonpotravels.com/blog → bontravels.netlify.app/blog)

#### Option B: CNAME Record
- Add a new DNS record
- Type: `CNAME`
- Name: `@` (or leave blank for root domain)
- Value: `bontravels.netlify.app`
- TTL: `3600` (or default)

### Step 3: Wait for Propagation
DNS changes can take 24-48 hours to propagate globally.

## Method 2: HTML/JavaScript Redirect (Backup)

I've already implemented this in your `index.html` file and created a `redirect.html` file.

### What's Been Added:
1. **JavaScript redirect** in `index.html` - immediately redirects if someone visits bonpotravels.com
2. **Meta refresh redirect** as a fallback
3. **redirect.html** - a dedicated redirect page with a nice loading animation

## Method 3: Netlify Domain Configuration

### Step 1: Add Custom Domain in Netlify
1. Go to your Netlify dashboard
2. Select your site
3. Go to `Domain management`
4. Click `Add custom domain`
5. Enter `bonpotravels.com`

### Step 2: Configure DNS
Netlify will provide you with specific DNS records to add to your domain registrar.

## Testing Your Redirect

### Before DNS Changes:
- The JavaScript redirect in `index.html` will work immediately
- Test by temporarily editing your hosts file to point bonpotravels.com to your local server

### After DNS Changes:
- Visit `bonpotravels.com` in your browser
- You should be automatically redirected to `https://bontravels.netlify.app/`
- Test with different paths: `bonpotravels.com/blog`, `bonpotravels.com/about`, etc.

## Important Notes

1. **SEO Impact**: Use 301 redirects to preserve search engine rankings
2. **SSL Certificate**: Ensure your Netlify site has SSL enabled
3. **Path Preservation**: Make sure redirects preserve URL paths for better user experience
4. **Analytics**: Update your analytics tools to track both domains

## Troubleshooting

### Common Issues:
1. **Redirect not working**: Check DNS propagation time (24-48 hours)
2. **Infinite redirect loop**: Ensure you're not redirecting from the target domain
3. **SSL errors**: Verify SSL certificate is properly configured on Netlify

### Testing Tools:
- [DNS Checker](https://dnschecker.org/)
- [Redirect Checker](https://redirect-checker.org/)
- Browser Developer Tools (Network tab)

## Files Modified/Created

1. **index.html** - Added JavaScript and meta redirect
2. **redirect.html** - Created dedicated redirect page
3. **DOMAIN_REDIRECT_SETUP.md** - This setup guide

## Next Steps

1. Choose your preferred redirect method (DNS-level is recommended)
2. Configure your domain registrar accordingly
3. Test the redirect after DNS propagation
4. Monitor for any issues and adjust as needed

## Support

If you encounter issues:
1. Check your domain registrar's support documentation
2. Verify Netlify domain configuration
3. Test with different browsers and devices
4. Check browser console for JavaScript errors
