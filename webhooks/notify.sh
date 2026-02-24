#!/bin/bash
# Mission Control v2.0 Webhook Sender

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

# Send Discord notification
send_discord() {
    local message="$1"
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"$message\"}" > /dev/null
    fi
}

# Main notification function
notify() {
    local type="$1"
    local message="$2"
    
    echo "[$type] $message"
    
    case "$type" in
        "deploy")
            [ "$NOTIFY_ON_DEPLOY" = "true" ] && send_telegram "🚀 <b>Deployment</b>\n$message" && send_discord "🚀 **Deployment**\n$message"
            ;;
        "error")
            [ "$NOTIFY_ON_ERROR" = "true" ] && send_telegram "❌ <b>Error</b>\n$message" && send_discord "❌ **Error**\n$message"
            ;;
        "task")
            [ "$NOTIFY_ON_TASK_COMPLETE" = "true" ] && send_telegram "✅ <b>Task Complete</b>\n$message" && send_discord "✅ **Task Complete**\n$message"
            ;;
        "digest")
            [ "$DAILY_DIGEST" = "true" ] && send_telegram "📊 <b>Daily Digest</b>\n$message" && send_discord "📊 **Daily Digest**\n$message"
            ;;
    esac
}

# Handle command line arguments
case "$1" in
    "deploy")
        notify "deploy" "$2"
        ;;
    "error")
        notify "error" "$2"
        ;;
    "task")
        notify "task" "$2"
        ;;
    "digest")
        notify "digest" "$2"
        ;;
    *)
        echo "Usage: $0 {deploy|error|task|digest} 'message'"
        exit 1
        ;;
esac
