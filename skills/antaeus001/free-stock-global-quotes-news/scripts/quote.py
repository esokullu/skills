#!/usr/bin/env python3
"""
Fetch quote from Yahoo Finance (no API key). On server 403: tries quoteSummary,
then FINNHUB_API_KEY fallback (free at finnhub.io). Supports HTTPS_PROXY.
Usage:
  python quote.py AAPL
  FINNHUB_API_KEY=xxx python quote.py AAPL   # fallback when Yahoo 403
  HTTPS_PROXY=http://proxy:port python quote.py AAPL
"""

import argparse
import json
import os
import sys
import time
from http.client import RemoteDisconnected
import urllib.error
import urllib.request

# Browser-like headers to avoid Yahoo 403 (blocked for bot-like User-Agent or missing headers)
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://finance.yahoo.com/",
}

CHART_BASES = [
    "https://query1.finance.yahoo.com/v8/finance/chart",
    "https://query2.finance.yahoo.com/v8/finance/chart",
]
QUOTE_SUMMARY_BASE = "https://query2.finance.yahoo.com/v10/finance/quoteSummary"


def _build_opener():
    """Use HTTPS_PROXY/HTTP_PROXY if set (e.g. to bypass datacenter IP blocks)."""
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY")
    if proxy:
        return urllib.request.build_opener(urllib.request.ProxyHandler({"https": proxy, "http": proxy}))
    return urllib.request.build_opener()


def _fetch_url(url: str) -> tuple[dict | None, str | None]:
    req = urllib.request.Request(url, headers=DEFAULT_HEADERS)
    try:
        opener = _build_opener()
        with opener.open(req, timeout=15) as r:
            return json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.reason}"
    except (urllib.error.URLError, json.JSONDecodeError, RemoteDisconnected) as e:
        return None, str(e)


def fetch_chart(symbol: str, range_: str = "1d", interval: str = "1d") -> dict | None:
    for base in CHART_BASES:
        url = f"{base}/{symbol}?range={range_}&interval={interval}"
        data, err = _fetch_url(url)
        if data is not None:
            return data
        if err and "403" in err:
            time.sleep(0.5)
            continue
        return {"error": err} if err else None
    return {"error": "Chart API returned 403 from all hosts (try HTTPS_PROXY)"}


def fetch_quote_summary(symbol: str) -> dict | None:
    """Fallback: quoteSummary has price/summaryDetail; sometimes allowed when chart is 403."""
    url = f"{QUOTE_SUMMARY_BASE}/{symbol}?modules=price,summaryDetail&formatted=true"
    data, err = _fetch_url(url)
    if data is None:
        return {"error": err or "quoteSummary failed"}
    return data


def fetch_finnhub(symbol: str) -> dict | None:
    """Fallback when Yahoo 403 (e.g. datacenter IP). Free key at https://finnhub.io."""
    key = os.environ.get("FINNHUB_API_KEY")
    if not key:
        return None
    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={key}"
    data, err = _fetch_url(url)
    if data is None or data.get("c") is None:
        return {"error": err or "Finnhub no data"}
    return data


def _parse_finnhub(data: dict, symbol: str) -> dict | None:
    try:
        c = data.get("c")
        pc = data.get("pc") or c
        d = data.get("d")
        dp = data.get("dp")
        if c is None:
            return None
        if d is None and pc is not None:
            d = c - pc
        if dp is None and pc and pc != 0:
            dp = ((c - pc) / pc) * 100
        return {
            "symbol": symbol,
            "shortName": symbol,
            "currency": "USD",
            "price": c,
            "previousClose": pc,
            "change": d,
            "changePercent": dp,
            "volume": None,
            "fiftyTwoWeekHigh": data.get("h"),
            "fiftyTwoWeekLow": data.get("l"),
        }
    except (KeyError, TypeError):
        return None


def _parse_chart(data: dict, symbol: str) -> dict | None:
    try:
        result = data["chart"]["result"][0]
        meta = result["meta"]
        cur = meta.get("regularMarketPrice") or meta.get("previousClose")
        prev = meta.get("previousClose") or cur
        if prev and cur:
            chg = cur - prev
            pct = (chg / prev) * 100
        else:
            chg = pct = None
        return {
            "symbol": meta.get("symbol", symbol),
            "shortName": meta.get("shortName", symbol),
            "currency": meta.get("currency", ""),
            "price": cur,
            "previousClose": prev,
            "change": chg,
            "changePercent": pct,
            "volume": meta.get("regularMarketVolume"),
            "fiftyTwoWeekHigh": meta.get("fiftyTwoWeekHigh"),
            "fiftyTwoWeekLow": meta.get("fiftyTwoWeekLow"),
        }
    except (KeyError, IndexError, TypeError):
        return None


