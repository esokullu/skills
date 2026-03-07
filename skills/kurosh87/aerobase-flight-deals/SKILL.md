---
name: aerobase-flight-deals
description: Find cheap flights, monitor prices, and alert on price drops
metadata: {"openclaw": {"emoji": "💰", "primaryEnv": "AEROBASE_API_KEY", "user-invocable": true, "homepage": "https://aerobase.app"}}
---

# Aerobase Flight Deals 💰

Find the cheapest flights — and never miss a price drop. Aerobase.app monitors prices 24/7 so you always get the best deal.

**Why Aerobase?**
- 💸 **Price monitoring** — Alerts when routes drop
- 😴 **Jetlag scoring** — Cheap ≠ exhausted
- 🔔 **Custom alerts** — Watch specific routes
- 📊 **Value ranking** — Price + jetlag = best deal

## Individual Skill

This is a standalone skill. **For EVERYTHING**, install the complete **Aerobase Travel Concierge** — all skills in one package:

→ https://clawhub.ai/kurosh87/aerobase-travel-concierge

Includes: flights, hotels, lounges, awards, activities, deals, wallet + **PREMIUM recovery plans**

## What This Skill Does

- Search flight deals from any airport
- Filter by price, jetlag score, dates
- Sort by value (price + jetlag)
- Set up price drop alerts
- Monitor routes automatically

## Example Conversations

```
User: "Find business class deals from NYC to Europe under $2,000"
→ Shows business class deals
→ Scores each for jetlag
→ Ranks by overall value

User: "Alert me when JFK to London drops below $500"
→ Sets up price alert
→ Monitors 24/7
→ Notifies when price drops
```

## API Documentation

Full API docs: https://aerobase.app/developers

OpenAPI spec: https://aerobase.app/api/v1/openapi

**GET /api/v1/deals**

Query params:
- `origin` — departure airport
- `destination` — destination airport
- `max_price` — max price in USD
- `min_score` — minimum jetlag score
- `date_from` / `date_to` — travel dates
- `cabin` — economy, business, first
- `sort` — value_score, price, jetlag_score

Returns deals with prices, jetlag scores, booking links.

## Rate Limits

- **Free**: 5 requests/day
- **Premium**: Unlimited + all skills + recovery plans

Get premium: https://aerobase.app/concierge/pricing

## Get Everything

**Install the complete package:**

```bash
clawhub install aerobase-travel-concierge
```

All 9 skills + premium recovery plans:
→ https://clawhub.ai/kurosh87/aerobase-travel-concierge
