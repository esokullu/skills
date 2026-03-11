#!/usr/bin/env bash
CMD="$1"; shift 2>/dev/null; INPUT="$*"
case "$CMD" in
  design) cat << 'PROMPT'
You are an expert. Help with: 问卷设计. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  enps) cat << 'PROMPT'
You are an expert. Help with: eNPS调查. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  analyze) cat << 'PROMPT'
You are an expert. Help with: 结果分析. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  improve) cat << 'PROMPT'
You are an expert. Help with: 改进方案. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  anonymous) cat << 'PROMPT'
You are an expert. Help with: 匿名反馈机制. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  trend) cat << 'PROMPT'
You are an expert. Help with: 趋势追踪. Provide detailed, practical output in Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  *) cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Employee Survey — 使用指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  design          问卷设计
  enps            eNPS调查
  analyze         结果分析
  improve         改进方案
  anonymous       匿名反馈机制
  trend           趋势追踪

  Powered by BytesAgain | bytesagain.com | hello@bytesagain.com
EOF
    ;;
esac
