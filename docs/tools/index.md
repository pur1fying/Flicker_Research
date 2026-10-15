---
{
  "title": "Kubric 能力与流程",
  "updated": "2026-09-16",
  "checkedAt": "2026-09-16",
  "sources": [
    "kubric",
    "blender-motion",
    "blender-passes"
  ]
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


继续阅读：[配置、扩展与边界](extensions.md)。
