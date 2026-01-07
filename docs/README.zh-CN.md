# DEMOCOIN - 算力驱动的算法稳定币

DEMOCOIN 是一个基于以太坊的算法稳定币，通过创新的经济学模型和工作量证明机制实现价格稳定。该系统将基于哈希的工作量证明挖矿与算法价格稳定相结合，创建一个强大的稳定币生态系统。

## 目录

1. [项目概述](#项目概述)
2. [核心设计理念](#核心设计理念)
3. [技术架构](#技术架构)
4. [快速开始](#快速开始)
5. [用户指南](#用户指南)
6. [开发指南](#开发指南)
7. [安全考虑](#安全考虑)
8. [贡献指南](#贡献指南)
9. [许可证](#许可证)

## 语言切换

- [English](../README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

## 项目概述

### 什么是 DEMOCOIN？

DEMOCOIN 是一个算力驱动的算法稳定币，结合了：
- 基于哈希的工作量证明挖矿机制
- 算法价格稳定
- 混合稳定模型（算法 + 抵押）
- 稳定池流动性提供
- 紧急保护机制

### 核心特性

- **算力证明机制**：通过加密谜题验证矿工贡献
- **算法稳定**：基于供需动态调整价格
- **稳定池**：用户可以存入代币提供流动性并获得奖励
- **抵押系统**：150% 超额抵押以增强稳定性
- **紧急模式**：在极端波动期间自动激活
- **治理**：基于角色的参数管理访问控制

## 核心设计理念

### 1. 算力证明机制
- 基于哈希的工作量证明（PoW）系统
- 可调节的难度参数以实现公平的算力验证
- 透明的算力贡献记录和奖励机制

### 2. 算法稳定机制
- 供需平衡调整：基于代币供应和稳定池需求的动态价格调整
- 稳定池：吸收市场波动并提供流动性支持
- 价格调整算法：基于供需比例的渐进式调整

### 3. 经济模型
- 代币发行与算力贡献成正比
- 稳定池奖励机制
- 价格调整与奖励分配的关联机制

## 技术架构

### 智能合约

#### HashProof.sol
**用途**：验证矿工提交的哈希证明并记录算力贡献。

**核心功能**：
- 基于哈希的工作量证明验证
- 可调节的难度参数
- 基于网络算力的自动难度调整
- 证明冷却以防止垃圾提交
- 关键函数的访问控制

**核心函数**：
- `verifyProof()`：验证矿工提交的哈希证明
- `submitHashPower()`：记录有效的算力贡献
- `calculateHashPower()`：基于难度和解质量计算算力
- `adjustDifficulty()`：基于证明率自动调整难度

#### DEMOCOIN.sol
**用途**：实现 ERC20 功能、挖矿奖励和稳定机制的核心稳定币合约。

**核心功能**：
- 带有交易费用的 ERC20 代币实现
- 基于算力的挖矿奖励
- 混合稳定模型（算法 + 抵押）
- 流动性提供的稳定池
- 费用分配的保险基金、开发基金和营销基金
- 紧急模式功能
- 治理的基于角色的访问控制

**核心函数**：
- `mint()`：铸造新代币（仅管理员）
- `claimMiningReward()`：根据算力向矿工分配奖励
- `depositToStablePool()`：允许用户将代币存入稳定池
- `withdrawFromStablePool()`：允许用户从稳定池提取
- `depositCollateral()`：允许用户存入抵押品
- `withdrawCollateral()`：允许用户提取抵押品
- `updatePrice()`：基于供需比例更新代币价格
- `setEmergencyMode()`：激活/停用紧急模式（仅管理员）
- `collectFees()`：收集并将费用分配给基金
- `getTotalSupply()`：返回代币总供应量
- `getStablePoolAPY()`：返回当前稳定池年化收益率
- `isEmergencyMode()`：检查紧急模式是否激活
- `calculateMaxBorrowable()`：基于抵押品计算最大可借金额

### 开发框架

- **Ethereum**：成熟的公共区块链平台
- **Solidity**：智能合约编程语言（v0.8.24）
- **Hardhat**：开发、测试和部署框架（v3.1.2）
- **OpenZeppelin**：安全智能合约库（v5.4.0）
- **React**：前端框架
- **Vite**：前端构建工具
- **TailwindCSS**：CSS 框架
- **Ethers.js**：用于合约交互的 Web3 库

### 项目结构

```
democoin/
├── contracts/              # 智能合约文件
│   ├── HashProof.sol       # 哈希工作量证明合约
│   └── DEMOCOIN.sol        # 核心稳定币合约
├── test/                   # 测试文件
│   └── DEMOCOIN.test.js    # 合约测试用例
├── scripts/                # 部署和管理脚本
│   └── deploy.cjs          # 合约部署脚本
├── frontend/               # 前端应用
│   ├── src/                # 前端源代码
│   │   ├── abi/            # 合约 ABI
│   │   ├── components/     # React 组件
│   │   ├── context/        # React 上下文提供者
│   │   ├── hooks/          # 自定义 React 钩子
│   │   ├── pages/          # React 页面
│   │   └── main.jsx        # 前端入口点
│   ├── package.json        # 前端依赖
│   ├── vite.config.js      # Vite 配置
│   └── tailwind.config.js  # TailwindCSS 配置
├── hardhat.config.js       # Hardhat 配置
├── package.json            # 项目依赖
├── .env.example            # 环境变量示例
└── README.md               # 项目文档
```

## 快速开始

### 前置要求

- Node.js（v16 或更高版本）
- npm 或 yarn 包管理器
- Git 版本控制
- MetaMask 浏览器扩展（用于前端测试）
- 对以太坊、Solidity 和 React 的基本了解

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/democoin.git
cd democoin
```

2. 安装后端依赖：
```bash
# 安装根依赖（用于智能合约）
npm install --legacy-peer-deps
```

3. 编译合约：
```bash
npx hardhat compile
```

4. 运行测试：
```bash
npx hardhat test
```

5. 安装前端依赖：
```bash
# 导航到前端目录
cd frontend

# 安装前端依赖
npm install --legacy-peer-deps

# 返回项目根目录
cd ..
```

### 本地开发

#### 启动本地区块链

```bash
# 启动本地 Hardhat 网络
npx hardhat node
```

#### 部署合约到本地网络

```bash
# 在新终端中，将合约部署到本地网络
npx hardhat run scripts/deploy.cjs --network localhost
```

#### 启动前端开发服务器

```bash
# 导航到前端目录
cd frontend

# 启动 Vite 开发服务器
npm run dev

# 前端将在 http://localhost:5173 可用
```

### 部署

#### 测试网（例如 Sepolia）

**必需的配置元素：**

| 元素 | 描述 | 示例 |
|------|------|------|
| `SEPOLIA_RPC_URL` | Sepolia 测试网 RPC 端点 | `https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY` |
| `PRIVATE_KEY` | 用于部署的以太坊私钥（64 字符十六进制字符串） | `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` |
| `ETHERSCAN_API_KEY` | 用于合约验证的 Etherscan API 密钥 | `ABCDEFGHIJKLMNOPQRSTUVWXYZ123456` |

**操作指南：**

1. **配置环境变量**：
   ```bash
   # 复制模板文件
   cp .env.example .env
   
   # 编辑 .env 文件以添加您的配置
   # 使用文本编辑器如 vim 或 nano
   vim .env
   ```

2. **部署到 Sepolia 测试网**：
   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```

3. **更新前端合约地址**：
   - 从部署输出中复制已部署的合约地址
   - 编辑 `frontend/src/hooks/useContract.jsx` 以更新合约地址

4. **构建生产环境前端**：
   ```bash
   cd frontend
   npm run build
   ```

**注意事项：**
- 永远不要将包含真实私钥的 .env 文件提交到版本控制
- 合约部署需要测试网 ETH，确保账户中有足够的余额
- 建议在部署前在本地网络上测试部署脚本
- 部署后始终在 Etherscan 上验证合约以确保透明度

## 用户指南

### 挖矿指南

#### 概述

DEMOCOIN 使用基于哈希的工作量证明（PoW）机制。矿工通过解决加密谜题生成有效的哈希证明，并根据其算力贡献获得 DEMO 代币奖励。

#### 步骤 1：获取 MINER_ROLE

要挖掘 DEMO，您需要获得合约管理员授予的 MINER_ROLE。联系 DEMOCOIN 团队请求此角色。

#### 步骤 2：生成哈希证明

1. 从网络获取挑战
2. 生成随机数
3. 计算挑战和随机数的哈希
4. 检查哈希是否满足难度要求
5. 重复直到找到有效解决方案

**证明生成代码示例（JavaScript）**：

```javascript
const { ethers } = require('ethers');

async function generateProof(challenge, difficulty) {
    let nonce = 0;
    let solution;
    const target = BigInt(2) ** (256n - BigInt(difficulty));
    
    do {
        solution = ethers.keccak256(ethers.solidityPacked(['bytes32', 'uint256'], [challenge, nonce]));
        nonce++;
    } while (BigInt(solution) >= target);
    
    return {
        challenge: challenge,
        nonce: nonce - 1,
        solution: solution
    };
}
```

#### 步骤 3：提交哈希证明

1. 连接到 HashProof 合约
2. 使用生成的证明调用 `submitHashPower(proof)`
3. 支付 gas 费用
4. 等待交易确认

#### 步骤 4：领取挖矿奖励

1. 连接到 DEMOCOIN 合约
2. 调用 `claimMiningReward()`
3. 支付 gas 费用
4. 等待交易确认
5. 您的 DEMO 奖励将被添加到您的钱包

### 稳定池指南

#### 概述

稳定池允许用户存入 DEMO 代币以提供流动性并稳定代币价格。作为回报，用户根据稳定池年化收益率获得利息。

#### 步骤 1：存入代币

1. 确保您的钱包中有 DEMO 代币
2. 连接到 DEMOCOIN 合约
3. 使用您想存入的 DEMO 数量调用 `depositToStablePool(amount)`
4. 支付 gas 费用
5. 等待交易确认
6. 您将获得与您的存款成比例的稳定池份额

#### 步骤 2：赚取利息

- 利息根据稳定池年化收益率自动累积
- 当前年化收益率：5%
- 利息按区块计算

#### 步骤 3：领取奖励

1. 连接到 DEMOCOIN 合约
2. 调用 `claimStablePoolRewards()`
3. 支付 gas 费用
4. 等待交易确认
5. 您的利息奖励将被添加到您的钱包

#### 步骤 4：提取代币

1. 连接到 DEMOCOIN 合约
2. 使用您想赎回的份额数量调用 `withdrawFromStablePool(shares)`
3. 支付 gas 费用
4. 等待交易确认
5. 您的 DEMO 代币（本金 + 任何未领取的利息）将被返回到您的钱包

### 抵押系统

#### 概述

DEMOCOIN 使用 150% 超额抵押系统以增强稳定性。用户可以存入 DEMO 代币作为抵押品，这有助于在市场波动期间维持代币的价值。

#### 步骤 1：存入抵押品

1. 确保您的钱包中有 DEMO 代币
2. 连接到 DEMOCOIN 合约
3. 使用您想存入的 DEMO 数量调用 `depositCollateral(amount)`
4. 支付 gas 费用
5. 等待交易确认
6. 您将获得与您的存款成比例的抵押份额

#### 步骤 2：提取抵押品

1. 连接到 DEMOCOIN 合约
2. 使用您想赎回的份额数量调用 `withdrawCollateral(shares)`
3. 支付 gas 费用
4. 等待交易确认
5. 您的 DEMO 代币将被返回到您的钱包

**注意**：如果提取会将抵押率降低到 150% 以下或紧急模式激活，则提取受到限制。

## 开发指南

### 经济模型

#### 代币经济学

- **最大供应量**：100,000,000 DEMO
- **初始挖矿奖励率**：每 100 算力每天 100 DEMO
- **奖励减半**：挖矿奖励每年减半
- **交易费用**：每笔交易 0.3%
- **挖矿费用**：挖矿奖励的 0.2%
- **稳定池费用**：稳定池存入/提取的 0.1%

#### 稳定机制

##### 算法调整

- **价格调整**：基于供需比例的渐进式价格变化
- **奖励调整**：基于价格偏离目标的挖矿奖励缩放
- **供应控制**：最大供应上限和年度奖励减半

##### 混合稳定

- **稳定池**：用户存入代币以提供流动性并稳定价格
- **抵押系统**：150% 超额抵押要求
- **保险基金**：累积费用以吸收市场冲击
- **紧急模式**：在极端波动期间激活以暂停关键功能

#### 费用分配

| 费用类型 | 百分比 | 分配 |
|----------|------------|--------------|
| 交易 | 0.3% | 销毁（暂时） |
| 挖矿 | 0.2% | 销毁（暂时） |
| 稳定池 | 0.1% | 销毁（暂时） |

**未来分配计划**：
- 50% 到保险基金
- 30% 到开发基金
- 20% 到营销基金

### 技术流程

#### 挖矿流程

1. 矿工通过解决加密谜题生成哈希证明
2. 矿工将证明提交到 `HashProof.submitHashPower()`
3. 合约验证证明并记录算力贡献
4. 矿工通过 `DEMOCOIN.claimMiningReward()` 领取奖励
5. 合约根据算力和价格调整计算奖励
6. 铸造新代币并分配给矿工
7. 基于新供应更新代币价格

#### 稳定池操作

1. 用户将 DEMO 代币存入 `DEMOCOIN.depositToStablePool()`
2. 合约发行与存款成比例的稳定池份额
3. 用户根据 stablePoolAPY 获得利息
4. 用户通过 `DEMOCOIN.claimStablePoolRewards()` 领取奖励
5. 用户通过 `DEMOCOIN.withdrawFromStablePool()` 提取代币
6. 合约销毁份额并返回代币减去费用

#### 价格更新机制

1. 合约检查价格更新间隔是否已过
2. 如果配置了预言机，获取外部价格数据
3. 否则，基于供需比例计算价格
4. 更新当前价格并发出 PriceUpdated 事件
5. 检查波动阈值是否被突破
6. 如果波动超过阈值则激活紧急模式

### 安全模型

#### 访问控制

- **DEFAULT_ADMIN_ROLE**：最高权限，可以授予/撤销所有角色
- **ADMIN_ROLE**：可以暂停/取消暂停、更新预言机、管理紧急模式
- **GOVERNOR_ROLE**：可以调整经济参数、费用和年化收益率
- **MINER_ROLE**：可以提交哈希证明
- **FEE_COLLECTOR_ROLE**：可以收集累积费用

#### 风险缓解

- **紧急暂停**：可以在极端条件下暂停关键功能
- **紧急模式**：在高波动期间自动激活
- **抵押率**：维持 150% 超额抵押
- **最大供应量**：限制代币总发行量
- **渐进式调整**：将价格变化限制为每次更新 0.5%
- **交易费用**：为保险基金产生收入

#### 安全最佳实践

- 使用 OpenZeppelin 的安全合约库
- 为外部调用实现 ReentrancyGuard
- 验证所有输入和状态
- 为所有关键操作发出事件
- 遵循最小权限原则

### 治理

#### 治理角色

- **DEFAULT_ADMIN_ROLE**：最高权限，可以授予/撤销所有角色
- **ADMIN_ROLE**：可以暂停/取消暂停、更新预言机、管理紧急模式
- **GOVERNOR_ROLE**：可以调整经济参数、费用和年化收益率

#### 治理参数

GOVERNOR_ROLE 可以调整以下参数：

- `transactionFee`：交易费用百分比
- `miningFee`：挖矿费用百分比
- `stablePoolFee`：稳定池费用百分比
- `stablePoolAPY`：稳定池年化收益率
- `miningRewardRate`：挖矿奖励率
- `volatilityThreshold`：紧急模式的波动阈值

### 紧急程序

#### 紧急模式

当代币价格在单个价格更新间隔内变化超过波动阈值（默认：10%）时，紧急模式会自动激活。

#### 紧急模式期间会发生什么？

- 无法领取挖矿奖励
- 稳定池提取被暂停
- 抵押提取被暂停
- 只能调用与紧急相关的功能

#### 退出紧急模式

- 紧急模式在 24 小时后自动结束
- ADMIN_ROLE 可以在持续时间结束后手动结束紧急模式
- DEFAULT_ADMIN_ROLE 可以随时强制结束紧急模式

#### 紧急暂停

ADMIN_ROLE 可以在极端情况下手动暂停合约：

1. 连接到 DEMOCOIN 合约
2. 调用 `pause()`
3. 支付 gas 费用
4. 等待交易确认

要取消暂停：

1. 连接到 DEMOCOIN 合约
2. 调用 `unpause()`
3. 支付 gas 费用
4. 等待交易确认

## 安全考虑

### 安全特性

- 利用 OpenZeppelin 的安全合约库
- 严格的输入验证和访问控制
- 渐进式价格调整以避免波动
- 透明的算力记录和奖励机制
- 极端条件的紧急暂停功能

### 已知限制

- 算法稳定模型可能需要在各种市场条件下进行进一步测试
- 哈希证明机制可能需要针对生产使用进行优化
- 紧急模式参数可能需要根据测试进行调整

### 建议

- 在主网部署前进行全面安全审计
- 在生产部署前在测试网上进行广泛测试
- 考虑实施额外的安全措施，例如：
  - 关键操作的多签名钱包
  - 时间锁定的参数更改
  - 去中心化治理机制
  - 价格预言机的额外数据源

## 贡献指南

我们欢迎对算法稳定币和区块链技术感兴趣的开发者、研究人员和爱好者做出贡献。

### 如何贡献

1. Fork 仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

### 贡献指南

- 遵循现有的代码风格和约定
- 为新功能编写测试
- 根据需要更新文档
- 在提交 PR 之前确保所有测试通过

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件。

## 联系方式

我们欢迎来自不同文化背景的开发者参与这个开源项目！如果您有任何问题、建议或遇到任何问题，请不要犹豫：

- **提交 Issue**：[创建问题](https://github.com/yourusername/democoin/issues) - 我们鼓励您报告错误、请求功能或提出问题
- **发起讨论**：分享您的想法并与社区互动
- **贡献代码**：请参阅上方的[贡献指南](#贡献指南)

无论您的背景或经验水平如何，您的贡献对我们来说都很宝贵。让我们一起构建算法稳定币的未来！

## 免责声明

**本项目按原样提供。作者和贡献者不对使用此代码可能导致的任何财务损失或损害负责。在参与任何加密货币生态系统之前，请始终进行自己的研究并了解风险。**
