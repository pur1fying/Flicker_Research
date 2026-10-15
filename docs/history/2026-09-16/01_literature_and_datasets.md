---
{
  "title": "去频闪论文与数据资源调查",
  "updated": "2026-09-16",
  "archived": true,
  "search": false
}
---

# 去频闪论文与数据资源调查

调研日期：2026-09-16。范围：**数据集、退化生成、采集真值和成像机理**；本轮不设计或训练网络。

## 1. 检索范围与证据等级

检索覆盖 flicker removal / deflickering / flicker-banding / rolling-shutter banding / LED flicker mitigation / burst flicker / exposure bracketing / temporal light modulation，以及中文“去频闪、频闪数据集、滚动快门、灯光频闪”。检索了 arXiv、CVF、NeurIPS/OpenReview、ECVA、IEEE/SPIE/IS&T、作者项目页和 GitHub，并从关键论文反向追踪参考文献。

“所有”在这里落实为**尽可能全面、可追溯的范围检索**，无法保证覆盖未公开数据、未被索引的论文及付费全文中的全部实验资源。下列内容不把搜索摘要当作全文，也不把一个论文中的“首个”说法推广到所有频闪任务。

- **A：**已读相关全文、关键图表或生成代码；表中说明具体依据。
- **B：**核对作者/出版方的项目页、摘要或数据入口，未完成全文核验。
- **线索：**发现书目但尚缺可核验的主要内容，单列，不据此得出技术结论。
- **公开入口：**只表示页面提供下载入口；除特别注明外，本轮没有下载整个图像/视频数据集，文件数量和完整性没有逐项验收。

## 2. 先分清六种不同任务

| 类别 | 频闪来源 | 与本项目的关系 |
|---|---|---|
| 场景照明频闪 | 灯光时间调制 × 快门曝光；照到人、衣物、墙面和反射表面 | **核心任务** |
| 直接发光体频闪 | 车灯、交通灯等 LED 本体在短曝光中漏采 | 重要扩展；需同时表现发光体与其反射 |
| 屏幕重拍条带 | 显示扫描、PWM、局部调光、子像素排列 × 相机扫描 | 独立子域；不能直接等同于房间照明频闪 |
| 曝光/颜色不稳定 | 自动曝光、自动白平衡、时间流逝中的亮度漂移 | 可作为独立干扰项，标签应区别于灯具调制 |
| 老电影/逐帧算法闪烁 | 胶片老化、印片、修复或生成算法的帧间不一致 | 相关对照，不是光源物理分布的主要依据 |
| 事件相机频闪 | 光照变化触发大量异步事件 | 可借鉴高频测量，但不能直接当 RGB 配对视频训练集 |

还应排除：Flickr8k/30k 的图文数据、“flicker test”主观压缩质量数据、显示器对人眼的闪烁评价、普通图像量化色带、单纯摩尔纹。它们的名字相似，但监督目标不同。

## 3. 直接相关的数据与合成方法

### D01 — DeflickerCycleGAN / DFCG，TIP 2023【A：代码；B：论文摘要】

- 对象：单张 RGB 图像中的照明/滚动快门频闪。
- 作者仓库提供合成脚本：逐行余弦分量复制到二维，再按三个通道不同幅度加到图像，示例分辨率 256×256。
- 官方脚本包含机器路径、缩进及变量大小写问题；可作为建模线索，不能直接当成已可复现的数据生成包。本轮未发现完整原始数据包入口，不声称其数据规模。
- **对本项目的判断：**颜色通道幅度有区分，但没有三维光传输、灯具空间分布和曝光内运动；同一余弦叠加无法覆盖所需多灯反射场景。

