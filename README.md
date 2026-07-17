# PPT 模板库 — Pro PPT Gen

PPT 模板画廊网站，为 [pro-ppt-gen](/) 技能提供外部模板库（Plan A）。包含 12 个精选学术、商务、教学模板，支持在线浏览、搜索筛选、详情查看和模板名复制。

**在线预览**：部署到 GitHub Pages 后即可通过 `https://<username>.github.io/<repo>/` 访问。

---

## 项目结构

```
ppt-template-gallery/
├── index.html          # 主页面（画廊）
├── registry.json       # 模板元数据 API
├── css/
│   └── style.css       # 样式表
├── js/
│   └── app.js          # 交互逻辑
├── previews/           # 模板预览图（PNG）
│   └── README.md       # 说明
├── releases/           # 模板下载包（ZIP，通过 GitHub Releases 托管）
└── README.md           # 本文件
```

## 部署到 GitHub Pages

### 步骤 1：创建仓库

1. 在 GitHub 上创建新仓库，例如 `ppt-template-gallery`
2. 将本目录所有文件推送到仓库的 `main` 分支：

```bash
cd ppt-template-gallery
git init
git add .
git commit -m "Initial commit: PPT template gallery"
git remote add origin https://github.com/<username>/ppt-template-gallery.git
git push -u origin main
```

### 步骤 2：启用 GitHub Pages

1. 进入仓库的 **Settings → Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 `main`，目录选 `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟，页面即可通过 `https://<username>.github.io/ppt-template-gallery/` 访问

### 步骤 3：上传模板预览图

将模板预览 PNG 文件放入 `previews/` 目录：

```
previews/
├── academic.png
├── academic_conference.png
├── business.png
├── gaokao_review.png
├── minimal_clean.png
├── product_launch.png
├── project_report.png
├── startup_pitch.png
├── teaching.png
├── thesis_defense.png
├── training_workshop.png
└── year_end_review.png
```

推荐尺寸：1920×1080（16:9 比例），文件大小控制在 200KB 以内。

### 步骤 4：通过 GitHub Releases 托管模板下载包

1. 在仓库中创建 Release，标签如 `v1.0.0`
2. 上传每个模板的 ZIP 文件作为 Release Assets
3. 更新 `registry.json` 中各模板的 `download_url` 为 Release 下载链接

---

## 添加新模板

### 1. 准备模板文件

- 创建模板定义 Python 文件（参考已有模板格式）
- 生成预览 PNG 放入 `previews/`
- 打包 ZIP 上传到 GitHub Release

### 2. 更新 registry.json

在 `registry.json` 的 `templates` 数组中添加新条目：

```json
{
  "name": "new_template",
  "display_name": "新模板显示名",
  "scene": "business",
  "description": "模板描述，建议 20-40 字。",
  "base_theme": "business",
  "style_variant": "corporate_formal",
  "layout_blueprint": "corporate_report",
  "cover_style": "封面样式描述",
  "default_transition": "fade",
  "license_id": "MIT",
  "template_score": 88,
  "preview_url": "previews/new_template.png",
  "download_url": "releases/new_template.zip",
  "source_refs": [
    {"name": "源项目名", "url": "https://github.com/...", "stars": 100}
  ]
}
```

### 3. 更新网站

- 如需新场景筛选按钮，在 `index.html` 的 filter-group 中添加按钮
- 提交推送后 GitHub Pages 会自动更新

---

## registry.json Schema

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 模板唯一标识（英文小写+下划线），与技能内部模板名一致 |
| `display_name` | string | 是 | 中文显示名 |
| `scene` | string | 是 | 场景分类：`academic` / `business` / `teaching` / `general` |
| `description` | string | 是 | 模板描述，20-40 字 |
| `base_theme` | string | 是 | 基础主题名 |
| `style_variant` | string | 是 | 风格变体：`minimal_clean` / `corporate_formal` / `bold_impact` / `elegant_luxury` / `modern_tech` |
| `layout_blueprint` | string | 是 | 布局蓝图名 |
| `cover_style` | string | 是 | 封面元素描述 |
| `default_transition` | string | 是 | 默认切换效果：`none` / `fade` / `push` / `zoom` / `wipe_right` / `conveyor` / `reveal` |
| `license_id` | string | 是 | 许可证标识 |
| `template_score` | number | 是 | 模板评分（85-100），低于 85 不得入库 |
| `preview_url` | string | 是 | 预览图相对路径 |
| `download_url` | string | 是 | 下载包相对路径或 GitHub Release URL |
| `source_refs` | array | 是 | 开源来源引用列表 |
| `source_refs[].name` | string | 是 | 源项目名 |
| `source_refs[].url` | string | 是 | 源项目 URL |
| `source_refs[].stars` | number | 是 | GitHub Stars 数 |

---

## 技能如何获取模板数据

Pro PPT Gen 技能通过以下流程获取外部模板库数据：

1. **HTTP GET** 请求 `https://<username>.github.io/ppt-template-gallery/registry.json`
2. 解析 JSON 响应，读取 `templates` 数组
3. 根据 `name` 字段匹配用户指定的模板
4. 获取 `base_theme`、`style_variant`、`layout_blueprint` 等参数驱动 PPT 生成
5. 如获取失败，回退到技能内置模板定义（Plan B）

### 调用示例

```python
import requests

resp = requests.get("https://example.github.io/ppt-template-gallery/registry.json", timeout=10)
data = resp.json()
template = next((t for t in data["templates"] if t["name"] == "thesis_defense"), None)
```

---

## 技术约束

- **零外部依赖**：不使用任何 CDN、构建工具或 npm 包
- **纯静态文件**：HTML + CSS + JS，无需服务端
- **兼容性**：同时支持 `file://` 本地打开和 GitHub Pages HTTPS 部署
- **体积限制**：网站总大小（不含模板 PPTX 文件）控制在 500KB 以内
- **中文界面**：面向中文用户，所有 UI 文案均为中文

---

## 许可证

本网站代码采用 MIT 许可证。各模板源文件的许可证见 `registry.json` 中对应条目的 `license_id` 字段。
