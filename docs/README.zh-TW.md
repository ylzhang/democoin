# DEMOCOIN - 算力驅動的算法穩定幣

DEMOCOIN 是一個基於以太坊的算法穩定幣，通過創新的經濟學模型和工作量證明機制實現價格穩定。該系統將基於哈希的工作量證明挖礦與算法價格穩定相結合，創建一個強大的穩定幣生態系統。

## 目錄

1. [項目概述](#項目概述)
2. [核心設計理念](#核心設計理念)
3. [技術架構](#技術架構)
4. [快速開始](#快速開始)
5. [用戶指南](#用戶指南)
6. [開發指南](#開發指南)
7. [安全考慮](#安全考慮)
8. [貢獻指南](#貢獻指南)
9. [許可證](#許可證)

## 語言切換

- [English](../README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

## 項目概述

### 什麼是 DEMOCOIN？

DEMOCOIN 是一個算力驅動的算法穩定幣，結合了：
- 基於哈希的工作量證明挖礦機制
- 算法價格穩定
- 混合穩定模型（算法 + 抵押）
- 穩定池流動性提供
- 緊急保護機制

### 核心特性

- **算力證明機制**：通過加密謎題驗證礦工貢獻
- **算法穩定**：基於供需動態調整價格
- **穩定池**：用戶可以存入代幣提供流動性並獲得獎勵
- **抵押系統**：150% 超額抵押以增強穩定性
- **緊急模式**：在極端波動期間自動激活
- **治理**：基於角色的參數管理訪問控制

## 核心設計理念

### 1. 算力證明機制
- 基於哈希的工作量證明（PoW）系統
- 可調節的難度參數以實現公平的算力驗證
- 透明的算力貢獻記錄和獎勵機制

### 2. 算法穩定機制
- 供需平衡調整：基於代幣供應和穩定池需求的動態價格調整
- 穩定池：吸收市場波動並提供流動性支持
- 價格調整算法：基於供需比例的漸進式調整

### 3. 經濟模型
- 代幣發行與算力貢獻成正比
- 穩定池獎勵機制
- 價格調整與獎勵分配的關聯機制

## 技術架構

### 智能合約

#### HashProof.sol
**用途**：驗證礦工提交的哈希證明並記錄算力貢獻。

**核心功能**：
- 基於哈希的工作量證明驗證
- 可調節的難度參數
- 基於網絡算力的自動難度調整
- 證明冷卻以防止垃圾提交
- 關鍵函數的訪問控制

**核心函數**：
- `verifyProof()`：驗證礦工提交的哈希證明
- `submitHashPower()`：記錄有效的算力貢獻
- `calculateHashPower()`：基於難度和解質量計算算力
- `adjustDifficulty()`：基於證明率自動調整難度

#### DEMOCOIN.sol
**用途**：實現 ERC20 功能、挖礦獎勵和穩定機制的核心穩定幣合約。

**核心功能**：
- 帶有交易費用的 ERC20 代幣實現
- 基於算力的挖礦獎勵
- 混合穩定模型（算法 + 抵押）
- 流動性提供的穩定池
- 費用分配的保險基金、開發基金和營銷基金
- 緊急模式功能
- 治理的基於角色的訪問控制

**核心函數**：
- `mint()`：鑄造新代幣（僅管理員）
- `claimMiningReward()`：根據算力向礦工分配獎勵
- `depositToStablePool()`：允許用戶將代幣存入穩定池
- `withdrawFromStablePool()`：允許用戶從穩定池提取
- `depositCollateral()`：允許用戶存入抵押品
- `withdrawCollateral()`：允許用戶提取抵押品
- `updatePrice()`：基於供需比例更新代幣價格
- `setEmergencyMode()`：激活/停用緊急模式（僅管理員）
- `collectFees()`：收集並將費用分配給基金
- `getTotalSupply()`：返回代幣總供應量
- `getStablePoolAPY()`：返回當前穩定池年化收益率
- `isEmergencyMode()`：檢查緊急模式是否激活
- `calculateMaxBorrowable()`：基於抵押品計算最大可借金額

### 開發框架

- **Ethereum**：成熟的公共區塊鏈平台
- **Solidity**：智能合約編程語言（v0.8.24）
- **Hardhat**：開發、測試和部署框架（v3.1.2）
- **OpenZeppelin**：安全智能合約庫（v5.4.0）
- **React**：前端框架
- **Vite**：前端構建工具
- **TailwindCSS**：CSS 框架
- **Ethers.js**：用於合約交互的 Web3 庫

### 項目結構

```
democoin/
├── contracts/              # 智能合約文件
│   ├── HashProof.sol       # 哈希工作量證明合約
│   └── DEMOCOIN.sol        # 核心穩定幣合約
├── test/                   # 測試文件
│   └── DEMOCOIN.test.js    # 合約測試用例
├── scripts/                # 部署和管理腳本
│   └── deploy.cjs          # 合約部署腳本
├── frontend/               # 前端應用
│   ├── src/                # 前端源代碼
│   │   ├── abi/            # 合約 ABI
│   │   ├── components/     # React 組件
│   │   ├── context/        # React 上下文提供者
│   │   ├── hooks/          # 自定義 React 鉤子
│   │   ├── pages/          # React 頁面
│   │   └── main.jsx        # 前端入口點
│   ├── package.json        # 前端依賴
│   ├── vite.config.js      # Vite 配置
│   └── tailwind.config.js  # TailwindCSS 配置
├── hardhat.config.js       # Hardhat 配置
├── package.json            # 項目依賴
├── .env.example            # 環境變量示例
└── README.md               # 項目文檔
```

## 快速開始

### 前置要求

- Node.js（v16 或更高版本）
- npm 或 yarn 包管理器
- Git 版本控制
- MetaMask 瀏覽器擴展（用於前端測試）
- 對以太坊、Solidity 和 React 的基本了解

### 安裝

1. 克隆倉庫：
```bash
git clone https://github.com/yourusername/democoin.git
cd democoin
```

2. 安裝後端依賴：
```bash
# 安裝根依賴（用於智能合約）
npm install --legacy-peer-deps
```

3. 編譯合約：
```bash
npx hardhat compile
```

4. 運行測試：
```bash
npx hardhat test
```

5. 安裝前端依賴：
```bash
# 導航到前端目錄
cd frontend

# 安裝前端依賴
npm install --legacy-peer-deps

# 返回項目根目錄
cd ..
```

### 本地開發

#### 啟動本地区塊鏈

```bash
# 啟動本地 Hardhat 網絡
npx hardhat node
```

#### 部署合約到本地網絡

```bash
# 在新終端中，將合約部署到本地網絡
npx hardhat run scripts/deploy.cjs --network localhost
```

#### 啟動前端開發服務器

```bash
# 導航到前端目錄
cd frontend

# 啟動 Vite 開發服務器
npm run dev

# 前端將在 http://localhost:5173 可用
```

### 部署

#### 測試網（例如 Sepolia）

**必需的配置元素：**

| 元素 | 描述 | 示例 |
|------|------|------|
| `SEPOLIA_RPC_URL` | Sepolia 測試網 RPC 端點 | `https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY` |
| `PRIVATE_KEY` | 用於部署的以太坊私鑰（64 字符十六進制字符串） | `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` |
| `ETHERSCAN_API_KEY` | 用於合約驗證的 Etherscan API 密鑰 | `ABCDEFGHIJKLMNOPQRSTUVWXYZ123456` |

**操作指南：**

1. **配置環境變量**：
   ```bash
   # 複製模板文件
   cp .env.example .env
   
   # 編輯 .env 文件以添加您的配置
   # 使用文本編輯器如 vim 或 nano
   vim .env
   ```

2. **部署到 Sepolia 測試網**：
   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```

3. **更新前端合約地址**：
   - 從部署輸出中複製已部署的合約地址
   - 編輯 `frontend/src/hooks/useContract.jsx` 以更新合約地址

4. **構建生產環境前端**：
   ```bash
   cd frontend
   npm run build
   ```

**注意事項：**
- 永遠不要將包含真實私鑰的 .env 文件提交到版本控制
- 合約部署需要測試網 ETH，確保賬戶中有足夠的餘額
- 建議在部署前在本地網絡上測試部署腳本
- 部署後始終在 Etherscan 上驗證合約以確保透明度

## 用戶指南

### 挖礦指南

#### 概述

DEMOCOIN 使用基於哈希的工作量證明（PoW）機制。礦工通過解決加密謎題生成有效的哈希證明，並根據其算力貢獻獲得 DEMO 代幣獎勵。

#### 步驟 1：獲取 MINER_ROLE

要挖掘 DEMO，您需要獲得合約管理員授予的 MINER_ROLE。聯繫 DEMOCOIN 團隊請求此角色。

#### 步驟 2：生成哈希證明

1. 從網絡獲取挑戰
2. 生成隨機數
3. 計算挑戰和隨機數的哈希
4. 檢查哈希是否滿足難度要求
5. 重複直到找到有效解決方案

**證明生成代碼示例（JavaScript）**：

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

#### 步驟 3：提交哈希證明

1. 連接到 HashProof 合約
2. 使用生成的證明調用 `submitHashPower(proof)`
3. 支付 gas 費用
4. 等待交易確認

#### 步驟 4：領取挖礦獎勵

1. 連接到 DEMOCOIN 合約
2. 調用 `claimMiningReward()`
3. 支付 gas 費用
4. 等待交易確認
5. 您的 DEMO 獎勵將被添加到您的錢包

### 穩定池指南

#### 概述

穩定池允許用戶存入 DEMO 代幣以提供流動性並穩定代幣價格。作為回報，用戶根據穩定池年化收益率獲得利息。

#### 步驟 1：存入代幣

1. 確保您的錢包中有 DEMO 代幣
2. 連接到 DEMOCOIN 合約
3. 使用您想存入的 DEMO 數量調用 `depositToStablePool(amount)`
4. 支付 gas 費用
5. 等待交易確認
6. 您將獲得與您的存款成比例的穩定池份額

#### 步驟 2：賺取利息

- 利息根據穩定池年化收益率自動累積
- 當前年化收益率：5%
- 利息按區塊計算

#### 步驟 3：領取獎勵

1. 連接到 DEMOCOIN 合約
2. 調用 `claimStablePoolRewards()`
3. 支付 gas 費用
4. 等待交易確認
5. 您的利息獎勵將被添加到您的錢包

#### 步驟 4：提取代幣

1. 連接到 DEMOCOIN 合約
2. 使用您想贖回的份額數量調用 `withdrawFromStablePool(shares)`
3. 支付 gas 費用
4. 等待交易確認
5. 您的 DEMO 代幣（本金 + 任何未領取的利息）將被返回到您的錢包

### 抵押系統

#### 概述

DEMOCOIN 使用 150% 超額抵押系統以增強穩定性。用戶可以存入 DEMO 代幣作為抵押品，這有助於在市場波動期間維持代幣的價值。

#### 步驟 1：存入抵押品

1. 確保您的錢包中有 DEMO 代幣
2. 連接到 DEMOCOIN 合約
3. 使用您想存入的 DEMO 數量調用 `depositCollateral(amount)`
4. 支付 gas 費用
5. 等待交易確認
6. 您將獲得與您的存款成比例的抵押份額

#### 步驟 2：提取抵押品

1. 連接到 DEMOCOIN 合約
2. 使用您想贖回的份額數量調用 `withdrawCollateral(shares)`
3. 支付 gas 費用
4. 等待交易確認
5. 您的 DEMO 代幣將被返回到您的錢包

**注意**：如果提取會將抵押率降低到 150% 以下或緊急模式激活，則提取受到限制。

## 開發指南

### 經濟模型

#### 代幣經濟學

- **最大供應量**：100,000,000 DEMO
- **初始挖礦獎勵率**：每 100 算力每天 100 DEMO
- **獎勵減半**：挖礦獎勵每年減半
- **交易費用**：每筆交易 0.3%
- **挖礦費用**：挖礦獎勵的 0.2%
- **穩定池費用**：穩定池存入/提取的 0.1%

#### 穩定機制

##### 算法調整

- **價格調整**：基於供需比例的漸進式價格變化
- **獎勵調整**：基於價格偏離目標的挖礦獎勵縮放
- **供應控制**：最大供應上限和年度獎勵減半

##### 混合穩定

- **穩定池**：用戶存入代幣以提供流動性並穩定價格
- **抵押系統**：150% 超額抵押要求
- **保險基金**：累積費用以吸收市場衝擊
- **緊急模式**：在極端波動期間激活以暫停關鍵功能

#### 費用分配

| 費用類型 | 百分比 | 分配 |
|----------|------------|--------------|
| 交易 | 0.3% | 銷毀（暫時） |
| 挖礦 | 0.2% | 銷毀（暫時） |
| 穩定池 | 0.1% | 銷毀（暫時） |

**未來分配計劃**：
- 50% 到保險基金
- 30% 到開發基金
- 20% 到營銷基金

### 技術流程

#### 挖礦流程

1. 礦工通過解決加密謎題生成哈希證明
2. 礦工將證明提交到 `HashProof.submitHashPower()`
3. 合約驗證證明並記錄算力貢獻
4. 礦工通過 `DEMOCOIN.claimMiningReward()` 領取獎勵
5. 合約根據算力和價格調整計算獎勵
6. 鑄造新代幣並分配給礦工
7. 基於新供應更新代幣價格

#### 穩定池操作

1. 用戶將 DEMO 代幣存入 `DEMOCOIN.depositToStablePool()`
2. 合約發行與存款成比例的穩定池份額
3. 用戶根據 stablePoolAPY 獲得利息
4. 用戶通過 `DEMOCOIN.claimStablePoolRewards()` 領取獎勵
5. 用戶通過 `DEMOCOIN.withdrawFromStablePool()` 提取代幣
6. 合約銷毀份額並返回代幣減去費用

#### 價格更新機制

1. 合約檢查價格更新間隔是否已過
2. 如果配置了預言機，獲取外部價格數據
3. 否則，基於供需比例計算價格
4. 更新當前價格並發出 PriceUpdated 事件
5. 檢查波動閾值是否被突破
6. 如果波動超過閾值則激活緊急模式

### 安全模型

#### 訪問控制

- **DEFAULT_ADMIN_ROLE**：最高權限，可以授予/撤銷所有角色
- **ADMIN_ROLE**：可以暫停/取消暫停、更新預言機、管理緊急模式
- **GOVERNOR_ROLE**：可以調整經濟參數、費用和年化收益率
- **MINER_ROLE**：可以提交哈希證明
- **FEE_COLLECTOR_ROLE**：可以收集累積費用

#### 風險緩解

- **緊急暫停**：可以在極端條件下暫停關鍵功能
- **緊急模式**：在高波動期間自動激活
- **抵押率**：維持 150% 超額抵押
- **最大供應量**：限制代幣總發行量
- **漸進式調整**：將價格變化限制為每次更新 0.5%
- **交易費用**：為保險基金產生收入

#### 安全最佳實踐

- 使用 OpenZeppelin 的安全合約庫
- 為外部調用實現 ReentrancyGuard
- 驗證所有輸入和狀態
- 為所有關鍵操作發出事件
- 遵循最小權限原則

### 治理

#### 治理角色

- **DEFAULT_ADMIN_ROLE**：最高權限，可以授予/撤銷所有角色
- **ADMIN_ROLE**：可以暫停/取消暫停、更新預言機、管理緊急模式
- **GOVERNOR_ROLE**：可以調整經濟參數、費用和年化收益率

#### 治理參數

GOVERNOR_ROLE 可以調整以下參數：

- `transactionFee`：交易費用百分比
- `miningFee`：挖礦費用百分比
- `stablePoolFee`：穩定池費用百分比
- `stablePoolAPY`：穩定池年化收益率
- `miningRewardRate`：挖礦獎勵率
- `volatilityThreshold`：緊急模式的波動閾值

### 緊急程序

#### 緊急模式

當代幣價格在單個價格更新間隔內變化超過波動閾值（默認：10%）時，緊急模式會自動激活。

#### 緊急模式期間會發生什麼？

- 無法領取挖礦獎勵
- 穩定池提取被暫停
- 抵押提取被暫停
- 只能調用與緊急相關的功能

#### 退出緊急模式

- 緊急模式在 24 小時後自動結束
- ADMIN_ROLE 可以在持續時間結束後手動結束緊急模式
- DEFAULT_ADMIN_ROLE 可以隨時強制結束緊急模式

#### 緊急暫停

ADMIN_ROLE 可以在極端情況下手動暫停合約：

1. 連接到 DEMOCOIN 合約
2. 調用 `pause()`
3. 支付 gas 費用
4. 等待交易確認

要取消暫停：

1. 連接到 DEMOCOIN 合約
2. 調用 `unpause()`
3. 支付 gas 費用
4. 等待交易確認

## 安全考慮

### 安全特性

- 利用 OpenZeppelin 的安全合約庫
- 嚴格的輸入驗證和訪問控制
- 漸進式價格調整以避免波動
- 透明的算力記錄和獎勵機制
- 極端條件的緊急暫停功能

### 已知限制

- 算法穩定模型可能需要在各種市場條件下進行進一步測試
- 哈希證明機制可能需要針對生產使用進行優化
- 緊急模式參數可能需要根據測試進行調整

### 建議

- 在主網部署前進行全面安全審計
- 在生產部署前在測試網上進行廣泛測試
- 考慮實施額外的安全措施，例如：
  - 關鍵操作的多簽名錢包
  - 時間鎖定的參數更改
  - 去中心化治理機制
  - 價格預言機的額外數據源

## 貢獻指南

我們歡迎對算法穩定幣和區塊鏈技術感興趣的開發者、研究人員和愛好者做出貢獻。

### 如何貢獻

1. Fork 倉庫
2. 創建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打開 Pull Request

### 貢獻指南

- 遵循現有的代碼風格和約定
- 為新功能編寫測試
- 根據需要更新文檔
- 在提交 PR 之前確保所有測試通過

## 許可證

本項目採用 MIT 許可證 - 詳見 LICENSE 文件。

## 聯繫方式

我們歡迎來自不同文化背景的開發者參與這個開源項目！如果您有任何問題、建議或遇到任何問題，請不要猶豫：

- **提交 Issue**：[創建問題](https://github.com/yourusername/democoin/issues) - 我們鼓勵您報告錯誤、請求功能或提出問題
- **發起討論**：分享您的想法並與社區互動
- **貢獻代碼**：請參閱上方的[貢獻指南](#貢獻指南)

無論您的背景或經驗水平如何，您的貢獻對我們來說都很寶貴。讓我們一起構建算法穩定幣的未來！

## 免責聲明

**本項目按原樣提供。作者和貢獻者不對使用此代碼可能導致的任何財務損失或損害負責。在參與任何加密貨幣生態系統之前，請始終進行自己的研究並了解風險。**
