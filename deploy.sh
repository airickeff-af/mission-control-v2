#!/bin/bash
# Deploy Mission Control v2.0 to GitHub Pages
# Run this script to push and deploy

echo "🚀 Deploying Mission Control v2.0..."
echo ""

# Check if git remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  No remote configured."
    echo ""
    echo "To deploy:"
    echo "1. Create repo: https://github.com/new"
    echo "2. Name: mission-control-v2"
    echo "3. Make it Public"
    echo "4. Run: git remote add origin https://github.com/YOUR_USERNAME/mission-control-v2.git"
    echo "5. Run this script again"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Pushed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://github.com/YOUR_USERNAME/mission-control-v2/settings/pages"
    echo "2. Source: Deploy from a branch"
    echo "3. Branch: main /root"
    echo "4. Save"
    echo ""
    echo "🌐 Your site will be at:"
    echo "   https://YOUR_USERNAME.github.io/mission-control-v2/"
else
    echo ""
    echo "❌ Push failed. Check your GitHub credentials."
fi
