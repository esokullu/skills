---
name: Decision Economic Optimizer
description: Deterministic decision-ranking API with HTTP 402 USDC payments and outcome credits (discounts).
version: 0.1.0
homepage: https://which-llm.com
credentials_required: true
primary_credential: WALLET_CREDENTIALS
---

# Which‑LLM: Outcome‑Driven Decision Optimizer

## Overview

Use this skill when you need a deterministic recommendation for which LLM to use under explicit constraints such as cost and quality.

The skill is for calling the Which‑LLM API. It does not run an LLM itself. It helps an agent decide which model to call next, then optionally report the outcome to earn credits for future paid calls.

## When to use it

- Pick the cheapest model that still meets a quality target
- Choose a fallback model if the preferred one fails
- Keep model selection deterministic and auditable
- Report execution results and earn credits for later requests

## Quick Reference

- **API base URL:** `https://api.which-llm.com`
- **Primary paid endpoint:** `POST /decision/optimize`
- **Outcome endpoint:** `POST /decision/outcome`
- **Free discovery endpoints:** `GET /capabilities`, `GET /pricing`, `GET /status`
- **Payment asset:** `USDC`
- **Supported chains:** Base, Ethereum, Arbitrum, Optimism, Avalanche

### Prerequisites

Before using paid endpoints, have the following ready:

- A separate EVM wallet created only for this skill
- A small balance in that wallet: USDC for payments plus native gas token for network fees
- Preferred credentials: `WALLET_KEYSTORE_PATH` or `WALLET_KEYSTORE_JSON` plus `WALLET_KEYSTORE_PASSWORD`
- Fallback credential: `WALLET_PRIVATE_KEY`
- Optional `WALLET_RPC_URL` and `PREFERRED_CHAIN_ID`
- Payment-address verification from at least two publication channels or retrieval paths
- The skill declares per-request payment approval as the intended default, but actual enforcement depends on the host or runtime

Keep this brief rule in mind: never use a main wallet for this skill.

## Credential Options

### Preferred

Use an encrypted keystore for the separate wallet:

- `WALLET_KEYSTORE_PATH` plus `WALLET_KEYSTORE_PASSWORD`
- or `WALLET_KEYSTORE_JSON` plus `WALLET_KEYSTORE_PASSWORD`

This keeps the published skill from depending on a raw signing key as the primary path.

### Fallback

Use `WALLET_PRIVATE_KEY` only if you cannot use the keystore path.

If you use the fallback:

- keep the wallet separate
- keep the balance small
- keep per-request approval enabled by default

### Wallet Setup Best Practices

- Create a non-main wallet specifically for this skill
- Prefer an encrypted keystore over a raw private key
- Keep the balance small, typically `$2-10` USDC plus `$3-5` gas token
- Start with a small test balance first, such as `$1-2` USDC plus `$1-2` gas
- Store the signing key securely and never commit or share it
- Review transactions regularly and refill only after checking usage

## What this skill does

- Sends requests to the Which‑LLM API
- Uses `POST /decision/optimize` to get a recommended model and fallback plan
- Uses `POST /decision/outcome` to report real execution results
- Handles the standard payment flow for paid calls: `402 -> approve/sign payment -> retry`
- Sends only public payment proof to the API: transaction hash, payer address, amount, chain, and asset
- Can apply `X-Credit-Token` to reduce the next paid request

## What this skill does not do

- It does not call an LLM directly
- It does not execute arbitrary code from your prompt
- It does not need unrelated files, secrets, or system access outside the wallet and API call flow

## Payment Model

Paid calls use HTTP `402 Payment Required`.

High-level flow:

1. Call `POST /decision/optimize`
2. If the API returns `402`, inspect `required_amount`, `accepts`, and `payment_reference`
3. Verify the payment address during setup and confirm it matches your trusted sources
4. In the intended default mode, a human approves the payment
5. Sign and submit the exact USDC payment from the separate wallet
6. Retry the same request with payment proof headers

### Approval Modes

#### Default Mode

The skill declares approval required for each payment as the intended default.

Actual enforcement is host-dependent. Do not assume the skill file alone guarantees a human approval prompt before wallet spend.

This is the recommended publishing posture because:

