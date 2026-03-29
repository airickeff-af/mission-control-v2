# PolyTrader VPN Solution Guide

## Problem
PolyTrader is blocked due to Singapore IP restrictions on Polymarket.

## Solutions

### Option 1: US-Based VPS (Recommended)
**Providers:**
- DigitalOcean (NYC, SF) - $6/month
- AWS Lightsail (US-East) - $5/month
- Vultr (LA, NYC) - $5/month

**Setup:**
```bash
# 1. Create Ubuntu 22.04 instance in US region
# 2. SSH into server
ssh root@your-vps-ip

# 3. Install dependencies
apt update && apt install -y python3-pip git

# 4. Clone and setup PolyTrader
git clone https://github.com/airickeff-af/mission-control-v2.git
cd mission-control-v2/agents/polymarket
pip3 install -r requirements.txt

# 5. Configure .env
cp .env.example .env
nano .env  # Add your keys

# 6. Run with nohup
nohup python3 polytrader.py > polytrader.log 2>&1 &
disown
```

### Option 2: Proxy Service
**Recommended:**
- Bright Data (formerly Luminati) - Residential US proxies
- Oxylabs - Datacenter proxies
- IPRoyal - Cheap rotating proxies

**Config in PolyTrader:**
```python
PROXY = {
    'http': 'http://user:pass@us-proxy:port',
    'https': 'http://user:pass@us-proxy:port'
}
```

### Option 3: VPN + Local Route
```bash
# Install ProtonVPN or Mullvad
# Connect to US server
# Route only PolyTrader through VPN
sudo ip route add default via VPN_GATEWAY table poly
sudo ip rule add from LOCAL_IP table poly
```

## Quick Test
```bash
# Check if IP is US-based
curl -s ipinfo.io | jq '.country'
# Should return "US"
```

## Implementation Priority
1. **Tonight:** Set up DigitalOcean droplet ($6)
2. **Test:** Verify Polymarket access
3. **Deploy:** Move PolyTrader to VPS
4. **Monitor:** Set up alerts via Telegram

## Cost Analysis
| Option | Monthly Cost | Complexity | Reliability |
|--------|-------------|------------|-------------|
| VPS | $5-6 | Low | High |
| Proxy | $10-50 | Medium | Medium |
| VPN | $5-10 | High | Low |

**Recommendation:** DigitalOcean NYC droplet at $6/month
