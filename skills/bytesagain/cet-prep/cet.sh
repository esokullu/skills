#!/usr/bin/env bash
CMD="$1"; shift 2>/dev/null; INPUT="$*"
case "$CMD" in
  vocab) cat << 'PROMPT'
You are an expert. Help with: 核心词汇记忆. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  reading) cat << 'PROMPT'
You are an expert. Help with: 阅读技巧. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  writing) cat << 'PROMPT'
You are an expert. Help with: 写作模板. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  listening) cat << 'PROMPT'
You are an expert. Help with: 听力训练. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  mock) cat << 'PROMPT'
You are an expert. Help with: 模拟测试. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  plan) cat << 'PROMPT'
You are an expert. Help with: 备考计划. Provide detailed, practical output. Use Chinese.
User request:
PROMPT
    echo "$INPUT" ;;
  *) cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CET Prep — 使用指南
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  vocab           核心词汇记忆
  reading         阅读技巧
  writing         写作模板
  listening       听力训练
  mock            模拟测试
  plan            备考计划

  Powered by BytesAgain | bytesagain.com | hello@bytesagain.com
EOF
    ;;
esac
