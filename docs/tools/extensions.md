---
{
  "title": "配置、扩展与边界",
  "updated": "2026-09-16",
  "checkedAt": "2026-09-16",
  "sources": [
    "kubric",
    "blender-motion",
    "blender-passes",
    "blender-color",
    "mitsuba",
    "iset-lfm"
  ]
}
---

# 配置、扩展与边界

::: warning 第二轮代码核验
新查阅的 [Cycles 开发者单位文档](/sources/blender-units)明确给出 RGB/光谱边界。另对 [ISET-LFM](/sources/iset-lfm)发现了扩大占空比/曝光范围后会触发的积分代码问题；其生成思想与代码可直接复用程度必须分开评价。
:::

## 4. 各项需求在哪里配置

### 4.1 灯光数量、形状、颜色、强度

类定义在 [`core/lights.py`](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/lights.py#L27)，映射在 [`renderer/blender.py:519–580`](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L519)。

| 需求 | 原生字段/入口 | 例子与结果 |
|---|---|---|
| 灯具数量 | 多次创建并加入 Scene | `scene.add([key, fill, rim])` 加入三盏灯 |
| RGB 颜色 | `Light.color` | `key.color=(1.0,0.6,0.3)` 改变灯的 RGB 发射颜色；数值需按线性颜色工作流解释 |
| 强度 | `Light.intensity` → Blender `energy` | 从 20 改成 10，改变光源能量参数；并非自动模拟电驱动 |
| 聚光角度 | `SpotLight.spot_size/spot_blend` | 改小 spot_size，缩小照射锥角 |
| 面光尺寸 | `RectAreaLight.width/height` | 控制面光尺寸，但必须检查下面的形状问题 |
| 位置方向 | `position/quaternion/look_at` | 移动灯或改变朝向，改变阴影和高光 |
| 颜色/强度动画 | `keyframe_insert` | `key.keyframe_insert("intensity",10)` 记录第 10 帧灯强；不会自动细分曝光时间 |

**矩形面光问题：**构造器创建 `AREA` 并绑定 `size`/`size_y`，未设置 `shape="RECTANGLE"`。Blender 4.3 的默认形状是 SQUARE，`size_y` 针对矩形形状才有意义。源码和 API 共同支持这一静态结论。[AreaLight API](https://docs.blender.org/api/4.3/bpy.types.AreaLight.html)

```python
key = kb.RectAreaLight(width=1.2, height=0.4, intensity=20)
scene.add(key)
key.linked_objects[renderer].data.shape = "RECTANGLE"
```

预期状态：底层光源显式变成矩形，横纵尺寸分别受 1.2 与 0.4 控制。正式 worker 中应把这些直接设置写入配置与元数据。

另有两个“字段存在但没有完整映射”的例子：

- `DirectionalLight.shadow_softness` 有定义，但该提交的 SUN 转换没有绑定到角直径属性；需要直接设置底层 `data.angle` 并验证。
- `PrincipledBSDFMaterial.transmission_roughness` 有定义，但当前材质转换没有对应写入。不能只看到字段就认定渲染会改变。

### 4.2 LED/荧光/卤素等类型

Kubric 的 Point/Spot/Area/Sun 是**发光几何类型**，不是 LED/荧光等发光技术类型。一个 LED 面板可以用面光或发光网格近似几何；是否闪烁、颜色是否随时间变化，仍需要灯具模型。

建议独立配置：

```yaml
# 拟议项目配置；这些不是 Kubric 已存在的参数。
light_id: key_01
technology: phosphor_white_led
geometry: rectangle
size_m: [1.2, 0.4]
driver_id: measured_driver_A_dim25
modulation_group: group_A
waveform: measured
waveform_uri: measured_lights/driver_A_dim25.csv
phase_seconds: 0.0017
spectrum_uri: measured_lights/lamp_A_spd.csv
mean_radiant_power_w: 20.0
```

实现分工：Kubric/Blender 负责位置、尺寸和空间传播；新建灯具模块在给定物理时间返回非负强度和颜色/光谱分量。把 `technology="led"` 写进 metadata 本身不会改变图像。

可见的灯管、灯泡或屏幕需要发光几何。单独的灯光对象不等于完整灯具外观；若同时使用照明灯与发光网格，要防止重复计算能量。

### 4.3 材质与反射

[`core/materials.py`](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/materials.py#L31) 提供 color、metallic、roughness、specular、ior、transmission、emission 等。映射在 [`blender.py:622`](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L622)。

```python
metal = kb.PrincipledBSDFMaterial(metallic=1.0, roughness=0.15,
                                color=(0.7,0.7,0.7,1.0))
obj.material = metal
```

预期结果：物体使用带金属镜面响应的材质，粗糙度 0.15。它是 RGB 参数化材质，并非某种金属的实测光谱复折射率。

自定义皮肤、毛发、各向异性织物、涂层和纹理网络需要 Blender Shader Nodes 或导入现成材质；`UndefinedMaterial` 可用于让 Kubric 不接管已存在的材质。`FlatMaterial` 本质上绕过正常表面着色，不应作为“所有物体材质”来测试灯光反射。

仓库已有 [`challenges/complex_brdf`](https://github.com/google-research/kubric/tree/61f2422c84bab75006df33c6989e0b483db3ccfe/challenges/complex_brdf)，展示多灯、强反射材质与多次反弹的生成思路，可参考其场景组织；它没有频闪时间模型。

### 4.4 子帧、曝光与滚动快门

Blender 底层支持子帧求值：

```python
renderer.blender_scene.frame_set(12, subframe=0.25)
```

预期状态：场景求值到第 12.25 动画帧。**接着调用 Kubric 的 `render_still(frame=12)` 会重新设置整数帧，不能保留刚设的子帧。** 需要自定义渲染循环，独立命名每个时间样本，并在该时刻设置灯具输出后调用底层渲染。[Scene.frame_set API](https://docs.blender.org/api/4.3/bpy.types.Scene.html#bpy.types.Scene.frame_set)

建议分成：

1. 时间轴：从 fps、帧号、传感器行和曝光算出绝对秒数。
2. 轨迹求值：秒数映射到物体/相机/灯的几何状态。
3. 辐射求值：得到该时刻、各独立灯分量的线性响应。
4. 积分器：对每一行的时间窗口累计相应样本；分别生成频闪输入与平均光源 GT。

Blender 原生的 Motion Blur 面板有 shutter、rolling shutter 等设置，但其 duration 参数不是可直接填毫秒的物理读出时间；官方文档还明确指出运动模糊不计入灯光运动。不能据此假定动画灯强会按每条光线的时间正确积分。[官方 Motion Blur 文档](https://docs.blender.org/manual/en/4.3/render/cycles/render_settings/motion_blur.html)

Kubric 的 `Blender(..., motion_blur=0.5)` 更是另一条路径：创建 `CompositorNodeVecBlur`，在图像/深度/光流之后做矢量模糊。它不能替代上面四步。[对应源码](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender_utils.py#L114)

### 4.5 逐光源贡献与缓存

Cycles 的 Light Groups 提供分组照明 pass，可独立调整某一组灯的贡献。[官方说明](https://docs.blender.org/manual/en/4.3/render/layers/passes.html)

Kubric 当前 EXR 导出只注册固定 Image、Depth 和辅助通道，需要：

- 在 Blender 场景中建立按独立灯具/驱动分量划分的 Light Groups；把灯、环境或发光网格分到正确组。
- 把相应 Render Layers 输出接到 EXR 输出节点。
- 扩展 EXR 读取和 writer，使其保存所有 group 的浮点通道。
- 验证组贡献之和与全灯线性图一致；确认发光网格、环境、间接反射都没有漏分或重复计数。

备用路线是每个时间状态依次只开一个光源，其余设为零，重复渲染。逻辑简单但成本更高。两条路线都必须在组合前避免独立非线性降噪/裁剪。

当光谱或颜色本身随时间变化时，还需足够细的光谱/颜色基分解。单一白灯贡献图不能严格推断任意新 SPD 照射各种真实材质的结果。

### 4.6 导入真实场景与人物

`Blender(custom_scene="room.blend")` 可以载入预制场景，但文档明确指出：这些对象仅影响渲染，不自动参与 Kubric 模拟器。初始化还会重建环境着色和合成器输出节点，因此需要在初始化后检查/恢复自定义设置。

`FileBasedObject` 支持多种格式。对于 GLB，默认 JOIN 路径可能破坏动画；源码提供 `use_parenting_instead_of_join=True` 以保留组织关系，但非动画碰撞网格仍不能自动准确描述人物形变。

例：导入一个抬手人物，即使 Blender 能渲染手臂动画，也必须验证该手臂是否进入正确实例标签、遮挡和运动对应；不能用静态碰撞网格代表所有动画时刻。

来源：[custom_scene 的边界](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L88)、[GLB 处理](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L440)、[动画资产说明](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/objects.py#L289)。

## 5. 光谱层的实际边界

Kubric 的 Light 使用 RGB，Principled 材质使用 RGB/RGBA；该路径没有 S(λ)、材质反射谱或传感器 QE 的接口。改变白平衡、OCIO 色彩空间或 Blackbody RGB 颜色并不会把它变成光谱渲染。

可选路线：

| 路线 | 能获得什么 | 代价/限制 |
|---|---|---|
| Kubric + RGB Cycles + 实测 RGB 时间响应 | 多灯、阴影、常规反射及彩色频闪的有效近似 | 不能严格验证同色温不同 SPD 的材质显色差异 |
| Kubric 场景/轨迹 + 自建 Mitsuba 光谱 View/导出器 | 光谱光传输和可指定传感器响应 | 没有现成一键桥接；资产/材质/坐标/标签需重建适配，曝光时序仍要写 |
| ISET3D/PBRT + ISETCam | 光谱、光学、传感器和 ISP 的研究路径 | MATLAB/工具箱/资产准备；现成汽车数据不等于人像场景生成器 |
| 分波段多次 RGB/单色近似 | 在受限材质和自定义参数下探索光谱积分 | 需要自行定义每波段材质，色散/荧光/偏振等仍有边界；不能未经验证标成严格光谱真值 |

来源：[Mitsuba 变体说明](https://mitsuba.readthedocs.io/en/latest/src/key_topics/variants.html)、[Mitsuba 传感器](https://mitsuba.readthedocs.io/en/latest/src/generated/plugins_sensors.html)、[ISET-LFM](https://github.com/AyushJam/iset-lfm)。

结论：若要求只是可靠合成人像视频可见的频闪，扩展后的 Kubric RGB 路线有价值；若要求不同灯的**真实发射谱 × 真实材质谱 × 相机谱响应**，仅用原生 Kubric 不满足需求。

## 6. 建议增加的项目模块

以下是职责设计，文件尚未实现，不是 Kubric 原生结构。

| 模块 | 职责 | 与现有位置的连接 |
|---|---|---|
| `workers/flicker_worker.py` | 按 split/seed 组织一次样本生成 | 参考 MOVi worker，不直接修改其通用任务定义 |
| `lights/library.py` | 灯具、驱动、SPD/波形资源与来源 | 输出 Kubric Light 的几何/基础颜色配置 |
| `lights/waveforms.py` | 正弦、PWM、实测波形、时间/颜色分量 | 在物理时间返回输出，并提供平均值/积分 |
| `camera/timeline.py` | 有理数 fps、行延迟、曝光窗口、扫描映射 | 替代直接依赖整数 frame_nr 作为物理时间 |
| `motion/trajectory.py` | 稠密状态、人物动画、子帧求值 | 扩展 PyBullet 状态导出或导入烘焙动画 |
| `render/linear_passes.py` | 独立灯组、EXR、子帧路径、渲染参数 | Blender View 与 compositor/export 扩展 |
| `render/exposure_integrator.py` | 每行曝光积分、稳定照明反事实 GT | 在线性/光谱域工作，输出前不做显示变换 |
| `camera/sensor_isp.py` | 噪声、CFA、饱和、色彩/ISP 配置 | 独立于 Kubric 常规相机几何 |
| `dataset/export.py` | 浮点信号、元数据、缩略预览、清单 | 扩展现有 writer，支持流式写出 |
| `dataset/validate.py` | 能量、解析曝光、采样收敛与标签一致性 | 独立生成质量报告，标记失败样本 |

示意流程：

```text
split/资产/灯具配置
        ↓
构建 Scene 与真实尺度几何
        ↓
生成并冻结运动轨迹 + 连续时间驱动
        ↓
计算各帧、各行曝光窗口
        ↓
子帧线性/光谱光传输，保存独立光源贡献
        ↓
共同时间积分器
   ├─ 原始调制 → 频闪输入
   └─ 平均光源 → 干净真值
        ↓
相机/噪声/ISP 变体 + 明确时间定义的辅助标签
        ↓
验证、清单、浮点主数据与显示预览
```

## 7. 标注与性能方面容易忽略的问题

### 标注时间不一致

原生 depth、flow、segmentation 对应参考时刻渲染。一个运动边缘在曝光中覆盖两个物体时，单一整数实例 ID 或单一光流未必有明确物理意义。应明确选用：曝光中点标签、逐子帧标签、按曝光权重的占比标签，或有效区掩码。

光流还须保存方向、坐标分量顺序、像素单位和编码范围。当前 EXR 解码把 Blender Vector 的通道转换为 `(delta_row, delta_col)`；导出 PNG 的 flow 又可能归一化到整数范围并写 data_ranges。读取者不能假设它就是通常的 `(dx,dy)` 浮点流。

### 渲染噪声不是灯光频闪

低采样、高光火花、焦散、逐帧降噪不一致可能产生额外闪烁。优先在高质量小场景上验证收敛，再决定大规模样本的采样数和降噪策略。不能让模型主要学习去渲染噪声，却称为真实灯光频闪恢复。

### 内存、存储与缓存

默认渲染后 `np.stack` 汇总整段视频。1920×1080 的一帧 RGB float32 约 24.9 MB；300 帧约 7.46 GB，仅一个 RGB 流就达到该量级。再乘输入/GT/光源组/子帧，很快超过内存和存储预算。

正式生成应按时间块流式累积、及时写出；静态几何可以复用贡献图，动态几何按误差需要缓存子帧。主数据用无损浮点存储，观看预览另编码。缓存键包括场景、轨迹、材质、灯几何/光谱基、渲染设置与版本，不能只按 scene_id。

## 8. 版本与运行环境

当前提交包含 Blender 4.3 修复，但仓库 Docker 构建文件仍引用 `blender-v2.93-release` 和较老 Python 环境。**源码提交、Dockerfile 和某个 latest 镜像不是同一个版本证据。** 应选定已匹配的 Blender/Python/Kubric 组合并锁定镜像 digest 或安装版本。

来源：[本次提交](https://github.com/google-research/kubric/commit/61f2422c84bab75006df33c6989e0b483db3ccfe)、[Blender Dockerfile](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/docker/Blender.Dockerfile#L48)、[安装文档](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/docs/source/0_installing.rst)。

对这台 Windows 工作环境，后续可评估 Linux/WSL2/容器方式，但本轮没有安装或验证。需要的运行验收包括：GPU 渲染、线性 EXR、矩形灯、材质节点、子帧求值、光源组输出、单序列重复生成和非整数视频时间映射。

## 9. 实施优先级与满足程度

**P0：先让成像正确。** 独立时间轴、灯具非负波形、EXR 浮点链路、同曝光 GT、单灯解析与多灯能量检查。

**P1：覆盖真实空间与动态。** 灯组、材质、反射/阴影、稠密运动、人物动画、数据拆分与流式导出。

**P2：提高相机与光谱真实性。** 标定噪声/ISP、实际 QE、波长—时间灯具响应、光谱验证子集。

目前结论是“**有明确扩展路径的部分满足**”。不能把一个 MOVi worker 加灯光强度随机数称为已经满足需求；也不能因为 Kubric 默认无光谱就否定其场景组织和 RGB 数据生成价值。

回到：[调研总览](/overview)。
