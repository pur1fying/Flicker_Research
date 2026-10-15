---
{
  "title": "缺口与排除项",
  "updated": "2026-09-16",
  "sources": [
    "onsemi-lfm",
    "optical-lockin",
    "led-replacements",
    "reflection-flicker",
    "cie-tn012",
    "plos-flicker",
    "iset-lfm"
  ]
}
---

# 缺口与排除项

## 当前不能据此作结论的内容

| 条目 | 实际障碍 | 仍可使用的部分 |
|---|---|---|
| onsemi 官方文档/视频 | 403 | 已确认入口，不能补写电路和时序 |
| Optical Lock-in / 2026 LED替换灯表征 | 出版全文403 | 摘要与书目信息；不能填实测分布 |
| Light Flickering Guided Reflection Removal | 实验室PDF证书过期 | 摘要及引用关系，未绕过验证 |
| CIE TN012 | PDF获取超时 | 正式条目与摘要，尚未精读全文 |
| RIFLE / VDFP / Bricker / CLEAR | 作者入口仍有待发布提示 | 论文内容可参考，不能声称下载了完整数据 |
| DiffuFlicker / ChromaFlash | 按钮为空或仓库未完善 | 记录页面设置，不当可复现生成器 |
| 所有完整大型数据包 | 本轮未全量下载 | 数字标注来自论文，计数口径疑点保留 |
| 目标相机与灯具 | 没有实测读出、QE、SPD—时间曲线 | 生成参数只是候选范围 |
| Kubric / ISET | 未运行渲染器与相机仿真 | 源码静态审计；ISET独立数学函数做过对照 |

## 排除与降级示例

- Q036 的 FlickerFix 游戏模组、Flickr 图文数据：同名但任务无关。
- OpenAlex 广义光谱查询中的听觉、气候时间序列、电力优化：与本项目无关。
- RSCD/滚动快门几何校正：可作相机几何背景，不是频闪配对GT。
- [DiffSynth](/sources/diffsynth)、[FastBlend](/sources/fastblend)：算法生成的一致性任务，另列相关分支。
- [ChromaFlash](/sources/chromaflash)：主动光谱编码，不能直接代表被动照明。
- [静态光谱参考场景](/sources/spectral-reference-scenes)：可用于材质/光谱校验，没有时间调制GT。
- [PLOS条目](/sources/plos-flicker)：数据段描述雾合成，与物理频闪机制不符；不采用其数据作为物理依据。

## 仍需真实实验回答

光谱—时间曲线的测量，材质谱与相机谱响应，曝光中快速运动/遮挡的收敛，渲染噪声与真实灯光退化的区分，以及既有训练数据在新灯具/相机上的泛化。没有以新增来源数量代替这些实验。
