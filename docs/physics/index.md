---
{
  "title": "成像链路与快门",
  "updated": "2026-09-16",
  "checkedAt": "2026-09-16",
  "sources": [
    "sony-understanding-flicker",
    "acam-delight",
    "emva-1288",
    "pbrt-spectra"
  ]
}
---

# 真实频闪数据集：成像模型、光源与场景覆盖

调研日期：2026-09-16。本篇中的参数范围、场景组合及测试阈值是**建议的实验设计**，不是某台相机或某类灯具的统一规格。文献事实与自行推导分别标明。

## 1. 三个需要分开的“频率/光谱”

| 名称 | 单位 | 描述 | 影响 |
|---|---|---|---|
| 光学光谱 SPD：S(λ) | 波长 nm；相对或绝对光谱功率 | 红、绿、蓝等波长上发出多少能量 | 光照颜色、材质显色、相机 RGB 响应 |
| 时间调制 q(t) 与其频谱 | Hz、占空比、谐波 | 灯随时间如何明暗变化 | 条带、漏采、帧间闪烁 |
| 相机采样 | fps、秒/行、秒/曝光 | 哪些时间段被哪些像素积分 | 把快变化映射为空间条带或慢拍频 |

**LED 与其他灯的光学光谱不同，不意味着必然产生不同的时间闪烁形态。** 一盏稳定驱动的 LED 可以很平稳；同一灯泡换驱动、调光档位或供电条件，时间波形可能明显变化。DOE 的 TLM 资料说明了驱动、调光、波形、深度与占空比的作用。[DOE 背景](https://www.energy.gov/cmei/ssl/flicker-research)

例如，两种灯若都满足 S(λ,t)=S₀(λ)q(t)，使用相同 q(t)，在静止、线性成像且只有该光源的条件下，其归一化明暗规律可以相同，只是颜色和亮度不同。若不同波长有不同的调制深度、延迟或驱动相位，则会出现颜色随时间变化；这时不能只用一个标量 q(t)。ACam 的分带灯具响应展示了这一区别。[ACam 正文 §2–3](https://www.cs.toronto.edu/~kyros/pubs/17.cvpr.acam.pdf)

**色温 CCT、显色指数 CRI、RGB 色值都不能唯一确定 SPD，也不能确定时间波形。** 要研究同色温不同灯照到不同材质上的差别，应保存光谱数据本身。

## 2. 从光源到像素的完整过程

### 2.1 光源与光传输

对每个发光单元 k，记录发射函数：

```text
E_k(λ, u, ω, t)
```

λ 是波长；u 是发光面位置；ω 是发射方向；t 是时间。它允许同一灯板不同分区、LED 屏不同像素分别变化。

普通灯具可先用可分离近似：

```text
E_k(λ,u,ω,t) = S_k(λ) × P_k(u,ω) × b_k(t) × q_k(t)
mean(q_k over a cycle) = 1
```

b_k 表示应保留的慢速亮度变化；q_k 表示要去掉的快速调制。多通道灯或荧光响应需要扩展为多个光谱基分量：Σ_j S_kj(λ)P_kj(u,ω)b_kj(t)q_kj(t)。

物体表面由反射/透射函数、法线、几何和遮挡共同把发射光变成相机接收的辐亮度 L(p,λ,t)。线性、无荧光的固定场景中，不同光源贡献可相加，且要包括间接反射：

```text
L(p,λ,t) = Σ_k L_k(p,λ,t)
```

这种线性叠加是逐光源缓存的依据；不能在 gamma、饱和、局部色调映射或独立降噪之后再假定它成立。[PBRT 光谱表示](https://pbr-book.org/4ed/Radiometry,_Spectra,_and_Color/Representing_Spectral_Distributions)、[Blender 线性颜色工作流](https://docs.blender.org/manual/en/4.3/render/color_management.html)

### 2.2 快门时间

第 n 帧传感器第 y 行的曝光起始时间，首版可设：

$$
\begin{aligned}
t_{\mathrm{start}}(n,y)&=t_0+\frac{n}{F}+y\,\Delta t_{\mathrm{row}}\\
\tau_{\mathrm{readout}}&=(H_{\mathrm{sensor}}-1)\Delta t_{\mathrm{row}}\\
t_{\mathrm{end}}(n,y)&=t_{\mathrm{start}}(n,y)+T_{\mathrm{exp}}(n,y)
\end{aligned}
$$

- F 是真实帧率，如 30000/1001，而不是把它四舍五入为 30。
- Δt_row 是行延迟；τ_readout 是首末行曝光起点差，**不是曝光时长**。
- T_exp 是每行曝光时长，不等于 1/F。
- 全局快门对应所有行起点相同；它仍可能产生帧间 LED 闪烁。
- 滚动快门的扫描轴在传感器坐标内定义；显示旋转、电子防抖、裁切、缩放之后，方向可能改变。

不要简单规定“读出时间 + 曝光时间必须小于一帧周期”。不同帧和不同行的曝光窗口可能重叠；合法约束应来自具体传感器模式。首版选择一致的普通视频模式，特殊多曝光/交错读出另建配置。

第二轮 [Basler 文档](/sources/basler-shutter)补充了 GRR 情形：行起点相同而终点不同，不能与全局曝光混同。它还提醒我们，传感器**数据读出耗时**和模型中的**首末行曝光起点差**是不同物理量；本篇的 τ_readout 指后者。

### 2.3 光谱、光学与传感器

在一个简化的物理相机模型中，像素的期望电子数与下式成正比：

$$
\mu_e(n,p,c)=\int_{t_{\mathrm{start}}}^{t_{\mathrm{end}}}w(t)
\int_{\lambda} L_{\mathrm{sensor}}(p,\lambda,t)\,QE_c(\lambda)
\frac{\lambda}{h c_{\mathrm{light}}}\,\mathrm{d}\lambda\,\mathrm{d}t
$$

L_sensor 应包含镜头透过率、光圈、像素面积、渐晕及成像几何等作用；QE 是量子效率。w(t) 表示快门权重，多次开关曝光可有多个窗口。

CFA 的滤色响应在光子积分阶段已经参与各像素的选谱。随后模拟光子噪声、暗电流/读出噪声、固定图样、满阱/电子饱和、增益与 ADC、黑电平，再进行 RAW 阵列组织、去马赛克、白平衡/颜色矩阵、色调映射、降噪锐化和视频压缩。具体顺序按目标传感器和 ISP 模式确定，不能把所有退化都当作最后一步添加的高斯噪声。[EMVA 1288 的相机响应定义](https://www.emva.org/standards-technology/emva-1288/emva-standard-1288-downloads-2/)

**Blender 的线性 RGB EXR 不是相机 RAW。** 从 sRGB 逆变换生成的 Bayer 数据也不能恢复已被裁剪的信息，或唯一恢复传感器光谱响应。

## 3. 快门、频率、相位：可校验的解析例子

对静止场景、单光源、矩形曝光和理想正弦：

$$
\begin{aligned}
q(t)&=1+a\cos(2\pi ft+\phi)\\
\bar q(n,y)&=1+a\,\operatorname{sinc}(fT)
\cos\!\left(2\pi f\left[t_{\mathrm{start}}(n,y)+\frac{T}{2}\right]+\phi\right)\\
\operatorname{sinc}(z)&=\frac{\sin(\pi z)}{\pi z},\qquad \operatorname{sinc}(0)=1
\end{aligned}
$$

以下是该模型的数学推导，不是灯具实测：

| 条件 | 结果与意义 |
|---|---|
| f=100 Hz，T=1 ms | 调制幅度保留约 0.9836 倍，短曝光几乎保留全部波动 |
| f=100 Hz，T=10 ms | 恰好积分完整周期，理想静态模型中调制为零 |
| f=100 Hz，τ=15 ms | 首末行经历 1.5 个周期；条带密度由 f×行延迟决定 |
| f=100 Hz，F=30 fps | 固定行跨帧采样出现 10 Hz 混叠分量 |
| f=120 Hz，F=30 fps | 固定行每帧相位相同，可能留下不移动的空间条带 |
| f=120 Hz，F=30000/1001 fps | 拍频约 0.11988 Hz，周期约 8.3417 秒 |

![曝光和采样的解析例子](/figures/shutter_sampling.png)

这说明：

1. 视频看起来“不闪”不代表不存在静态条带。
2. 较高灯频也可能被短曝光和行采样记录，不能单凭频率高就删掉该类样本。
3. PWM 含高次谐波，单一 f 的正弦模型不足；帧间相位应由连续时间推进，不能每帧独立随机。
4. 长曝光包含至少一个周期不等于完全无频闪；周期非整数时仍可能残留。曝光内运动也破坏静态下的精确抵消。
5. 同一观测可以对应多个真实频率。要保存真实生成参数，避免仅凭生成结果反推唯一灯频。


继续阅读：[灯具、光谱与材质](lighting.md)。