来源：[官方仓库](https://github.com/YChenL/DFCG)、[生成脚本](https://github.com/YChenL/DFCG/blob/main/Dataset/synthesize_data.py)、[论文](https://ieeexplore.ieee.org/document/10006737)。

### D02 — BurstDeflicker，NeurIPS 2025【A：全文、采集图；B：公开数据入口】

| 子集 | 论文报告 | 真值与生成方式 |
|---|---|---|
| Synthetic | 基于室内图像的可生成数据 | Retinex 模型；稳定环境光与频闪光混合，改变波形、相位和通道幅度 |
| BurstDeflicker-S | 369 个场景、每组 10 连拍；正文另报告约 4,000 张 | 静态场景短曝光 1/1000–1/2000 秒；长曝光 1/50 或 1/60 秒参考，配合 ISO 调整 |
| BurstDeflicker-G | 3,690 张带运动图像 | 将 VideoMatte240K 人物前景合成到真实频闪/干净背景上 |

论文报告按 8:2 划分；代码有 Kaggle 入口。**369×10 与 4,000 的计数口径并不完全一致，采购/整理数据时应实查文件清单。**

该工作的关键启发是保留频闪灯的平均照明，而非删除整盏灯的贡献。局限是绿幕前景没有自动获得与背景相同的三维闪烁照明、投影和镜面反射，短长曝光也改变噪声条件。本项目应针对这些差距补充数据。

来源：[论文 PDF，§3、图 5](https://proceedings.neurips.cc/paper_files/paper/2025/file/4e60c211b3aec6cf8e4866893931efa6-Paper-Datasets_and_Benchmarks_Track.pdf)、[官方代码与数据入口](https://github.com/qulishen/BurstDeflicker)。

### D03 — Flickerformer，CVPR 2026【A：全文；B：仓库】

使用 BurstDeflicker 进行多帧频闪恢复，并讨论周期性与方向性。**应计为方法论文，而不是重复计算成一个新数据集。** 它表明仅用通用图像质量分数不足以表达条带结构和多帧错位问题；本轮不展开网络架构。

来源：[论文](https://arxiv.org/abs/2603.22794)、[官方仓库](https://github.com/qulishen/Flickerformer)。

### D04 — RIFLE，2025 起的预印本【A：v4 正文；B：仓库】

- 对象：屏幕重拍的单图频闪条带。
- 合成在亮度域构造条带角度、间距、宽度、边缘过渡与噪声；底图来自 LSDIR/UHDM。
- **本轮读取的 v4**：5 类场景，105 对 4096×3072 图像；提取 424 对 512×512 屏幕区域评估块。短长曝光拍摄并配准。
- 其他论文引用的旧版本规模为 60 对，不能与 v4 混用。
- 仓库下载区仍为 **TBD**，不能列为已下载可用数据。

判断：适合比较屏幕条带形态；并不提供真实人物表面多灯照明的物理真值。

来源：[v4 正文 §4.1.2、§5.1](https://arxiv.org/html/2509.24644v4)、[官方仓库](https://github.com/libozhu03/RIFLE)。

### D05 — MIRAGE / CLEAR，2026 预印本【A：全文与表 1；B：项目页】

- 约 3,000 对屏幕重拍图像：频闪、摩尔纹、二者混合各约 1,000 对；每类按 930/20/50 分训练/验证/测试。
- 5 部手机，LCD/LED/OLED 三类显示技术；内容覆盖自然图像、文档、网页、卡通、游戏和界面。
- 参考来自原始显示内容经配准；额外合成经过逆 ISP、伪 RAW 条带处理、正向 ISP。
- 项目页的数据按钮为 **Coming Soon**；代码链接存在，但本轮未取得可用数据下载包。

判断：联合退化是重要补充；逆 ISP 所得伪 RAW 不能等同于已知光谱与传感器响应生成的 RAW。屏幕子域应单独评估。

来源：[论文](https://arxiv.org/abs/2602.01559)、[作者项目页](https://libozhu03.github.io/CLEAR/)。

### D06 — DeViD / VDFP，2026 预印本【A：全文；B：仓库】

- 108 段内容：60 段取自已有视频数据、48 段另行收集，播放到 LED 显示矩阵后重拍。
- 处理空间、时间和颜色对齐；训练合成通过时空退化场构造条带。
- 正文说明硬件覆盖主要是 LED 矩阵。这里“多场景”主要指屏幕播放内容，不等于在多种实体房间灯光下拍摄人物。
- 仓库下载区为 **TBD**。

来源：[论文 §4 和局限](https://arxiv.org/html/2605.21079v2)、[官方仓库](https://github.com/ZhiyiZZhou/VDFP)。

### D07 — Bricker / BRACE，2026-06 预印本【A：全文；B：仓库】

- 数据单位：**5 帧多曝光 Bayer RAW + 1 张 GT**。
- 合成：1,000 训练 / 100 测试；真实：250 训练 / 40 测试。
- 虚拟屏幕姿态、相机扫描与显示驱动决定逐像素时间响应；随后加入退化、逆 ISP 和噪声。真实采集使用自动化 Android 拍摄工具及长曝光低 ISO 参考。
- 仓库下载区为 **TODO**，论文的“available”表述尚不能作为下载已可用的证据。

判断：曝光差异和显示分区/颜色驱动值得借鉴；射线与屏幕求交并不自动覆盖完整房间的多次反射、人物材质或真正光谱传输。

来源：[论文 §3.2、实验设置](https://arxiv.org/html/2606.29845)、[官方仓库](https://github.com/ZZH-qwq/BRACE)。

### D08 — ISET-LFM，Electronic Imaging 2026【A：全文与流程图；B：数据存储页】

- 200 个汽车场景，逐组保存车灯、路灯、环境和其他光源的辐射贡献。
- 每组短曝光 3–5 ms、长曝光 11.11 ms，各 3 帧；场景包含 20–50 m/s 自车运动设置。
- 结合 ISET3D/PBRT 光谱渲染与 ISETCam 光学/传感器/ISP；支持渲染前调光或渲染后光源组加权。
- Stanford 数据记录有公开入口，数据许可为 ODC-By 1.0；代码许可与数据许可应分别记录。

判断：**与本项目“光源贡献分解 + 相机模型”最接近。** 但汽车三帧、按组控制的现成数据不能替代长时人像、多种独立灯具及非刚体运动。复用其思想时，还需验证曝光期间几何变化与闪烁权重的耦合误差。

来源：[论文](https://library.imaging.org/admin/apis/public/api/ist/website/downloadArticle/ei/38/16/AVM-105)、[代码](https://github.com/AyushJam/iset-lfm)、[数据 DOI 与许可](https://purl.stanford.edu/wd776hn7919)。

### D09 — DELIGHT / ACam，CVPR 2017【A：正文和补充材料；B：数据入口】

DELIGHT 是**灯具时间响应数据库**，不是配对去闪视频。它包括多种 LED、荧光灯/CFL、卤素、高压钠灯、汞灯和金卤灯；补充材料记录灯泡/灯具型号及测量方式。同一灯管换灯具也有不同记录，部分灯有颜色分带响应。

作者区分完整的波长—时间响应与经过测量器件加权的响应；后者不能无条件移植到任意相机。项目页提供 ZIP 链接；测量主要基于 50 Hz / 220 V，不能自动代表当前所有 PWM 灯具。

**这是本项目补充真实灯光波形最值得检查的资源。**

来源：[项目页](https://www.dgp.toronto.edu/ACam/)、[正文](https://www.cs.toronto.edu/~kyros/pubs/17.cvpr.acam.pdf)、[补充材料与灯具表](https://webee.technion.ac.il/Sites/People/yoav/publications/supplement_ACam_docCVPR.pdf)。

### D10 — Event Flicker Removal，ICRA 2022【B：作者仓库】

提供荧光照明下的事件频闪数据及梳状滤波实现，有公开 Drive 入口；仓库注明 academic use only。数据是异步事件流，适合研究调制时间结构或测量系统，不能直接当成普通 RGB 干净/频闪帧对。

来源：[官方仓库](https://github.com/ziweiWWANG/EFR)、[论文](https://arxiv.org/abs/2205.08090)。

### D11 — Blind Video Deflickering Dataset，CVPR 2023【A：全文；B：数据入口】

论文统计：老电影 20、老动画 10、慢动作 10、延时 10、逐帧处理视频 157、合成视频 90，共 **297 个条目**。真实视频一般没有干净 GT，合成视频来自稳定视频施加退化。

适合覆盖此前实际修复的通用问题，但不能从这些条目推断灯频、读出时间、真实光谱或材质参数。它的来源混杂，应作为额外真实测试集合的一部分。

来源：[论文 §4](https://arxiv.org/abs/2303.08120)、[作者仓库](https://github.com/ChenyangLEI/All-In-One-Deflicker)、[作者提供的数据镜像](https://huggingface.co/datasets/xrenaa/Blind-Video-Deflickering-Dataset)。

### D12 — BlazeBVD 的合成与评估数据，ECCV 2024【A：全文】

沿用 DAVIS/MS-COCO 及 Blind Deflickering Dataset，训练退化包含按空间低分辨率生成并放大的变化场、持续若干帧的扰动。属于通用视频光度变化基线，**不是一个新的可标定灯具物理数据集**。

来源：[论文 §5.1](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/02526.pdf)。

### D13 — LFISTA / 去闪与去斑，WACV 2024【A：全文】

实验集合 D1 为 10 段老电影，D2 为 4 段 150–190 fps 视频，D3 为 41 段含斑点和频闪的网络视频。它们用于混合退化评估，无统一灯光物理配对真值。本轮没有将这些历史链接全部下载验证。

来源：[论文 §4.1](https://openaccess.thecvf.com/content/WACV2024/papers/Fulari_Unsupervised_Model-Based_Learning_for_Simultaneous_Video_Deflickering_and_Deblotching_WACV_2024_paper.pdf)。

### D14 — SRGAN-PBAFT，PLOS ONE 2025【A：全文数据段】

论文使用 Middlebury/NYU2 等底图，并报告一个 300 图像的室内合成集合。但 §3.1 的实际文字描述是基于深度、散射系数和大气光的**雾图合成**，与灯具时间调制的频闪模型并不一致。因此本轮把它列为检索到但数据机制存在疑点的工作，**不将其作为可用的物理频闪数据依据**。页面的 Data Availability 声明也不等于提供独立原始频闪帧对。

来源：[出版方全文](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0317758)。

## 4. 其他必须知道的论文脉络

以下以数据和建模价值为主，不展开网络结构。

| 年份 / 工作 | 核验层级 | 为什么相关 / 边界 |
|---|---|---|
| 2006，Delon：Movie and video scale-time equalization | B：[作者论文](https://doi.org/10.1109/TIP.2005.860328) | 经典全局光度稳定；不是滚动快门多灯模拟 |
| 2006，Pitié 等：Localised deflicker of moving images | B：[作者项目](https://francois.pitie.net/deflicker/) | 运动补偿与局部亮度校正，解释为何场景运动不能被直接当作闪烁 |
| 2007，Tajbakhsh、Grigat：Illumination flicker correction and frequency classification methods | B：[大学出版记录](https://tore.tuhh.de/entities/publication/9972596e-2a16-4eeb-a7cc-4eac3d57c201) | 早期频率识别与校正；没有核实到独立公开训练集 |
| 2011，Farbman、Lischinski：Tonal Stabilization of Video | B：[作者项目与原视频](https://pages.cs.huji.ac.il/danix-lab/cglab/projects/tonestab/) | 自动曝光/色温等相机调整引起的波动，应与灯具调制分标签 |
| 2013，Kim 等：Reducing flicker due to ambient illumination in camera captured images | B：书目由 BurstDeflicker 引文核对，[出版 DOI](https://doi.org/10.1117/12.2008271) | 场景照明滚动条带；未取得完整可复现数据 |
| 2014，Yoo 等：Flicker removal for CMOS wide dynamic range imaging based on alternating current component analysis | B：[出版页](https://ieeexplore.ieee.org/document/6937311) | 短长曝光 WDR 去闪脉络；不能以长曝光 GT 代表相同运动模糊 |
| 2017，Kanj 等：Flicker removal and superpixel-based motion tracking for high speed videos | B：[会议记录](https://www2.securecms.com/ICIP2017/Papers/ViewPapers.asp?PaperNum=2448) | 高帧率与运动下的周期亮度变化；后续论文复用其片段 |
| 2018，Wong 等：Invisible geo-location signature in a single image | B：[作者论文入口](https://ncsu-wong.org/docs/2018_ICASSP.pdf)，摘要及后续引用核对 | 电网频率/逐行模型的来源；原任务是取证地理定位，不是恢复干净图像 |
| 2018，Deegan：LED flicker: Root cause, impact and measurement for automotive imaging applications | B：[作者大学记录](https://research.universityofgalway.ie/en/publications/led-flicker-root-cause-impact-and-measurement-for-automotive-imag-4/) | 直接发光体漏采、曝光和测量指标 |
| 2018，Behmann 等：Selective LED Flicker Detection and Mitigation Algorithm for Non-HDR Video Sequences | B：[作者单位书目](https://www.ims.uni-hannover.de/en/forschung/fachgebiet-architekturen-und-systeme/architectures-and-systems-group-publications)；ISET-LFM 正文回溯 | ISET-LFM 将其列为 Blender 合成频闪与检测掩码的先前工作；本轮未取得原生成代码/数据，不补写参数 |
| ICECS 2018，Behmann、Blume：Real-Time LED Flicker Detection and Mitigation: Architecture and FPGA-Implementation | B：[作者单位记录](https://research.uni-hannover.de/de/publications/real-time-led-flicker-detection-and-mitigation-architecture-and-f/) | 同一技术脉络的硬件实现；会议年与出版记录年可不同，未发现独立公开数据包 |
| 2019，Vatansever 等：Factors Affecting ENF based Time-of-Recording Estimation for Video | B：[作者海报](https://sigport.org/sites/default/files/docs/ICASSP_Poster_v6.pdf) | 相机、光源、场景对时间信号的影响；不是去闪配对数据 |
| 2020，Deegan：LED flicker measurement…IEEE P2020 working group | A：[全文](https://library.imaging.org/admin/apis/public/api/ist/website/downloadArticle/ei/32/16/art00001) | 强调曝光、相位、脉宽和评测方法；人眼指标不能替代相机指标 |
| 2020，Automotive 3.0 µm Pixel High Dynamic Range Sensor with LED Flicker Mitigation | B：[Sensors 正文入口](https://www.mdpi.com/1424-8220/20/5/1390) | 多曝光/传感器硬件路径；可用于制定 RAW/HDR 子集需求 |
| 2021，Realtime flicker removal for fast video streaming and detection of moving objects | B：[出版方](https://link.springer.com/article/10.1007/s11042-020-10385-8) | 高帧率运动检测应用；不同于短 burst 到单图的评估 |
| 2022，Flicker: A review of temporal light modulation stimulus, responses, and measures | A：[DOE 提供全文](https://www.energy.gov/cmei/ssl/articles/flicker-review-temporal-light-modulation-stimulus-responses-and-measures) | 灯驱动、波形、调制深度、占空比和度量的背景；不把健康阈值用于判定相机无频闪 |
| 2025，Assessment of spatially resolved temporal light modulation in extended scenes by fast imaging measurements | B：[出版 DOI](https://doi.org/10.1088/1361-6501/ada1eb)、[MetTLM 项目结果](https://www.vsl.nl/en/mettlm/results/) | 空间分辨 TLM 测量线索，可补充“整个场景一个波形”的局限；本轮未取得全文 |
| Measurement of temporal light modulation using a hyperspectral camera | B：[出版方摘要](https://doi.org/10.1088/1361-6501/ae16c7) | 波长—时间响应测量线索；未核实独立数据包，不主张已具备可直接导入的光谱时间库 |

**进一步线索：**“Efficient On-Device Flicker Removal in High FPS Videos with Synthetic Data Generation”，Haritas 等，HiPCW 2025，DOI `10.1109/HiPCW66559.2025.00087`。本轮发现该书目，但出版全文未能取得，未核实其数据是否公开；因此不以二手摘要补写算法或数据参数。

通用视频一致性研究常研究逐帧图像算法引入的闪烁，相关脉络见 [All-In-One-Deflicker 的相关工作部分](https://arxiv.org/abs/2303.08120)。本轮将这类工作保留为检索分支，未把它们统计成真实灯光数据集。

## 5. 构建真实场景所需的上游数据

| 资源 | 提供什么 | 使用边界 |
|---|---|---|
| [DELIGHT](https://www.dgp.toronto.edu/ACam/) | 灯具时间波形、部分分色响应 | 已经过测量器件加权；不能当成完整的光谱—时间辐射函数 |
| [MetTLM waveform set 1 / 项目资料](https://www.vsl.nl/en/mettlm/results/)、[公开报告](https://zenodo.org/records/7844492) | 用于 TLM 计算验证的离散数学波形及不确定度研究 | 适合测试积分和指标代码；数学基准波形不等于商品灯实测分布 |
| [CIE LED 光谱](https://cie.co.at/datatable/relative-spectral-power-distributions-illuminants-representing-typical-led-lamps) | 典型 LED 的相对光谱功率分布，CSV | **没有时间波形**；平均光谱与调光状态要另行配对 |
| [CIE 数据目录](https://www.cie.co.at/data-tables) | 荧光灯、日光、视觉响应等标准数据 | 标准光谱不是特定商品灯具的实测记录 |
| [Camera Spectral Sensitivity Database](https://www.gujinwei.org/research/camspec/db.html) | 28 款相机，400–720 nm、10 nm 间隔的 RGB 相对敏感度 | 各通道独立归一化，不能直接当绝对量子效率；许可为 BY-NC-SA 4.0 |
| [MERL BRDF](https://www.merl.com/research/downloads/BRDF/) | 100 种实测材质的方向反射函数 | 用于反射方向/粗糙度；不能把 RGB BRDF 当完整光谱反射率 |
| [RGL 光谱材质库](https://rgl.epfl.ch/publications/Dupuy2018Adaptive) | 光谱、各向同性/异性反射测量 | 比普通 PBR 颜色更适合验证灯光光谱 × 材质；需相应渲染适配 |
| [Poly Haven](https://polyhaven.com/) | HDRI、PBR 纹理、模型 | 资源 CC0；HDRI 是整张照明环境，不能自动拆出独立灯具波形 |
| [Kubric/GSO 等资产入口](https://github.com/google-research/kubric) | 物体、碰撞几何、相机/运动组织 | 扫描纹理可能带烘焙光照；普通掉落物体不能代表人像非刚体运动 |
| [EMVA 1288](https://www.emva.org/standards-technology/emva-1288/emva-standard-1288/) | 传感器响应、噪声、增益、饱和等测量定义 | 是相机标定规范，不是一个现成的频闪数据集 |

## 6. 对本项目的结论

1. **最直接的数据参考：BurstDeflicker；最直接的物理生成参考：ISET-LFM；最直接的灯具波形参考：DELIGHT。** 三者解决不同环节，需要组合使用。
2. RIFLE、MIRAGE、DeViD 和 Bricker 主要覆盖屏幕重拍。它们展示的斜线、菱形、断裂、彩色条带不能一概套到普通均匀灯光照射场景。
3. 有价值的补充空间是：**可复现的多灯驱动组、真实材质反射、曝光期间动态、同一时序下的稳定照明真值，以及独立真实拍摄验证。** 是否构成论文创新仍需实验和完整新颖性比较。
4. 真实长短曝光配对、绿幕合成、图像条带叠加、三维光传输，各有不同误差；数据集应保存生成方式与近似等级，不能混成一个未加说明的“真实 GT”。
5. 发布前应分别记录底图、人物、材质、HDRI、波形、相机响应和最终数据的许可；这是决定数据能否共享的实际条件。

下一篇：[物理成像模型与数据覆盖设计](02_physical_model_and_coverage.md)。

补充：[索尼官方资料及其对应数据条件](04_sony_official_findings.md)。
