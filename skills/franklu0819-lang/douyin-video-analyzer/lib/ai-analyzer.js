/**
 * AI 视觉分析模块 (v3.2 - 精简稳健版)
 * 专注于基于视频关键帧的视觉深度拆解方案
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { imageToBase64 } = require('./frame-extractor');

// 智谱 API 配置
const ZHIPU_API_BASE = 'open.bigmodel.cn';
const ZHIPU_API_PATH = '/api/paas/v4/chat/completions';

const SUPPORTED_MODELS = {
  FLASH: 'glm-4.6v-flash',
  FLASHX: 'glm-4.6v-flashx',
  FULL: 'glm-4.6v'
};

const DEFAULT_MODEL = SUPPORTED_MODELS.FULL;

/**
 * 智谱 API 调用核心
 */
async function callZhipuAPI(apiKey, messages, model = DEFAULT_MODEL) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    });
    
    const options = {
      hostname: ZHIPU_API_BASE,
      path: ZHIPU_API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 120000
    };
    
    const req = https.request(options, (res) => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(out);
          if (json.error) reject(new Error(json.error.message));
          else resolve(json);
        } catch (e) { reject(new Error('解析失败: ' + out.substring(0, 100))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const ANALYSIS_PROMPT = `请分析这些视频帧，提供结构化的视觉分析报告。内容要求以 JSON 格式返回，包含：
{
  "visualStyle": "视觉风格",
  "colorScheme": "配色方案",
  "textFrequency": "文字出现频率 (高/中/低)",
  "hooks": ["视觉钩子1", "视觉钩子2"],
  "recommendations": ["可复制元素1", "可复制元素2"]
}`;

/**
 * 核心：基于视频帧序列的深度分析
 * @param {string[]} framePaths - 关键帧路径数组
 * @param {string} apiKey - 智谱 API Key
 * @param {string} model - 模型名称
 */
async function analyzeFrames(framePaths, apiKey, model = DEFAULT_MODEL) {
  if (!apiKey) throw new Error('缺少 API Key');
  
  console.log(`  🤖 使用模型: ${model} 进行精细视觉拆解...`);
  
  // 采样策略：GLM-4.6V 支持较多图片输入（上限约 50），增加采样密度
  const maxAISamples = 50;
  const stride = Math.max(1, Math.floor(framePaths.length / maxAISamples));
  const selectedFrames = framePaths.filter((_, i) => i % stride === 0).slice(0, maxAISamples);
  
  console.log(`  📸 从 ${framePaths.length} 帧中选取 ${selectedFrames.length} 帧发送至 AI...`);

  const content = [{ type: 'text', text: ANALYSIS_PROMPT }];
  for (const p of selectedFrames) {
    try {
      content.push({ 
        type: 'image_url', 
        image_url: { url: `data:image/png;base64,${imageToBase64(p)}` } 
      });
    } catch (e) {
      console.warn(`  ⚠️ 跳过损坏的帧: ${p}`);
    }
  }

  const res = await callZhipuAPI(apiKey, [{ role: 'user', content }], model);
  
  if (res.choices?.[0]?.message?.content) {
    try {
      return JSON.parse(res.choices[0].message.content);
    } catch (e) {
      return { rawAnalysis: res.choices[0].message.content };
    }
  }
  throw new Error('AI 分析未返回有效内容');
}

/**
 * 获取支持的模型列表
 */
function getSupportedModels() {
  return SUPPORTED_MODELS;
}

module.exports = {
  analyzeFrames,
  getSupportedModels,
  SUPPORTED_MODELS,
  DEFAULT_MODEL
};
