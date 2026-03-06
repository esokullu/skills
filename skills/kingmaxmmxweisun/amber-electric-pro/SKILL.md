---
name: amber_energy_manager
description: 获取 Amber Electric 的实时电价、预测电价及站点信息。支持获取当前价格、预测价格和站点列表。
parameters:
  action:
    type: string
    description: 执行的操作。可选值：'get_sites' (获取站点列表), 'get_current_price' (获取当前价格), 'get_forecast' (获取预测价格)。
  site_id:
    type: string
    description: 站点的唯一 ID (执行 get_current_price 或 get_forecast 时必填)。
handler: |
  const baseUrl = 'https://api.amber.com.au/v1';
  const headers = {
    'Authorization': `Bearer ${process.env.AMBER_API_KEY}`,
    'Accept': 'application/json'
  };

  if (params.action === 'get_sites') {
    const res = await fetch(`${baseUrl}/sites`, { headers });
    return await res.json();
  }

  if (params.action === 'get_current_price') {
    if (!params.site_id) return { error: "site_id is required" };
    const res = await fetch(`${baseUrl}/sites/${params.site_id}/prices/current`, { headers });
    return await res.json();
  }

  if (params.action === 'get_forecast') {
    if (!params.site_id) return { error: "site_id is required" };
    const res = await fetch(`${baseUrl}/sites/${params.site_id}/prices/forecasts`, { headers });
    return await res.json();
  }

  return { error: "Invalid action" };
---

# Amber Electric 能源助手
此技能允许 OpenClaw 接入澳洲 Amber Electric 的批发电价数据。

### 主要功能
- **查看站点**：获取你名下的 NMI 和站点 ID。
- **实时价格**：获取当前的电价等级（如 `extremelyLow`, `spike`）和具体数值。
- **电价预测**：获取未来 24 小时的价格趋势，优化大功率电器使用时间。

### 配置要求
需要在环境变量或 `openclaw.json` 中配置：
`AMBER_API_KEY`: 你的 Amber API 令牌。

