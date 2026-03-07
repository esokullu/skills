#!/usr/bin/env python3
"""
Loudy.ai 自动任务流程
"""
import requests
import json
import os
import sys
from datetime import datetime, timezone

API_BASE = "https://api.loudy.ai/app-api/open-api/v1"
LOUDY_API_KEY = os.environ.get("LOUDY_API_KEY", "")

def fetch_earning_pools():
    """获取进行中的奖池列表"""
    url = f"{API_BASE}/earning-pools"
    headers = {
        "X-API-Key": LOUDY_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: Request failed - {e}", file=sys.stderr)
        return []
    
    if data.get("code") != 0 and data.get("code") != 200:
        print(f"Error: {data.get('msg')}", file=sys.stderr)
        return []
    
    pools = data.get("data", [])
    # 过滤进行中的奖池
    ongoing_pools = [p for p in pools if p.get("status") == "Ongoing"]
    
    return ongoing_pools

def fetch_pool_detail(pool_id: int):
    """获取奖池详情"""
    url = f"{API_BASE}/earning-pools/{pool_id}"
    headers = {
        "X-API-Key": LOUDY_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: Request failed - {e}", file=sys.stderr)
        return None
    
    if data.get("code") != 0 and data.get("code") != 200:
        print(f"Error: {data.get('msg')}", file=sys.stderr)
        return None
    
    return data.get("data")

def submit_task(earning_pool_id: int, task_link: str, language_type: str = "zh_CN"):
    """提交任务作品链接"""
    url = f"{API_BASE}/earning-pool-tasks/submit"
    headers = {
        "X-API-Key": LOUDY_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "earningPoolId": earning_pool_id,
        "taskLink": [task_link],
        "languageType": language_type
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: Request failed - {e}", file=sys.stderr)
        return None
    
    if data.get("code") != 0 and data.get("code") != 200:
        print(f"Error: {data.get('msg')}", file=sys.stderr)
        return None
    
    return data.get("data")

def format_pool_info(pool):
    """格式化奖池信息"""
    pool_id = pool.get('id')
    loudy_link = f"https://loudy.ai?poolId={pool_id}"
    
    # 计算剩余时间
    activity_end = pool.get('activityEnd')
    try:
        end_time = datetime.fromisoformat(activity_end.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        remaining = end_time - now
        hours = int(remaining.total_seconds() // 3600)
        time_left = f"{hours} 小时"
    except:
        time_left = "未知"
    
    info = {
        "id": pool_id,
        "sponsor": pool.get('sponsor'),
        "price": pool.get('price'),
        "curator": pool.get('curator'),
        "distribution": pool.get('distribution'),
        "platform": pool.get('platform'),
        "brief": pool.get('brief'),
        "briefLink": pool.get('briefLink'),
        "loudy_link": loudy_link,
        "time_left": time_left
    }
    
    return info

def display_pools(pools):
    """展示奖池信息"""
    for pool in pools:
        info = format_pool_info(pool)
        
        print(f"\n{'='*60}")
        print(f"📊 奖池 ID: {info['id']}")
        print(f"{'='*60}")
        print(f"🎁 赞助方: {info['sponsor']}")
        print(f"💰 奖金: {info['price']}")
        print(f"🎯 策划方: {info['curator']}")
        print(f"📦 分配方式: {info['distribution']}")
        print(f"🌐 平台: {info['platform']}")
        print(f"⏰ 剩余时间: {info['time_left']}")
        print(f"\n🔗 详情页面: {info['loudy_link']}")
        print(f"📚 详细资料: {info['briefLink']}")
        print(f"\n📋 任务要求:")
        print(f"{info['brief']}")
        print(f"{'='*60}\n")

if __name__ == "__main__":
    # 展示可用的奖池
    pools = fetch_earning_pools()
    
    if not pools:
        print("当前没有可用的奖池")
    else:
        display_pools(pools)
