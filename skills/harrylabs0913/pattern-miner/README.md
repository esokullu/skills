# Pattern Miner

🔍 **自动识别代码和工作流中的重复模式，生成可复用的模板和自动化脚本**

Pattern Miner 是一个智能代码分析工具，帮助你发现重复的代码模式和工作流，自动生成模板和脚本，提高开发效率。

## 快速开始

### 安装

```bash
# 克隆或进入 skill 目录
cd ~/.openclaw/skills/pattern-miner

# 安装 Python 依赖
pip install -r requirements.txt

# 验证安装
python -m pattern_miner.cli --help
```

### 基本使用

```bash
# 1. 分析代码库
python -m pattern_miner.cli analyze ./your-project

# 2. 分析命令历史
python -m pattern_miner.cli history

# 3. 一键完成所有分析
python -m pattern_miner.cli full ./your-project -o ./output
```

## 功能特性

### 🔎 代码模式检测
- 支持 Python、Shell、Bash 等语言
- 基于 AST 的语义分析
- 检测重复函数、代码块
- 识别可提取的变量

### 📜 命令历史分析
- 分析 bash/zsh/fish 历史
- 识别重复命令序列
- 支持时间窗口过滤
- 统计高频命令

### 📝 模板生成
- Jinja2 格式模板
- 自动变量提取
- 使用示例生成
- 元数据保存

### 🤖 脚本自动化
- Shell 脚本生成
- 错误处理内置
- 可执行权限设置
- 配置参数支持

## 使用示例

### 场景 1：发现重复代码

```bash
# 分析项目中的重复代码
$ python -m pattern_miner.cli analyze ./src

Found 3 duplicate pattern(s):

Pattern 1:
  Language: python
  Occurrences: 5
  Hash: a1b2c3d4
  Locations:
    - src/utils.py:23
    - src/helpers.py:45
    ...
  Code preview:
    def process_data(data):
        result = []
        for item in data:
            if item.get('valid'):
                result.append(transform(item))
```

### 场景 2：优化工作流

```bash
# 分析最近 30 天的命令历史
$ python -m pattern_miner.cli history --days 30

Found 2 repeated command sequence(s):

Pattern 1:
  Occurrences: 15
  Commands:
    - cd /project && git pull
    - pip install -r requirements.txt
    - python manage.py migrate
```

### 场景 3：生成自动化脚本

```bash
# 生成模板和脚本
$ python -m pattern_miner.cli full ./project -o ./generated

[1/4] Analyzing code files...
  Found 5 code pattern(s)
[2/4] Analyzing command history...
  Found 3 history pattern(s)
[3/4] Generating templates...
  Saved 8 template(s)
[4/4] Generating scripts...
  Generated 3 script(s)
```

## 输出结构

```
output/
├── summary.json           # 分析摘要
├── pattern_a1b2c3d4.jinja2    # Jinja2 模板
├── pattern_a1b2c3d4.jinja2.meta  # 模板元数据
├── automation_x7y8z9.sh   # 自动化脚本
└── ...
```

## 配置选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-m, --min-lines` | 最小行数 | 3 |
| `-e, --extensions` | 文件扩展名 | .py,.sh,.bash |
| `--days` | 历史分析天数 | 全部 |
| `--min-count` | 最小出现次数 | 2 |
| `-o, --output-dir` | 输出目录 | ./pattern-miner-output |

## 开发

### 运行测试

```bash
pytest tests/ -v
```

### 代码结构

```
pattern_miner/
├── analyzer.py    # 代码分析器
├── history.py     # 历史分析器
├── template.py    # 模板生成器
└── cli.py         # 命令行接口
```

### 添加新语言支持

在 `analyzer.py` 中添加新的分析方法：

```python
def _analyze_javascript(self, lines, file_path):
    # 实现 JavaScript 分析逻辑
    pass
```

## 最佳实践

1. **定期分析** - 每周运行一次，发现新出现的模式
2. **代码审查** - 将结果用于代码审查和重构
3. **团队共享** - 建立团队模板库
4. **CI/CD 集成** - 在 CI 中运行分析，监控技术债务

## 常见问题

**Q: 分析速度很慢？**
A: 排除大型目录（node_modules, venv 等），或增加最小行数阈值。

**Q: 找不到历史文件？**
A: 使用 `-f` 参数手动指定历史文件路径。

**Q: 生成的模板如何使用？**
A: 使用 Jinja2 渲染，或手动替换变量后使用。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**让 Pattern Miner 帮你发现并消除重复工作！🚀**
