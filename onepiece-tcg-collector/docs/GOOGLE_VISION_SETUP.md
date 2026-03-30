# Google Cloud Vision API Setup

## 1. Create Google Cloud Project
- Go to https://console.cloud.google.com/
- Create new project or use existing
- Enable billing (required for Vision API)

## 2. Enable Vision API
```bash
gcloud services enable vision.googleapis.com
```

## 3. Create Service Account
```bash
gcloud iam service-accounts create onepiece-vision \
    --display-name="One Piece TCG Vision API"
```

## 4. Download Credentials
```bash
gcloud iam service-accounts keys create vision-key.json \
    --iam-account=onepiece-vision@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## 5. Set Environment Variable
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/vision-key.json"
```

## Pricing (Free Tier)
- First 1,000 units/month: FREE
- 1,001-5,000,000 units: $1.50 per 1,000 units
- That's ~$1.50 for 1,000 card scans

## API Features Used
- TEXT_DETECTION: Extract card number and name
- DOCUMENT_TEXT_DETECTION: Better for dense text (card effects)
- LABEL_DETECTION: Identify card type/character
