---
name: ekybot-connector
description: Complete EkyBot integration for OpenClaw workspaces. Handles workspace registration, health monitoring, telemetry streaming, AND multi-agent communication setup. Use for connecting to EkyBot dashboard, setting up agent collaboration, or enabling inter-agent workflows with automated configuration.
---

# EkyBot Connector v1.1

## Overview

Transform your OpenClaw workspace into a professionally managed multi-agent system with EkyBot integration. This skill provides complete setup for monitoring, telemetry, and inter-agent communication - bridging the gap between CLI power and enterprise-grade collaboration.

## Core Capabilities

### 1. Workspace Registration

Register your OpenClaw workspace with EkyBot to generate API keys and establish connection.

**When to use:** First-time setup, workspace initialization, API key regeneration.

```bash
# Register workspace and get API key
scripts/register_workspace.sh
```

### 2. Health Monitoring

Monitor workspace health including agent status, session activity, and system metrics.

**When to use:** System diagnostics, troubleshooting, periodic health checks.

```bash
# Check workspace health
scripts/health_check.sh

# Continuous monitoring
scripts/health_monitor.sh --interval 300
```

### 3. Telemetry Streaming

Stream real-time telemetry data including costs, usage metrics, and agent activity to EkyBot.

**When to use:** Cost tracking, usage analytics, performance monitoring, dashboard updates.

```bash
# Send telemetry data
scripts/send_telemetry.sh --workspace-id <id> --api-key <key>

# Start continuous telemetry streaming
scripts/start_telemetry.sh
```

### 4. Multi-Agent Communication Setup **[NEW in v1.1]**

Automatically configure multi-agent OpenClaw workspace with EkyBot channel integration.

**When to use:** Setting up agent teams, enabling inter-agent collaboration, automating agent coordination.

```bash
# Setup 2-agent personal workspace
scripts/setup_communication.sh

# Setup 3-agent team workspace  
scripts/setup_communication.sh --preset team

# Setup 4-agent enterprise workspace
scripts/setup_communication.sh --preset enterprise --agents 4

# Preview changes without applying
scripts/setup_communication.sh --dry-run
```

**What it does:**
- Creates specialized agent workspaces with templates
- Updates OpenClaw configuration for multi-agent support
- Creates corresponding EkyBot channels for each agent
- Enables inter-agent communication protocols
- Tests communication setup end-to-end

## Quick Start

### Option A: Monitoring Only
```bash
# 1. Register workspace
scripts/register_workspace.sh

# 2. Test connection
scripts/health_check.sh

# 3. Start telemetry
scripts/start_telemetry.sh
```

### Option B: Full Multi-Agent Setup
```bash
# 1. Register workspace  
scripts/register_workspace.sh

# 2. Setup multi-agent communication
scripts/setup_communication.sh --preset personal

# 3. Start monitoring
scripts/health_check.sh
scripts/start_telemetry.sh

# 4. View dashboard
open https://ekybot.com
```

### Option C: Enterprise Team
```bash
# 1. Register workspace
scripts/register_workspace.sh

# 2. Setup enterprise agents
scripts/setup_communication.sh --preset enterprise

# 3. Start comprehensive monitoring
scripts/start_telemetry.sh --continuous --verbose
```

## Configuration

Store workspace credentials in `~/.openclaw/ekybot-connector/config.json`:

```json
{
  "workspace_id": "ws_...",
  "api_key": "ek_...",
  "telemetry_interval": 300,
  "endpoints": {
    "base_url": "https://www.ekybot.com/api"
  }
}
```

## Agent Presets

### Personal (2 agents)
- **Assistant**: General purpose for daily tasks
- **Specialist**: Domain expert for complex projects

### Team (3 agents)  
- **Coordinator**: Team coordination and project management
- **Researcher**: Research and analysis tasks
- **Developer**: Code development and technical tasks

### Enterprise (4 agents)
- **Manager**: Strategy and high-level coordination
- **Analyst**: Data analysis and reporting
- **Specialist**: Domain expertise and problem solving
- **Assistant**: General tasks and coordination support

## Validation & Testing

```bash
# Validate complete setup
scripts/validate_setup.sh

# Test specific components
scripts/health_check.sh
scripts/send_telemetry.sh --verbose
```

## API Reference

See [references/api.md](references/api.md) for complete EkyBot Workspace API documentation including endpoints, authentication, response formats, and multi-agent communication APIs.

## Troubleshooting

Common issues and solutions documented in [references/troubleshooting.md](references/troubleshooting.md), including multi-agent setup troubleshooting and communication debugging.