- the wallet key is not treated as an always-available spending credential
- each payment still gets human review
- the separate low-balance wallet limits exposure even if the skill is misused

#### Optional Lower-Friction Mode

Hosts may allow a lower-friction mode if a human deliberately disables per-request approval for repeated low-value requests.

If that mode is enabled:

- use only a separate low-balance wallet
- keep a strict funding cap
- review the tradeoff before enabling it

## Payment Security Verification

Do not trust a payment address from only one place, including this skill file.

Before funding or using the wallet, verify the payment address across at least two publication channels or retrieval paths:

- `https://api.which-llm.com/.well-known/payment-address.txt`
- `https://api.which-llm.com/.well-known/agent.json`
- `https://api.which-llm.com/docs/payment-addresses`
- `ENS: which-llm.eth`

These paths improve detectability of tampering, but they may still share operational control and should not be treated as fully independent trust anchors. The `/.well-known/agent.json` path is another publication channel, not a separate operator-controlled trust anchor by itself.

All listed values should match. If they do not match, do not pay and report the discrepancy to `https://api.which-llm.com/report/wrong_address`.

At present, this skill does not publish a separate cryptographic trust anchor such as a signed address statement, on-chain attestation, or second independently controlled publication domain.

## Endpoints

### `GET /capabilities`

Use this to discover supported constraints, decision types, and payment behavior.

### `GET /pricing`

Use this to check current pricing and supported chains before making a paid request.

### `GET /status`

Use this for service-health checks.

### `POST /decision/optimize`

This is the main endpoint. Send the goal and constraints, then receive:

- `recommended_model`
- `fallback_plan`
- decision metadata and explainability fields

Typical request shape:

```json
{
  "goal": "Summarize customer feedback emails into a 5-bullet executive summary",
  "constraints": {
    "min_quality_score": 0.8,
    "max_cost_usd": 0.01
  },
  "workload": {
    "input_tokens": 1200,
    "output_tokens": 300,
    "requests": 1
  },
  "task_type": "summarize"
}
```

If payment is required, the API first returns `402` with fields such as:

- `required_amount`
- `currency`
- `accepts[].chain`
- `accepts[].pay_to`
- `payment_reference`

Retry the request after payment with:

- `X-Payment-Chain`
- `X-Payment-Tx`
- `X-Payer`
- `X-Payment-Amount`
- `X-Payment-Asset`

If you have a valid credit token, also send:

- `X-Credit-Token`

### `POST /decision/outcome`

Use this after running the recommended model. Report what actually happened so the system can issue a credit token for future use.

Typical request shape:

```json
{
  "decision_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
  "option_used": "openai/gpt-4o-mini",
  "actual_cost": 0.008,
  "actual_latency": 650,
  "quality_score": 0.86,
  "success": true
}
```

Typical response includes:

- `status`
- `decision_id`
- `outcome_hash`
- `refund_credit.credit_token`

## Request Strategy For Agents

- Call `GET /capabilities` or `GET /pricing` first if you need to discover the current payment model
- Use `POST /decision/optimize` only when you actually need model selection help
- Reuse the returned decision data rather than repeatedly asking the same question
- After running the chosen model, call `POST /decision/outcome` to earn credits
- Prefer the intended default approval-required mode unless a human has deliberately enabled lower-friction payments on a host that supports that configuration

## Minimal Safety Rules

- Use a separate low-balance wallet only
- Keep payment approval enabled by default on the host whenever possible
- Verify payment addresses across multiple publication channels before first use
- Send exact payment amounts only
- Share only payment proof headers with the API, never the wallet key itself

## Troubleshooting

### `PAYMENT_REQUIRED`

The endpoint needs payment first. Read the `402` response, pay the exact amount on a supported chain, then retry with payment proof headers.

### `PAYMENT_INVALID`

Check:

- exact amount sent
- correct chain
- correct recipient
- confirmed transaction
- headers match the actual transaction

### `NO_FEASIBLE_OPTIONS`

Your cost and quality constraints are too strict for the available models. Relax the budget or quality threshold and retry.

### `RATE_LIMIT_EXCEEDED`

Back off and retry later. Use an idempotency key for safe retries.
