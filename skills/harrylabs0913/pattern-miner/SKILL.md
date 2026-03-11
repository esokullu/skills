# Pattern Miner Skill

自动识别用户代码/工作流中的重复模式，提取可复用的模板和自动化脚本，帮助用户减少重复工作。

## 功能特性

### 核心功能
1. **静态代码分析** - 检测 Python/Shell 代码中的重复代码块
2. **命令历史分析** - 识别重复的命令序列
3. **模板生成** - 生成 Jinja2 格式的 reusable templates
4. **脚本生成** - 自动生成 Shell 自动化脚本
5. **CLI 接口** - 简单易用的命令行工具

### 技术栈
- Python 3.8+
- tree-sitter（代码解析）
- Jinja2（模板引擎）
- SQLite（数据存储）

## 安装

```bash
# 进入 skill 目录
cd ~/.openclaw/skills/pattern-miner

# 安装依赖
pip install jinja2

# 或者使用 package.json (如果有 npm 脚本)
npm install
```

## 使用方法

### 1. 代码分析

分析目录中的重复代码模式：

```bash
# 分析 Python 和 Shell 文件
pattern-miner analyze ./my-project

# 指定文件扩展名
pattern-miner analyze ./src -e .py,.js,.sh

# 输出结果到 JSON 文件
pattern-miner analyze ./my-project -o patterns.json
```

### 2. 命令历史分析

分析 shell 历史中的重复命令序列：

```bash
# 分析默认历史文件
pattern-miner history

# 指定历史文件
pattern-miner history -f ~/.zsh_history

# 分析最近 30 天
pattern-miner history --days 30

# 从 SQLite 数据库加载
pattern-miner history -d ~/.openclaw/data/commands.db
```

### 3. 生成模板

从分析结果生成 Jinja2 模板：

```bash
# 从分析结果生成模板
pattern-miner template -i patterns.json -o ./templates

# 生成的模板文件
# templates/pattern_abc123.jinja2
# templates/pattern_abc123.jinja2.meta
```

### 4. 生成脚本

从 Shell 模式生成自动化脚本：

```bash
# 生成可执行脚本
pattern-miner script -i patterns.json -o ./scripts

# 生成的脚本可直接运行
./scripts/automation_abc123.sh
```

### 5. 完整流程

一键完成分析、模板生成和脚本生成：

```bash
# 完整分析并生成所有输出
pattern-miner full ./my-project -o ./pattern-miner-output

# 包含历史分析
pattern-miner full ./my-project -f ~/.bash_history -o ./output
```

## 输出示例

### 代码模式检测

```
Pattern 1:
  Language: python
  Occurrences: 5
  Hash: a1b2c3d4
  Locations:
    - /project/utils.py:23
    - /project/helpers.py:45
    - /project/lib/common.py:12
  Variables: data, result, config
  Code preview:
    def process_data(data):
        result = []
        for item in data:
            if item.get('valid'):
                result.append(transform(item))
```

### 命令序列检测

```
Pattern 1:
  Occurrences: 12
  Commands:
    - cd /project && git pull
    - pip install -r requirements.txt
    - python setup.py develop
  Example usage:
    cd /project && git pull && pip install -r requirements.txt
```

## 配置选项

### 分析选项
- `--min-lines` / `-m`: 最小行数（默认：3）
- `--extensions` / `-e`: 文件扩展名（默认：.py,.sh,.bash）
- `--days`: 历史分析天数
- `--min-count`: 最小出现次数（默认：2）

### 输出选项
- `--output` / `-o`: 输出目录或文件
- `--verbose` / `-v`: 详细输出

## 目录结构

```
pattern-miner/
├── SKILL.md              # 技能文档
├── package.json          # NPM 配置
├── pattern_miner/
│   ├── __init__.py       # 包初始化
│   ├── analyzer.py       # 代码分析器
│   ├── history.py        # 历史分析器
│   ├── template.py       # 模板生成器
│   └── cli.py            # CLI 入口
├── templates/            # 内置模板
├── tests/                # 测试用例
└── README.md             # 使用说明
```

## 集成示例

### 在开发工作流中使用

```bash
# 1. 定期分析项目代码
pattern-miner analyze ./src -o .patterns/code.json

# 2. 分析常用命令
pattern-miner history --days 7 -o .patterns/history.json

# 3. 生成模板
pattern-miner template -i .patterns/code.json -o templates/

# 4. 在 CI/CD 中使用生成的脚本
./scripts/automation_deploy.sh
```

### 与编辑器集成

```python
# 在 VSCode settings.json 中添加
{
  "tasks": {
    "pattern-miner": {
      "label": "Run Pattern Miner",
      "type": "shell",
      "command": "pattern-miner full ${workspaceFolder} -o .patterns"
    }
  }
}
```

## 最佳实践

1. **定期运行** - 每周运行一次完整分析，发现新的重复模式
2. **代码审查** - 将检测结果用于代码审查，识别可重构的代码
3. **模板库** - 建立团队模板库，共享最佳实践
4. **自动化** - 将常用命令序列固化为脚本

## 注意事项

- 首次分析可能需要较长时间，取决于代码库大小
- 建议排除 `node_modules`, `venv`, `.git` 等目录
- 生成的模板需要人工审查后再使用
- 历史分析依赖 shell 历史记录，确保已启用

## 故障排除

### 问题：找不到历史文件
```bash
# 手动指定历史文件
pattern-miner history -f ~/.zsh_history
```

### 问题：模板生成失败
```bash
# 检查 Jinja2 是否安装
pip install jinja2

# 检查输入文件格式
cat patterns.json | python -m json.tool
```

### 问题：分析速度慢
```bash
# 排除大目录
pattern-miner analyze ./src --exclude node_modules,venv,.git

# 减少最小行数
pattern-miner analyze ./src -m 5
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
