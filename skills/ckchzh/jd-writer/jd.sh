#!/usr/bin/env bash
CMD="$1"; shift 2>/dev/null; INPUT="$*"
case "$CMD" in
  write) cat << 'PROMPT'
You are a Chinese content expert. Help with: 撰写岗位JD(职责+要求+福利). Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  optimize) cat << 'PROMPT'
You are a Chinese content expert. Help with: 优化现有JD吸引力. Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  tech) cat << 'PROMPT'
You are a Chinese content expert. Help with: 技术岗位JD模板. Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  sales) cat << 'PROMPT'
You are a Chinese content expert. Help with: 销售/运营岗JD. Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  intern) cat << 'PROMPT'
You are a Chinese content expert. Help with: 实习生JD. Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  compare) cat << 'PROMPT'
You are a Chinese content expert. Help with: JD竞品对比分析. Be detailed and practical. Output in Chinese.
User input:
PROMPT
    echo "$INPUT" ;;
  *) cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  JD Writer — 使用指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  write           撰写岗位JD(职责+要求+福利)
  optimize        优化现有JD吸引力
  tech            技术岗位JD模板
  sales           销售/运营岗JD
  intern          实习生JD
  compare         JD竞品对比分析

  Powered by BytesAgain | bytesagain.com | hello@bytesagain.com
EOF
    ;;
esac
