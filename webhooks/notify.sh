#!/bin/bash
# Mission Control v2.0 Webhook Sender - Multi-Channel

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Send Telegram notification
send_telegram() {
    local message="$1"
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=$message" \
            -d "parse_mode=HTML" > /dev/null
    fi
}

# Send Discord notification to specific webhook
send_discord() {
    local webhook="$1"
    local message="$2"
    if [ -n "$webhook" ]; then
        curl -s -X POST "$webhook" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"$message\"}" > /dev/null
    fi
}

# Get project webhook
get_project_webhook() {
    local project="$1"
    case "$project" in
        "mc-project")
            echo "$DISCORD_MC_PROJECT_WEBHOOK"
            ;;
        "dealflow")
            echo "$DISCORD_DEALFLOW_WEBHOOK"
            ;;
        "pixel-sanctuary")
            echo "$DISCORD_PIXEL_SANCTUARY_WEBHOOK"
            ;;
        "paws")
            echo "$DISCORD_PAWS_WEBHOOK"
            ;;
        *)
            echo "$DISCORD_WEBHOOK_URL"
            ;;
    esac
}

# Main notification function
notify() {
    local type="$1"
    local message="$2"
    local project="${3:-general}"
    
    echo "[$type] [$project] $message"
    
    # Send to Telegram (all notifications)
    case "$type" in
        "deploy")
            [ "$NOTIFY_ON_DEPLOY" = "true" ] && send_telegram "🚀 <b>[$project] Deployment</b>\n$message"
            ;;
        "error")
            [ "$NOTIFY_ON_ERROR" = "true" ] && send_telegram "❌ <b>[$project] Error</b>\n$message"
            ;;
        "task")
            [ "$NOTIFY_ON_TASK_COMPLETE" = "true" ] && send_telegram "✅ <b>[$project] Task Complete</b>\n$message"
            ;;
        "digest")
            [ "$DAILY_DIGEST" = "true" ] && send_telegram "📊 <b>Daily Digest</b>\n$message"
            ;;
    esac
    
    # Send to Discord (project-specific or general)
    local webhook=$(get_project_webhook "$project")
    if [ -n "$webhook" ]; then
        case "$type" in
            "deploy")
                [ "$NOTIFY_ON_DEPLOY" = "true" ] && send_discord "$webhook" "🚀 **[$project] Deployment**\n$message"
                ;;
            "error")
                [ "$NOTIFY_ON_ERROR" = "true" ] && send_discord "$webhook" "❌ **[$project] Error**\n$message"
                ;;
            "task")
                [ "$NOTIFY_ON_TASK_COMPLETE" = "true" ] && send_discord "$webhook" "✅ **[$project] Task Complete**\n$message"
                ;;
            "digest")
                [ "$DAILY_DIGEST" = "true" ] && send_discord "$webhook" "📊 **Daily Digest**\n$message"
                ;;
        esac
    fi
}

# Handle command line arguments
# Usage: ./notify.sh [deploy|error|task|digest] "message" [project]
case "$1" in
    "deploy"|"error"|"task"|"digest")
        notify "$1" "$2" "${3:-general}"
        ;;
    *)
        echo "Usage: $0 {deploy|error|task|digest} 'message' [project]"
        echo ""
        echo "Projects: mc-project, dealflow, pixel-sanctuary, paws, general"
        echo ""
        echo "Examples:"
        echo "  $0 deploy 'MC Project v2.1 deployed' mc-project"
        echo "  $0 task 'TASK-001 completed' dealflow"
        echo "  $0 error 'Build failed' pixel-sanctuary"
        exit 1
        ;;
esac
