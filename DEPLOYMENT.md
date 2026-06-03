# PawPal Deployment Guide

Production deployment instructions for Vercel and DigitalOcean.

## Architecture Overview

```
┌─────────────────┐
│  WhatsApp User  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Baileys Worker         │
│  (DigitalOcean Droplet) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Next.js API            │
│  (Vercel)               │
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ OpenAI │ │ Supabase │
└────────┘ └──────────┘
```

## Part 1: Deploy Next.js to Vercel

### Prerequisites

- GitHub account
- Vercel account
- Supabase project (already set up)
- OpenAI API key

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial PawPal MVP"
git branch -M main
git remote add origin https://github.com/yourusername/pawpal.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Add to: **Production**, **Preview**, and **Development**

### Step 4: Deploy

Click **Deploy**

Wait for deployment to complete.

### Step 5: Verify Deployment

Visit your Vercel URL (e.g., `https://pawpal.vercel.app`)

Test health endpoint:
```bash
curl https://pawpal.vercel.app/api/health
```

Test chat endpoint:
```bash
curl -X POST https://pawpal.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "message": "Can dogs eat chocolate?"
  }'
```

## Part 2: Deploy Baileys Worker to DigitalOcean

### Prerequisites

- DigitalOcean account
- SSH key set up

### Step 1: Create Droplet

1. Go to [digitalocean.com](https://digitalocean.com)
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month is sufficient)
   - **CPU**: Regular Intel (1GB RAM)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key
4. Click **Create Droplet**

### Step 2: Connect to Droplet

```bash
ssh root@your-droplet-ip
```

### Step 3: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install Git

```bash
apt install -y git
```

### Step 5: Clone Repository

```bash
cd /opt
git clone https://github.com/yourusername/pawpal.git
cd pawpal
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Configure Environment

```bash
nano .env
```

Add:
```env
API_URL=https://pawpal.vercel.app/api/chat
```

Save and exit (Ctrl+X, Y, Enter)

### Step 8: Set Up PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start worker with PM2
pm2 start npm --name "pawpal-worker" -- run worker

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

Follow the command output to enable startup.

### Step 9: WhatsApp Authentication

```bash
# View logs to see QR code
pm2 logs pawpal-worker
```

Scan the QR code with WhatsApp:
1. Open WhatsApp on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code from terminal

Once connected, authentication is saved in `/opt/pawpal/sessions`

### Step 10: Verify Worker

```bash
# Check status
pm2 status

# View logs
pm2 logs pawpal-worker

# Restart if needed
pm2 restart pawpal-worker
```

### Step 11: Test End-to-End

Send a WhatsApp message to your number:

```
My cat is vomiting
```

You should receive an AI response.

## Part 3: Production Monitoring

### Vercel Monitoring

1. Go to Vercel dashboard
2. Click your project
3. View **Analytics** tab for:
   - Request count
   - Response times
   - Error rates

### DigitalOcean Monitoring

```bash
# View worker logs
pm2 logs pawpal-worker

# Monitor system resources
pm2 monit

# View detailed status
pm2 show pawpal-worker
```

### Supabase Monitoring

1. Go to Supabase dashboard
2. Click **Database** → **Query Performance**
3. Monitor:
   - Active connections
   - Query performance
   - Table sizes

## Part 4: Maintenance

### Update Code

**Vercel (automatic):**
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel auto-deploys on push.

**DigitalOcean (manual):**
```bash
ssh root@your-droplet-ip
cd /opt/pawpal
git pull
npm install
pm2 restart pawpal-worker
```

### View Logs

**Vercel:**
- Dashboard → Project → Logs

**DigitalOcean:**
```bash
pm2 logs pawpal-worker --lines 100
```

### Restart Services

**Vercel:**
- Dashboard → Deployments → Redeploy

**DigitalOcean:**
```bash
pm2 restart pawpal-worker
```

### Backup WhatsApp Session

```bash
# On DigitalOcean droplet
cd /opt/pawpal
tar -czf sessions-backup.tar.gz sessions/
scp sessions-backup.tar.gz user@your-local-machine:~/backups/
```

## Part 5: Security Best Practices

### Vercel

- ✅ Environment variables are encrypted
- ✅ HTTPS enabled by default
- ✅ Automatic security headers

### DigitalOcean

```bash
# Set up firewall
ufw allow OpenSSH
ufw enable

# Disable root login (create user first)
adduser pawpal
usermod -aG sudo pawpal
```

### Supabase

- ✅ Use service role key only on server
- ✅ Enable Row Level Security (RLS) if needed
- ✅ Regular backups enabled

## Part 6: Scaling Considerations

### When to Scale

- **Vercel**: Auto-scales, monitor function execution time
- **Worker**: If processing >1000 messages/hour, consider:
  - Larger droplet (2GB RAM)
  - Multiple workers with load balancer
  - Migration to WhatsApp Cloud API

### Cost Estimates

**Monthly costs:**
- Vercel: Free tier (hobby) or $20/month (Pro)
- DigitalOcean: $6-12/month
- Supabase: Free tier or $25/month (Pro)
- OpenAI: ~$0.50-5/month (depends on usage)

**Total: ~$6-62/month**

## Part 7: Migration to WhatsApp Cloud API

When ready to migrate from Baileys to official WhatsApp Cloud API:

1. Only change `src/adapters/whatsapp/` folder
2. Implement new `MessagingProvider`
3. Business logic remains unchanged
4. No changes to API routes or services

This is the benefit of the messaging abstraction layer.

## Troubleshooting

### Worker Disconnects

```bash
pm2 logs pawpal-worker
pm2 restart pawpal-worker
```

### API Errors

Check Vercel logs for:
- OpenAI rate limits
- Supabase connection issues
- Invalid environment variables

### Database Issues

- Check Supabase dashboard for connection limits
- Verify migrations ran successfully
- Review query performance

## Support

For production issues:
1. Check service status (Vercel, DigitalOcean, Supabase, OpenAI)
2. Review logs
3. Verify environment variables
4. Test individual components

## Next Steps

- Set up monitoring alerts
- Configure backup strategy
- Plan scaling approach
- Consider WhatsApp Cloud API migration
