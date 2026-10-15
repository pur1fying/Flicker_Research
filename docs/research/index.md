---
{
  "title": "检索方法与覆盖",
  "updated": "2026-09-16",
  "sources": [
    "doe-tlm",
    "sony-understanding-flicker",
    "osram-pwm",
    "hyperspectral-tlm",
    "ac-intrinsic",
    "flickerfix",
    "burstdeflicker",
    "iset-lfm"
  ]
}
---

# 检索方法与覆盖

本轮对八个方向分别使用关键词发现与学术/厂商/代码等互补路径。重点是照明频闪；屏幕、汽车和通用视频任务分别归类。以下“覆盖”表示已执行对应发现和核查，不表示全网穷尽，也不表示所有来源都取得全文。

## 八个方向的实际覆盖

| 方向 | 查询 | 互补路径 | 新增或确认的内容 |
|---|---|---|---|
| 频闪成因与分类 | Q001、Q034、Q050 | Crossref/OpenAlex；Sony/DOE 主题目录 | [拍摄频闪与算法/老电影光度变化分开](/sources/doe-tlm) |
| 快门与传感器 | Q002、Q009–018、Q035 | 相机帮助章节；Basler 行时序与传感器资料 | [机械/电子/GRR，采集与显示时序差别](/sources/sony-understanding-flicker) |
| 灯具与驱动 | Q003、Q019–027、Q047 | TI/Infineon/ADI/OSRAM；DOE/MetTLM | [新增跨周期 dithering、双时钟与模拟调光](/sources/osram-pwm) |
| 光谱与颜色 | Q004、Q024、Q028、Q040、Q053 | Aalto/IOP 原文；RGL/CIE/作者资源 | [等效采样不能冒充实时高速光谱视频](/sources/hyperspectral-tlm) |
| 材质、反射与运动 | Q005、Q030、Q038–039、Q046 | ACam/ICCP/CVPR 原文；OpenAlex 前向引用 | [逐灯参考、二色反射与不可辨识性](/sources/ac-intrinsic) |
| 去闪论文 | Q006、Q031–034、Q041–048 | OpenAlex 后续引用；出版方和作者项目 | [新增 FlickerFix/DiffuFlicker；算法闪烁另类](/sources/flickerfix) |
| 数据集与真值 | Q007、Q033、Q036–037、Q043–044、Q062 | 作者下载入口；论文算法与固定提交代码 | [分开计数 ROI、帧、片段及真实/合成 GT](/sources/burstdeflicker) |
| 模拟器与标定 | Q008、Q024–027、Q051、Q057 | Kubric/Cycles 源码；ISET/CIE/EMVA 与光谱参考场景 | [独立公式对照揭示代码扩参风险](/sources/iset-lfm) |

## 实施方法

1. 通用关键词与厂商专有术语并行，追踪目录、相关说明和附件。
2. 核心论文反向查参考文献，前向查引用与作者项目；版本与镜像归并。
3. 原文阅读范围、代码核查、独立数学验证、完整复现是不同状态。
4. 发现新核心内容则重开分支。完成新增核查后再执行收束复核。

## 阶段性收束

追加的 Q056–061 和随后 Q062–064 未新增本范围内的核心物理频闪数据集或生成路线；新出现的静态光谱参考、同一工作镜像和已有 NMF 分离路线已归类。收束仅对本轮检索范围与当前可访问来源成立。见[追踪记录](/research/citation-tracing)。

## 查验入口

[逐条查询](/research/search-log) · [厂商记录](/research/vendors) · [缺口和排除项](/research/gaps)。
