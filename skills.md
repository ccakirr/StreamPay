# Monoracle AI Agent API

> REST API documentation for AI agents to write data to blockchain

## Table of Contents

- [Overview](#overview)
- [REST API & cURL Examples](#rest-api--curl-examples)
- [Complete Examples](#complete-examples)
- [Supported Networks](#supported-networks)

---

## Overview

Monoracle enables AI agents to write structured, verifiable data to blockchain networks through simple REST API calls. Each write operation deploys a new smart contract on the Monad blockchain.

### What Can AI Agents Do?

✅ **Write On-Chain Data** - Deploy smart contracts with your data
✅ **Read On-Chain Data** - Access previously deployed contract data
✅ **Multi-Network Support** - Write to different blockchain networks
✅ **Simple HTTP Interface** - No blockchain knowledge required
✅ **Automatic Contract Deployment** - Smart contracts deployed automatically

### Architecture

```
AI Agent → Monoracle API → Smart Contract Deployment → Blockchain (Monad)
```

---

## REST API & cURL Examples

For agents that prefer HTTP requests over SDK, Monoracle provides a RESTful API.

### Authentication

All API requests require an API key in the request body.

Get your API key from the [AI Agent Dashboard](https://app.monoracle.xyz/ai-agent).

### Base URL

```
https://api.monoracle.xyz
```

---

### Write Data to Feed

**POST** `/feeds/write`

Deploy a new MonOracle contract and write data to blockchain.

```bash
curl -X POST https://api.monoracle.xyz/feeds/write \
  -H "Content-Type: application/json" \
  -d '{
    "network": "monad-testnet",
    "data": {
      "hello": "Monad and Buildermare!",
      "source": "Tech Istanbul"
    },
    "apiKey": "MA301c22af_0cf9ace226ab6651576408e1c69700e7e71312b89783bddd"
  }'
```

**Response:**
```json
{
  "success": true,
  "contractAddress": "0x4bDE48BC1417de047886D5887436C8c27e11bE3a",
  "network": "monad-testnet",
  "data": {
    "hello": "Monad and Buildermare!",
    "source": "Tech Istanbul"
  },
  "createdAt": 1772267019,
  "updatedAt": 1772267019,
  "creatorWallet": "0xeA85d0705f7567336941389D3Ab02C74757FFA50",
  "blockNumber": 15713938
}
```

---

### Read Data from Contract

**GET** `/feeds/read`

Read data from a deployed MonOracle contract.

```bash
curl -X GET "https://api.monoracle.xyz/feeds/read?contractAddress=0x66C2Cdb55612d83d1e44A97d6E940711aeA97cFF&network=monad-testnet"
```

**Response:**
```json
{
  "success": true,
  "contractAddress": "0x4bDE48BC1417de047886D5887436C8c27e11bE3a",
  "network": "monad-testnet",
  "data": {
    "hello": "Monad and Buildermare!",
    "source": "Tech Istanbul"
  },
  "createdAt": 1772267019,
  "updatedAt": 1772267019,
  "creatorWallet": "0xeA85d0705f7567336941389D3Ab02C74757FFA50",
  "blockNumber": 15713938
}
```

---

## Supported Networks

AI agents can write to the following networks:

- **Monad Testnet** (`monad-testnet`)
  - Chain ID: 10143
  - RPC: https://testnet-rpc.monad.xyz/
  - Explorer: https://testnet.monadexplorer.com/

---

## Complete Examples

### Quick Start - Write Your First Data

```bash
# Step 1: Write weather data to blockchain
curl -X POST https://api.monoracle.xyz/feeds/write \
  -H "Content-Type: application/json" \
  -d '{
    "network": "monad-testnet",
    "data": {
      "temperature": 22.5,
      "humidity": 65,
      "location": "Istanbul",
      "timestamp": 1739212331
    },
    "apiKey": "YOUR_API_KEY"
  }'

# Response will include contractAddress like:
# {
#   "success": true,
#   "contractAddress": "0xbFBb3E1121410CB41A7338541D58efA9d5f3CffC",
#   "transactionHash": "0x7f3a2b9c8d1e4f5a...",
#   ...
# }
```

```bash
# Step 2: Read the data back using contract address
curl -X GET "https://api.monoracle.xyz/feeds/read?contractAddress=0xbFBb3E1121410CB41A7338541D58efA9d5f3CffC&network=monad-testnet"

# Response:
# {
#   "success": true,
#   "data": {
#     "temperature": 22.5,
#     "humidity": 65,
#     "location": "Istanbul",
#     "timestamp": 1739212331
#   },
#   ...
# }
```

---

### Example 1: Price Oracle (Bash Script)

```bash
#!/bin/bash

API_KEY="YOUR_API_KEY"

# Fetch ETH price from Coinbase
PRICE=$(curl -s "https://api.coinbase.com/v2/prices/ETH-USD/spot" | jq -r '.data.amount')

# Write to blockchain
curl -X POST https://api.monoracle.xyz/feeds/write \
  -H "Content-Type: application/json" \
  -d "{
    \"network\": \"monad-testnet\",
    \"data\": {
      \"price\": $PRICE,
      \"source\": \"coinbase\",
      \"timestamp\": $(date +%s)
    },
    \"apiKey\": \"$API_KEY\"
  }"
```

### Example 2: Risk Analysis (Python)

```python
import requests
import time

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.monoracle.xyz"

def write_data(data):
    response = requests.post(
        f"{BASE_URL}/feeds/write",
        json={
            "network": "monad-testnet",
            "data": data,
            "apiKey": API_KEY
        }
    )
    return response.json()

# Analyze risk factors
rental_risk = 0.75  # Your risk calculation
macro_risk = 0.82   # Your risk calculation

# Calculate final risk
final_risk = (rental_risk * 0.6 + macro_risk * 0.4)

# Write to blockchain
result = write_data({
    "asset": "RWA-IST-001",
    "riskScore": final_risk,
    "factors": {
        "rental": rental_risk,
        "macro": macro_risk
    },
    "timestamp": int(time.time())
})

print(f"Contract: {result['contractAddress']}")
print(f"TX: {result['transactionHash']}")
```

### Example 3: Market Monitor (Node.js)

```javascript
const axios = require('axios');

const API_KEY = process.env.MONORACLE_API_KEY;
const BASE_URL = 'https://api.monoracle.xyz';

async function writeData(data) {
  const response = await axios.post(`${BASE_URL}/feeds/write`, {
    network: 'monad-testnet',
    data: data,
    apiKey: API_KEY
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

async function readData(contractAddress) {
  const response = await axios.get(`${BASE_URL}/feeds/read`, {
    params: {
      contractAddress: contractAddress,
      network: 'monad-testnet'
    }
  });
  return response.data;
}

async function monitorMarket() {
  // Fetch BTC price from external API
  const btcPrice = await fetchBTCPrice(); // Your API call

  // Calculate market metrics
  const volatility = calculateVolatility(); // Your calculation
  const volume24h = await fetch24hVolume(); // Your API call

  // Write market data to blockchain
  const result = await writeData({
    asset: 'BTC',
    price: btcPrice,
    volatility: volatility,
    volume24h: volume24h,
    timestamp: Math.floor(Date.now() / 1000),
    alert: volatility > 0.05 ? 'high_volatility' : 'normal'
  });

  console.log(`Contract: ${result.contractAddress}`);
  console.log(`TX: ${result.transactionHash}`);

  // Later, read the data
  const storedData = await readData(result.contractAddress);
  console.log('Stored data:', storedData.data);
}

// Run every 5 minutes
setInterval(monitorMarket, 300000);
```

---

### API Rate Limits

- **Free Tier:** 100 requests/minute
- **Pro Tier:** 1,000 requests/minute
- **Enterprise:** Custom limits

### Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FEED",
    "message": "Feed name must not contain spaces",
    "details": {
      "feed": "invalid feed name"
    }
  }
}
```

---

## Support & Resources

- **Dashboard:** https://app.monoracle.xyz/ai-agent
- **Documentation:** https://docs.monoracle.xyz
- **Discord:** https://discord.gg/monoracle
- **GitHub:** https://github.com/monoracle

---

## License

MIT License - See LICENSE file for details