---
{
  "title": "Kubric 是否满足需求：源码级 pipeline 审计",
  "updated": "2026-09-16",
  "archived": true,
  "search": false
}
---

# Kubric 是否满足需求：源码级 pipeline 审计

调研日期：2026-09-16。审计仓库：[google-research/kubric](https://github.com/google-research/kubric)。本轮实际下载并阅读的提交：

```text
61f2422c84bab75006df33c6989e0b483db3ccfe
提交时间：2026-05-21
提交说明：Blender v4_3 fixes for Kubric renderer. (#355)
```

下文源码链接固定到该提交，避免 main 后续变化导致结论失效。本轮进行了**静态源码/官方文档核对**，未安装运行 Kubric/Blender 渲染任务，也未验证目标 GPU 上的兼容性和吞吐。文中的调用示例说明预期行为，不是本轮执行日志。

## 1. 结论与能力矩阵

**Kubric 可以作为数据集的场景、运动和标注组织框架，但不能开箱即用地生成你要求的全部物理频闪数据。** 大规模 RGB 近似需要扩展曝光和灯具模型；严格光谱实验需要额外光谱光传输后端。

| 需求 | 当前能力 | 需要做什么 |
|---|---|---|
| 多物体、场景、随机资产 | 原生支持 | 自定义贴近真实拍摄的场景分布 |
| 多个点光/面光/聚光/平行光 | 原生基本支持 | 灯数由 worker 创建数量决定，没有自动的灯具类别库 |
| RGB 颜色、强度、位置动画 | 原生字段和关键帧支持 | 绑定灯具波形和连续时间求值 |
| LED/荧光/卤素/钠灯发光机理 | **没有原生灯具技术模型** | 自建型号/驱动/波形库，映射到光源几何和能量 |
| 光学 SPD 与随时间变化的光谱 | **默认 RGB 路径不支持严格模拟** | 光谱后端或经过验证的近似 |
| 金属、玻璃、粗糙度、高光 | 原生 Principled 材质覆盖一部分 | 更复杂材质通过 Blender 节点或导入资产 |
| 真实皮肤/头发/衣物非刚体运动 | 部分可通过 Blender 实现 | 自定义资产、动画/仿真与标签，不是默认 PyBullet 流程 |
| 阴影、间接反射、透射 | Cycles 能计算常规 RGB 光传输 | 合理设置反弹数、采样、焦散等，并做收敛验证 |
| 灯光独立贡献图 | 无完整 Kubric 高层接口 | 使用 Cycles Light Groups 并扩展导出，或逐灯重渲染 |
| 曝光时间、ISO、逐行读出 | **Kubric 相机类没有这些字段** | 自定义相机时序与传感器层 |
| 逐行曝光 × 灯强时间积分 | **默认 render 不提供** | 子帧/事件分段积分 |
| 运动模糊 | 有一个矢量模糊便利参数 | 不可用来代替光源/快门积分 |
| 非整数帧率，如 29.97 | Scene/ArgumentParser 只接收整数 fps | 用独立有理数时间轴，或系统性扩展映射 |
| RAW、QE、满阱、噪声、ISP | **不是当前核心能力** | 接入自定义传感器/ISP 或 ISETCam |
| 深度、分割、光流 | 原生有参考时刻标签 | 曝光混合/滚动快门后需重新定义有效性 |

## 2. Kubric 的架构：Scene + Asset + View

Kubric 用 Scene 保存资产和公共配置。渲染器 Blender 与物理模拟器 PyBullet 都是 View：它们观察同一场景，把资产转换成各自的内部对象，并监听属性变化。

例子：

```python
scene = kb.Scene(frame_rate=30, step_rate=240, resolution=(640, 360))
renderer = Blender(scene, scratch_dir="scratch/example")
lamp = kb.PointLight(name="key", position=(2, -2, 3), intensity=20.0)
scene.add(lamp)
lamp.intensity = 10.0
```

预期状态：scene 中增加一个灯；Blender View 创建 POINT 光源；最后一行把 Blender 灯的 `energy` 更新为 10。灯光不作为会碰撞的实体参加 PyBullet 物理运动。

底层转换对象可通过 `lamp.linked_objects[renderer]` 取得。它是扩展 Blender 属性的桥梁，但绕过 Kubric 修改的属性不会自动进入 Kubric 的标准元数据。

来源：[Scene.add](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/scene.py#L135)、[View.add](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/view.py#L61)、[点光转换](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L569)。

## 3. 默认构建 pipeline，逐步拆解

以 `challenges/movi/movi_def_worker.py` 为实际样例；它是物体视频生成流程，不是现成的频闪 worker。

### 阶段 1：解析配置、建立随机源与目录

入口是 `kb.ArgumentParser`、`kb.setup` 和 `Scene.from_flags`。默认项包括帧率、仿真步频、帧范围、分辨率、种子和输出目录。

```python
parser = kb.ArgumentParser()
flags = parser.parse_args(["--seed", "123", "--frame_rate", "30",
                          "--step_rate", "240", "--resolution", "640x360"])
scene, rng, output_dir, scratch_dir = kb.setup(flags)
```

结果：得到配置场景、随机源、输出和临时目录；后续数组是 `(帧数, 360, 640, 通道数)`。帮助文本的高宽表述与核心的 `(width,height)` 约定容易混淆，应用非方图测试明确验证。

频闪配置应在独立 worker 中通过 `parser.add_argument(...)` 或外部配置加载新增。直接调用 `parser.set_defaults(exposure_time=0.001)` 会因参数未定义而触发断言；先定义参数再设默认值才有效。

**种子缺陷：**`setup` 使用 `flags.seed if flags.seed else ...`，所以 `--seed 0` 会走随机种子分支。先使用非零种子，正式实现改成 `is not None` 判断。渲染采样 RNG、资产划分 RNG、噪声 RNG 也需分别记录。

来源：[ArgumentParser 与 setup](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/utils.py#L43)、[Scene.from_flags](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/scene.py#L172)。

### 阶段 2：建立渲染器和模拟器

```python
simulator = PyBullet(scene, scratch_dir)
renderer = Blender(scene, scratch_dir, samples_per_pixel=64,
                   use_denoising=False, motion_blur=None)
```

结果：两套 View 与同一 Scene 关联。Blender 初始化选择 Cycles、设置 Filmic 视图、建立输出节点和辅助 pass。这里给出的关闭降噪/矢量模糊配置适合先验证线性成像，64 samples 只是示例，不是收敛保证。

来源：[MOVi 初始化](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/challenges/movi/movi_def_worker.py#L72)、[Blender 初始化](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L102)。

### 阶段 3：资产加载与拆分

```python
source = kb.AssetSource.from_manifest("path/to/manifest.json")
train_ids, test_ids = source.get_test_split(fraction=0.1)
obj = source.create(asset_id=train_ids[0])
scene.add(obj)
```

结果：读取清单，获取训练/测试资产 ID，实例化并加入一个物体。`create` 可读取本地或远程资产；错误 ID 会报 KeyError，若存在相近 ID 还会给出建议。

`get_test_split` 内部使用固定 RNG 42 生成资产划分；它只处理该资产库的 ID，**不会自动防止相同场景、轨迹、灯具及退化变体泄漏到不同集合**。应把实际 split 清单落盘。

来源：[AssetSource](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/assets/asset_source.py#L63)、[create](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/assets/asset_source.py#L167)、[划分](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/assets/asset_source.py#L243)。

### 阶段 4：背景与环境光

MOVi 样例载入 HDRI，调用 `renderer._set_ambient_light_hdri(...)`，并将 HDRI 贴到 dome 模型上。

```python
renderer._set_ambient_light_hdri("room.exr", strength=0.5)
```

结果：该 HDRI 成为环境照明，强度为 0.5。方法名以下划线开头，是内部接口，使用时应锁定版本。

**HDRI 的亮斑不是独立灯具记录。** 把整张 HDRI 亮度一起变化会同时调制窗户、天空和所有反射方向；如果要独立控制棚灯、顶灯、窗光，必须拆出显式光源或有依据的分解。背景可见颜色和真正照明也可能走不同节点，要检查两者的一致性。

来源：[MOVi 环境设置](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/challenges/movi/movi_def_worker.py#L86)、[环境节点](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L703)。

### 阶段 5：相机几何

```python
camera = kb.PerspectiveCamera(position=(0, -6, 2), focal_length=50,
                              sensor_width=36, look_at=(0, 0, 1))
scene.add(camera)
```

结果：加入透视相机，设置位置、方向、焦距及传感器宽度。常规光学几何会映射到 Blender 相机。

该类没有曝光秒数、读出秒数、ISO、CFA、QE 或噪声模型。添加同名 Python 属性也不会自动产生物理效果，必须有对应采样和传感器实现。

**非整数 fps：**Scene 的 `frame_rate` 和 `step_rate` 都是整数，并要求整除。`Scene(frame_rate=30, step_rate=240)` 有效；`frame_rate=29.97` 不符合字段类型；`frame_rate=30, step_rate=241` 不符合整除约束。推荐把视频时间保存为有理数并与几何动画时间显式换算。

来源：[相机类](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/cameras.py#L71)、[Scene 类型和校验](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/scene.py#L49)。

### 阶段 6：物体位置、材质与运动初始化

默认 MOVi 加载静态/动态物体，随机尺寸、位置、速度和物理属性，先让静态物体落稳，再加入动态物体。可以用物理仿真，也可以手工关键帧。

```python
obj.position = (0, 0, 1)
obj.keyframe_insert("position", 1)
obj.position = (1, 0, 1)
obj.keyframe_insert("position", 31)
```

结果：记录两个位置关键帧，传播到渲染 View。调用 `obj.get_value_at("position", 16)` 默认线性求值得到约 `(0.5,0,1)`；`keyframe_insert("not_a_trait", 1)` 会报 KeyError。

注意 Kubric 的插值与 Blender F-curve 插值不是同一实现，当前转发器没有统一设置 F-curve 插值。物理轨迹、渲染轨迹和导出的元数据应在中间时刻交叉验证；不能仅验证整数帧端点。

来源：[关键帧与插值](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/core/assets.py#L85)、[Blender 关键帧转发](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L806)。

### 阶段 7：物理模拟 → 运动关键帧

```python
animation, collisions = simulator.run(frame_start=0, frame_end=33)
```

结果：得到各对象的位置/旋转/速度序列和碰撞事件，并把运动写回资产关键帧。

**关键限制：**内部每个物理 step 都推进仿真，但只在 `current_step % steps_per_frame == 0` 时保存状态。把 `step_rate` 从 240 提到 2400，只提升了模拟步频，默认导出的关键帧仍按视频 fps 保存。

因此快速运动频闪需要：导出更密的真实物理状态，或对已烘焙/解析轨迹做充分验证的子帧求值。只在稀疏端点间插值，可能错过碰撞和遮挡事件。

来源：[PyBullet.run](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/simulator/pybullet.py#L221)。

### 阶段 8：逐帧渲染

```python
data = renderer.render(frames=[1, 2, 3], return_layers=("rgba", "depth"))
```

结果：在清洁的独立 scratch 目录内，预期返回 3 帧 RGBA 与 depth 数组。内部对每个整数帧调用 `frame_set(frame_nr)`，输出 PNG 和多层 EXR，然后汇总。

默认没有遍历行曝光、计算灯光积分，也没有子帧时间参数。后处理扫描 scratch 中的 EXR，重复渲染时若混入旧文件可能得到错误帧集合，因此每条序列/采样作业应隔离 scratch，并显式管理样本索引。

来源：[Blender.render](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L286)、[postprocess](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L343)。

### 阶段 9：通道后处理

EXR 解码能读取 `linear_rgba`，但默认 `rgba` 实际来自经过显示变换的 PNG。`rgb` 也是该 PNG 的前三个通道。

原生调用 `renderer.render(return_layers=("linear_rgba",))` 会因该名字未注册到 `post_processors` 而报 KeyError。可显式扩展：

```python
renderer.post_processors["linear_rgba"] = lambda layers, scene: layers["linear_rgba"]
data = renderer.render(return_layers=("linear_rgba",))
```

结果：扩展后可返回 EXR 中的浮点 RGBA，允许亮度大于 1；仍须检查预乘 alpha、色彩空间、EXR 精度与是否启用了矢量模糊。

来源：[EXR 解码](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender_utils.py#L220)、[默认通道表](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender.py#L123)、[RGB 后处理](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/renderer/blender_utils.py#L472)。

### 阶段 10：标注整理、文件保存、元数据

MOVi 接着统计可见性、重映射实例 ID、计算包围框，调用 `kb.write_image_dict(data_stack, output_dir)`，输出相机/场景/实例 metadata 与碰撞 events。

例：`kb.write_image_dict({"rgba": rgba_array}, "output/scene001")` 按已注册 writer 写出彩色帧；但传入新字段 `linear_rgba` 会因未注册 writer 而失败。浮点 PNG writer 只接受 [0,1]：全 0.5 浮点图有效，全 2.0 图报 ValueError。线性 HDR 应另存 EXR/浮点数组。

`kb.get_scene_metadata(scene)` 返回分辨率、fps、step_rate、重力和帧数等；`kb.get_camera_info(camera)` 返回几何参数和轨迹。自定义灯具、曝光、噪声、ISP、光谱信息需要显式加入元数据。

来源：[MOVi 后处理](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/challenges/movi/movi_def_worker.py#L291)、[writer 注册表](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/file_io.py#L310)、[metadata](https://github.com/google-research/kubric/blob/61f2422c84bab75006df33c6989e0b483db3ccfe/kubric/utils.py#L132)。

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

回到：[调研总览](index.md)。