def _num(v) -> float | None:
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, dict) and "raw" in v:
        return v["raw"]
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _parse_quote_summary(data: dict, symbol: str) -> dict | None:
    try:
        res = data["quoteSummary"]["result"][0]
        price = res.get("price", {}) or {}
        summary = res.get("summaryDetail", {}) or {}
        cur = _num(price.get("regularMarketPrice"))
        prev = _num(summary.get("previousClose"))
        if prev is None:
            prev = cur
        if cur is not None and prev is not None:
            chg = cur - prev
            pct = (chg / prev) * 100
        else:
            chg = pct = None
        return {
            "symbol": price.get("symbol") or symbol,
            "shortName": price.get("shortName") or symbol,
            "currency": price.get("currency") or "",
            "price": cur,
            "previousClose": prev,
            "change": chg,
            "changePercent": pct,
            "volume": _num(summary.get("regularMarketVolume")),
            "fiftyTwoWeekHigh": _num(summary.get("fiftyTwoWeekHigh")),
            "fiftyTwoWeekLow": _num(summary.get("fiftyTwoWeekLow")),
        }
    except (KeyError, IndexError, TypeError):
        return None


def quote_one(symbol: str, range_: str = "1d") -> dict | None:
    interval = "1m" if range_ == "1d" else "1d"
    data = fetch_chart(symbol, range_=range_, interval=interval)
    if data and "error" not in data:
        parsed = _parse_chart(data, symbol)
        if parsed:
            return parsed
    err_msg = data.get("error", "") if isinstance(data, dict) else ""
    if "403" in err_msg or not data:
        time.sleep(0.5)
        qs = fetch_quote_summary(symbol)
        if qs and "error" not in qs:
            parsed = _parse_quote_summary(qs, symbol)
            if parsed:
                return parsed
        fh = fetch_finnhub(symbol)
        if fh and "error" not in fh:
            parsed = _parse_finnhub(fh, symbol)
            if parsed:
                return parsed
        if "403" in err_msg:
            err_msg = "Yahoo 403 (set FINNHUB_API_KEY for fallback or HTTPS_PROXY)"
    return {"symbol": symbol, "error": err_msg or "No data"}


def format_quote(info: dict) -> str:
    if info.get("error"):
        return f"{info['symbol']}: {info['error']}"
    price = info.get("price")
    lines = [
        f"**{info.get('shortName', info['symbol'])}** ({info['symbol']})",
        f"  {info.get('currency', '')} {price:.2f}" if price is not None else "",
    ]
    if info.get("change") is not None and info.get("changePercent") is not None:
        sign = "+" if info["change"] >= 0 else ""
        lines.append(f"  涨跌: {sign}{info['change']:.2f} ({sign}{info['changePercent']:.2f}%)")
    if info.get("volume") is not None:
        lines.append(f"  成交量: {info['volume']:,}")
    if info.get("fiftyTwoWeekHigh") is not None and info.get("fiftyTwoWeekLow") is not None:
        lines.append(f"  52周: {info['fiftyTwoWeekLow']:.2f} - {info['fiftyTwoWeekHigh']:.2f}")
    return "\n".join(l for l in lines if l).strip()


def main() -> None:
    ap = argparse.ArgumentParser(description="Yahoo Finance quote (no API key)")
    ap.add_argument("symbols", nargs="+", help="Symbols e.g. AAPL 0700.HK 000001.SZ")
    ap.add_argument("--range", default="1d", help="Range: 1d,5d,1mo,3mo,6mo,1y,2y,5y (default: 1d)")
    ap.add_argument("--json", action="store_true", help="Output raw JSON")
    args = ap.parse_args()

    out = []
    for sym in args.symbols:
        q = quote_one(sym, range_=args.range)
        if args.json:
            out.append(q)
        else:
            print(format_quote(q))
            print()
    if args.json:
        print(json.dumps(out if len(out) != 1 else out[0], indent=2, default=str))


if __name__ == "__main__":
    main()
    sys.exit(0)
