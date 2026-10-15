---
{
  "title": "数据与论文比较",
  "updated": "2026-09-16",
  "checkedAt": "2026-09-16",
  "sources": [
    "burstdeflicker",
    "iset-lfm",
    "acam-delight",
    "rolling-grid",
    "ac-intrinsic",
    "rifle",
    "clear-mirage",
    "vdfp",
    "bricker",
    "flickerfix",
    "diffuflicker",
    "dfcg",
    "all-in-one",
    "blazebvd",
    "lfista"
  ]
}
---

# 数据与论文比较

这里比较独立数据资源与生成思路。逐篇公式、参数、代码和阅读程度集中维护在资料卡，避免同一结论散落多份正文。

## 与目标最接近的资源

| 资料 | 对象 / GT | 已核查范围 | 主要边界 |
|---|---|---|---|
| [BurstDeflicker](/sources/burstdeflicker) | 静态短长曝光、绿幕动态配对 | 论文生成段与固定提交Loader | 人物未获得完整三维重照明 |
| [ISET-LFM](/sources/iset-lfm) | 汽车场景独立光源辐射、多曝光 | 论文、配置和积分函数对照 | 示例参数窄；扩参发现代码错误 |
| [ACam / DELIGHT](/sources/acam-delight) | 实测灯具时间响应 | 正文与补充灯具表 | 测量通道已含仪器响应 |
| [ICCP 2018](/sources/rolling-grid) | 行间时序、灯具BRF与周期体积 | 成像与采集章节 | 周期/静态假设，不是任意动态真值 |
| [AC本征分解](/sources/ac-intrinsic) | 多灯基图、漫反射与镜面成分 | 合成和真实逐灯参考 | 受二色反射与可辨识性约束 |

## 屏幕与车灯子域

| 数据/方法 | 规模口径 | 获取状态与意义 |
|---|---|---|
| [RIFLE](/sources/rifle) | v4 105对原图、424裁块 | 原文版本有变化；公开包待核实 |
| [MIRAGE / CLEAR](/sources/clear-mirage) | 约3000对，三类退化 | 屏幕内容配准与逆ISP；下载待发布 |
| [DeViD / VDFP](/sources/vdfp) | 108段屏幕播放内容 | 不是108种实体房间灯光 |
| [Bricker / BRACE](/sources/bricker) | 5帧RAW+GT；合成1000/100、真实250/40 | 对曝光差异有价值，代码/数据待发布 |
| [FlickerFix](/sources/flickerfix) | 536028 ROI伪掩码图像；85对合成视频 | ROI图像数与视频数必须分开 |
| [DiffuFlicker](/sources/diffuflicker) | 作者页面报告144段合成视频 | 真正公开包未取得；真实演示无GT |

## 通用与相关任务

[All-In-One](/sources/all-in-one)、[BlazeBVD](/sources/blazebvd)、[LFISTA](/sources/lfista)用于通用光度变化或老电影的补充比较；[事件频闪](/sources/event-flicker)属于其他传感模式。[DFCG](/sources/dfcg)的加性条纹可作简单对照，不代表三维灯光。

## 合成准确性需要分级

图像域条带、多灯线性贡献、曝光内几何积分、光谱与相机模型是逐级增加的能力。不是每个声称“physics-based”的流程都涵盖四层。按[真值与覆盖设计](/datasets/design)保存近似级别和数据来源。
