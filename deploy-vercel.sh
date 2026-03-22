#!/bin/bash
# Deploy Meebit assets to Vercel

echo "🏢 Deploying Meebit Assets to Vercel..."
echo "=========================================="

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Create a temporary deployment folder
DEPLOY_DIR="/tmp/meebits-deploy"
mkdir -p $DEPLOY_DIR

# Copy assets
echo "📁 Copying assets..."
cp -r assets/meebits-downloaded/* $DEPLOY_DIR/ 2>/dev/null || echo "⚠️  No assets found in assets/meebits-downloaded/"
cp agent-office-v90.html $DEPLOY_DIR/index.html

# Create vercel.json for headers
cat > $DEPLOY_DIR/vercel.json <> EOF
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
EOF

# Deploy
echo "🚀 Deploying to Vercel..."
cd $DEPLOY_DIR
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🔗 Check your Vercel dashboard for the URL"
