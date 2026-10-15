---
{
  "title": "ISET-LFM",
  "updated": "2026-09-16",
  "scenes": [
    "汽车与信号灯"
  ],
  "topics": [
    "数据集与真值",
    "去闪论文"
  ],
  "year": 2026,
  "readingStatus": "相关章节已读",
  "accessStatus": "数据入口已提供",
  "checkedAt": "2026-09-16",
  "sourceType": "论文与数据",
  "summary": "光谱场景、独立灯组和相机模拟；汽车频闪的物理生成参考。",
  "sourceId": "iset-lfm",
  "canonicalUrl": "https://github.com/AyushJam/iset-lfm",
  "attachments": [
    {
      "label": "论文原文",
      "file": "iset_paper_pdf.pdf",
      "sha256": "ae3d9e59f7817a8603430962ad475e2ed108a8e20da6d0070540f47ac793d5eb",
      "redistributable": false
    }
  ]
}
---

# ISET-LFM


- 200 个汽车场景，逐组保存车灯、路灯、环境和其他光源的辐射贡献。
- 每组短曝光 3–5 ms、长曝光 11.11 ms，各 3 帧；场景包含 20–50 m/s 自车运动设置。
- 结合 ISET3D/PBRT 光谱渲染与 ISETCam 光学/传感器/ISP；支持渲染前调光或渲染后光源组加权。
- Stanford 数据记录有公开入口，数据许可为 ODC-By 1.0；代码许可与数据许可应分别记录。

判断：**与本项目“光源贡献分解 + 相机模型”最接近。** 但汽车三帧、按组控制的现成数据不能替代长时人像、多种独立灯具及非刚体运动。复用其思想时，还需验证曝光期间几何变化与闪烁权重的耦合误差。

来源：[论文](https://library.imaging.org/admin/apis/public/api/ist/website/downloadArticle/ei/38/16/AVM-105)、[代码](https://github.com/AyushJam/iset-lfm)、[数据 DOI 与许可](https://purl.stanford.edu/wd776hn7919)。



## 固定版本的生成代码核查

本轮核对提交 `628720a2e8b68cf17e57ed82feeaa7a073257c58`。这里的 LPD/SPD 指大/小光电二极管，不要把 SPD 与“光谱功率分布”的同名缩写混淆。

| 环节 | 实际入口与行为 |
|---|---|
| 已渲染资产 | 逐场景、逐光源组 EXR，以及曝光/fps 元数据 |
| 示例驱动配置 | `scripts/lf_RunCam_LightCtrl.m`：初始四组权重 `[1,0.09,0.1,4]`，默认调制 other lights；车灯调制段被注释 |
| 时间参数 | 默认占空比 0.1–0.4、频率 90–120 Hz；从元数据读取曝光秒数后乘 1000 转成毫秒 |
| 波形函数 | `get_phi` 计算像素/全局曝光的 PWM 积分，`phi_over_rows` 引入行延迟 |
| 后处理 | 逐帧修改光源组权重后调用相机仿真；该默认入口不能被描述为所有灯都独立随机调制 |

[MATLAB 入口](https://github.com/AyushJam/iset-lfm/blob/628720a2e8b68cf17e57ed82feeaa7a073257c58/scripts/lf_RunCam_LightCtrl.m)、[PWM 模型源码](https://github.com/AyushJam/iset-lfm/blob/628720a2e8b68cf17e57ed82feeaa7a073257c58/flicker_model.py)。

## 公式检查：通过的情况与发现的问题

在不安装渲染器的情况下，对独立数学函数做了解析对照。这里 A=1、offset=0，时间单位为 ms，输出是积分量而非平均亮度：

| 调用 | 实际输出 | 解析期望 |
|---|---:|---:|
| `get_phi(0.3, 10, 10, 1)` | 3 | 3：整周期 |
| `get_phi(0.3, 10, 2, 5)` | 0 | 0：完全漏采 |
| `get_phi(0.3, 10, 2, 2)` | 1 | 1：部分捕获 |
| `get_phi(0.75, 10, 25, 0)` | **305** | **20**：不应超过最大亮度 × 曝光时间 25 |

高占空比且曝光大于两个周期的分支，将 `te - te_effective` 直接作为周期数，遗漏除以 `2*tp`。300 个固定种子、正参数的标量案例中有 55 个不匹配；这项扩展范围检查**不代表论文默认低占空比数据全部错误**。它说明扩大生成参数之前必须修正并重新验证，不能直接照搬实现。

`phi_over_rows(0.3,100,10,1,0.01,4)` 返回 `[3,3,3,3]`，符合完整周期的行相位不变性。`phi_over_frames(0.3,100,2,0,30,1)` 开头为 `[0,2,0,0,2]`，第一个零是填充，MATLAB 入口用 `k+1` 跳过。其展示时间由 linspace 生成，与 1/fps 的实际相位步长不同；导出时要重新建立正确时间戳。

## 复现范围

完成：论文生成段、两份配置/模型源码、独立积分函数对照。未完成：MATLAB/ISETCam/渲染运行、完整数据下载、相机物理标定。

<OriginalReader />
