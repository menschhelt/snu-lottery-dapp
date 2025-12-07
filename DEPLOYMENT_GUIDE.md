# 🎰 블록체인 복권 DApp - 배포 가이드

이 가이드는 블록체인 복권 DApp을 Sepolia 테스트넷에 배포하고 실행하는 전체 과정을 설명합니다.

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [MetaMask 설정](#2-metamask-설정)
3. [Sepolia ETH 받기](#3-sepolia-eth-받기)
4. [Chainlink VRF 구독 생성](#4-chainlink-vrf-구독-생성)
5. [스마트 컨트랙트 배포 (Remix IDE)](#5-스마트-컨트랙트-배포-remix-ide)
6. [프론트엔드 실행](#6-프론트엔드-실행)
7. [테스트 방법](#7-테스트-방법)
8. [Vercel 배포](#8-vercel-배포)
9. [환경변수 설정](#9-환경변수-설정)
10. [프로덕션 체크리스트](#10-프로덕션-체크리스트)
11. [CI/CD 설정](#11-cicd-설정-github-actions)

---

## 1. 사전 준비

### 필요한 것들
- **Chrome 브라우저** (MetaMask 사용을 위해)
- **MetaMask 확장 프로그램** 설치
- **Node.js** (v18 이상) - 프론트엔드 실행용
- **인터넷 연결**

### 설치 확인
```bash
# Node.js 버전 확인
node --version  # v18.0.0 이상이어야 함

# npm 버전 확인
npm --version
```

---

## 2. MetaMask 설정

### 2.1 MetaMask 설치
1. Chrome 웹스토어에서 MetaMask 검색
2. "Chrome에 추가" 클릭
3. 새 지갑 생성 또는 기존 지갑 복구
4. **비밀 복구 구문을 안전하게 보관하세요!**

### 2.2 Sepolia 테스트넷 추가
MetaMask는 기본적으로 Sepolia를 지원합니다:
1. MetaMask 열기
2. 상단의 네트워크 드롭다운 클릭
3. "네트워크 표시" 클릭
4. "테스트 네트워크 표시" 활성화
5. "Sepolia 테스트 네트워크" 선택

### 네트워크 정보 (수동 추가 시)
```
네트워크 이름: Sepolia
RPC URL: https://sepolia.infura.io/v3/
체인 ID: 11155111
통화 기호: ETH
블록 탐색기: https://sepolia.etherscan.io/
```

---

## 3. Sepolia ETH 받기

테스트넷 ETH는 무료로 받을 수 있습니다 (Faucet 사용).

### 추천 Faucet 사이트
1. **Alchemy Sepolia Faucet** (추천)
   - https://sepoliafaucet.com/
   - Alchemy 계정 필요
   - 매일 0.5 ETH 제공

2. **Infura Sepolia Faucet**
   - https://www.infura.io/faucet/sepolia
   - Infura 계정 필요

3. **Google Cloud Faucet**
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - Google 계정 필요

### 사용 방법
1. Faucet 사이트 접속
2. MetaMask 지갑 주소 복사 (0x로 시작하는 주소)
3. Faucet에 주소 붙여넣기
4. "Request" 또는 "Send" 클릭
5. 약 1-2분 후 MetaMask에서 ETH 확인

> ⚠️ **필요한 ETH 양**
> - 컨트랙트 배포: 약 0.05 ETH
> - VRF 구독 충전: 약 2-5 LINK (Sepolia)
> - 테스트용: 약 0.1 ETH
> - **총 권장량: 최소 0.5 ETH**

---

## 4. Chainlink VRF 구독 생성

VRF(Verifiable Random Function)를 사용하려면 Chainlink 구독이 필요합니다.

### 4.1 구독 생성
1. https://vrf.chain.link/ 접속
2. "Connect Wallet" 클릭하여 MetaMask 연결
3. 네트워크를 **Sepolia**로 변경
4. "Create Subscription" 클릭
5. 트랜잭션 확인 (MetaMask 팝업)
6. **구독 ID(Subscription ID)를 메모해 두세요!**

### 4.2 LINK 토큰 충전
VRF 요청에는 LINK 토큰이 필요합니다.

#### Sepolia LINK 받기
1. https://faucets.chain.link/sepolia 접속
2. MetaMask 연결
3. "20 test LINK" 선택
4. "Send request" 클릭

#### 구독에 LINK 추가
1. VRF 관리 페이지에서 내 구독 선택
2. "Fund Subscription" 클릭
3. LINK 양 입력 (권장: 5 LINK)
4. "Confirm" 클릭

### 4.3 컨트랙트를 Consumer로 추가
> ⚠️ 이 단계는 컨트랙트 배포 **후에** 진행합니다!

1. 구독 페이지에서 "Add Consumer" 클릭
2. 배포된 컨트랙트 주소 입력
3. 트랜잭션 확인

---

## 5. 스마트 컨트랙트 배포 (Remix IDE)

### 5.1 Remix IDE 열기
1. https://remix.ethereum.org/ 접속

### 5.2 파일 생성
1. 왼쪽 파일 탐색기에서 `contracts` 폴더 우클릭
2. "New File" 클릭
3. 파일명: `Lottery.sol`
4. `contracts/Lottery.sol` 파일 내용 전체 복사하여 붙여넣기

### 5.3 컴파일
1. 왼쪽 메뉴에서 "Solidity Compiler" 클릭 (망치 아이콘)
2. 컴파일러 버전: `0.8.19` 선택
3. "Compile Lottery.sol" 클릭
4. 녹색 체크 표시 확인 (컴파일 성공)

### 5.4 배포
1. 왼쪽 메뉴에서 "Deploy & Run Transactions" 클릭 (이더리움 아이콘)
2. **Environment**: "Injected Provider - MetaMask" 선택
3. MetaMask 연결 팝업에서 "연결" 클릭
4. **네트워크가 Sepolia인지 확인!**
5. **Contract**: "Lottery" 선택
6. **Deploy 옆 입력란**에 VRF 구독 ID 입력
   - 예: `12345` (숫자만 입력)
7. "Deploy" 클릭
8. MetaMask에서 트랜잭션 확인
9. 배포 완료 후 **컨트랙트 주소 복사** (아래 Deployed Contracts에서)

### 5.5 배포된 주소 예시
```
0x1234567890abcdef1234567890abcdef12345678
```

> 📝 **이 주소를 반드시 저장하세요!** 프론트엔드에서 사용합니다.

### 5.6 VRF Consumer 등록 (중요!)
1. https://vrf.chain.link/ 로 돌아가기
2. 내 구독 선택
3. "Add Consumer" 클릭
4. 방금 배포한 컨트랙트 주소 붙여넣기
5. 트랜잭션 확인

---

## 6. 프론트엔드 실행

### 6.1 컨트랙트 주소 설정
`frontend/src/utils/constants.js` 파일을 열고:

```javascript
// 이 부분을 실제 배포된 주소로 변경
export const CONTRACT_ADDRESS = "0x실제_배포된_컨트랙트_주소";
```

### 6.2 의존성 설치
```bash
cd lottery-dapp/frontend
npm install
```

### 6.3 개발 서버 실행
```bash
npm run dev
```

### 6.4 브라우저에서 확인
- 브라우저가 자동으로 열립니다
- 또는 http://localhost:3000 접속

---

## 7. 테스트 방법

### 7.1 지갑 연결
1. "MetaMask 지갑 연결" 버튼 클릭
2. MetaMask 팝업에서 "연결" 승인
3. Sepolia 네트워크 확인

### 7.2 복권 참가
1. "복권 참가하기 (0.01 ETH)" 버튼 클릭
2. MetaMask에서 트랜잭션 확인
3. 트랜잭션 완료 후 참가자 목록에서 확인

### 7.3 당첨자 추첨 (관리자만)
> 컨트랙트를 배포한 지갑으로만 가능

1. 관리자 패널의 "당첨자 추첨 시작" 클릭
2. MetaMask에서 트랜잭션 확인
3. **약 2-3분 대기** (VRF 난수 생성 시간)
4. 당첨자 자동 선정 및 상금 지급 확인

### 7.4 결과 확인
- Etherscan에서 트랜잭션 확인: https://sepolia.etherscan.io/
- 당첨금과 기부금 전송 내역 확인 가능

---

## 🔧 문제 해결

### MetaMask가 연결되지 않아요
- 브라우저에 MetaMask가 설치되어 있는지 확인
- 페이지 새로고침 후 다시 시도
- MetaMask에서 해당 사이트 연결 권한 확인

### 트랜잭션이 실패해요
- Sepolia ETH 잔액 확인
- 가스비가 충분한지 확인
- 네트워크가 Sepolia인지 확인

### VRF 요청이 실패해요
- 구독에 LINK 잔액 확인
- 컨트랙트가 Consumer로 등록되었는지 확인
- VRF 구독 ID가 올바른지 확인

### 프론트엔드가 컨트랙트와 연결되지 않아요
- `constants.js`에 올바른 컨트랙트 주소가 입력되었는지 확인
- 개발 서버 재시작
- 브라우저 캐시 삭제 후 새로고침

---

## 📚 참고 자료

- [Chainlink VRF 공식 문서](https://docs.chain.link/vrf/v2-5/getting-started)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Remix IDE 가이드](https://remix-ide.readthedocs.io/)
- [ethers.js 문서](https://docs.ethers.org/v6/)

---

## 🎓 발표 팁

### 데모 시 보여줄 것들
1. **Remix IDE**에서 컨트랙트 코드 설명 (특히 기부 로직)
2. **컨트랙트 배포** 과정 시연
3. **MetaMask 연결** 및 복권 참가
4. **Etherscan**에서 트랜잭션 확인
5. **기부금 전송** 내역 확인 (투명성 강조)

### 강조할 차별화 포인트
- 당첨금의 10%가 **자동으로** 기부됨
- 기부 비율과 주소가 **스마트 컨트랙트에 하드코딩**
- 누구도 이를 **변경하거나 조작할 수 없음**
- 모든 기부 내역이 **블록체인에 영구 기록**
- 누구나 **Etherscan에서 검증 가능**

---

## 8. Vercel 배포

Vercel을 사용하면 프론트엔드를 무료로 배포할 수 있습니다.

### 8.1 GitHub 저장소 준비

1. GitHub에 새 저장소 생성
2. 로컬 프로젝트를 푸시:
```bash
cd lottery-dapp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lottery-dapp.git
git push -u origin main
```

### 8.2 Vercel 계정 설정

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Add New Project" 클릭
4. GitHub 저장소 선택 (lottery-dapp)

### 8.3 프로젝트 설정

1. **Framework Preset**: Vite 선택
2. **Root Directory**: `frontend` 입력 (중요!)
3. **Build Command**: `npm run build` (자동 설정됨)
4. **Output Directory**: `dist` (자동 설정됨)

### 8.4 환경변수 설정

"Environment Variables" 섹션에서 추가:

| Name | Value |
|------|-------|
| `VITE_CONTRACT_ADDRESS` | 배포된 컨트랙트 주소 |
| `VITE_CHAIN_ID` | `11155111` |
| `VITE_INFURA_API_KEY` | (선택) Infura API 키 |

### 8.5 배포 실행

1. "Deploy" 클릭
2. 빌드 완료 대기 (약 1-2분)
3. 배포된 URL 확인 (예: `https://lottery-dapp-xxx.vercel.app`)

### 8.6 배포 후 테스트

1. 배포된 URL 접속
2. MetaMask 연결 테스트
3. Sepolia 네트워크 확인
4. 복권 참가 테스트

---

## 9. 환경변수 설정

### 9.1 로컬 개발 환경

`frontend/.env.local` 파일 생성:
```bash
cd frontend
cp .env.example .env.local
```

파일 수정:
```
VITE_CONTRACT_ADDRESS=0x실제_배포된_컨트랙트_주소
VITE_CHAIN_ID=11155111
VITE_INFURA_API_KEY=your_infura_key  # 선택
```

### 9.2 Vercel 환경변수

Vercel 대시보드에서 설정:
1. 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 변수 추가:
   - `VITE_CONTRACT_ADDRESS`: 컨트랙트 주소
   - `VITE_CHAIN_ID`: `11155111`
4. "Save" 클릭
5. 재배포 필요 ("Deployments" → "Redeploy")

### 9.3 환경변수 우선순위

1. `.env.local` (로컬 개발용, Git 무시)
2. `.env` (공통 설정)
3. Vercel 환경변수 (프로덕션)

---

## 10. 프로덕션 체크리스트

### 배포 전 필수 확인

#### 스마트 컨트랙트
- [ ] 컨트랙트가 Sepolia에 배포됨
- [ ] VRF 구독 ID가 올바름
- [ ] 컨트랙트가 VRF Consumer로 등록됨
- [ ] VRF 구독에 LINK 충분
- [ ] Etherscan에서 컨트랙트 확인 가능

#### 기부 주소 확인
> ⚠️ **중요**: 현재 컨트랙트의 기부 주소는 더미 값입니다!
>
> `contracts/Lottery.sol` 47번째 줄:
> ```solidity
> address public constant CHARITY_ADDRESS = 0x1234567890123456789012345678901234567890;
> ```
>
> 실제 사용 전에 반드시 유효한 기부 주소로 변경하고 재배포하세요!

#### 프론트엔드
- [ ] `VITE_CONTRACT_ADDRESS` 설정됨
- [ ] 로컬에서 `npm run build` 성공
- [ ] MetaMask 연결 테스트 완료
- [ ] 복권 참가 테스트 완료

#### Vercel 배포
- [ ] GitHub 저장소 연결됨
- [ ] Root Directory가 `frontend`로 설정됨
- [ ] 환경변수 설정됨
- [ ] 배포 URL 접속 가능
- [ ] HTTPS 적용됨 (자동)

### 배포 후 확인

- [ ] 배포된 사이트에서 MetaMask 연결
- [ ] 복권 참가 가능
- [ ] 트랜잭션이 Etherscan에 기록됨
- [ ] 관리자 기능 작동 (배포자 지갑으로)

---

## 🔧 추가 문제 해결

### Vercel 빌드 실패

**증상**: 빌드 중 에러 발생

**해결 방법**:
1. Root Directory가 `frontend`인지 확인
2. `package.json`에 `build` 스크립트 있는지 확인
3. 로컬에서 `npm run build` 테스트
4. 빌드 로그에서 구체적인 에러 확인

### 환경변수 미적용

**증상**: 컨트랙트 주소가 기본값으로 표시

**해결 방법**:
1. 환경변수 이름이 `VITE_`로 시작하는지 확인
2. Vercel에서 환경변수 저장 후 재배포
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

### MetaMask 연결 안됨

**증상**: "MetaMask를 설치해주세요" 메시지

**해결 방법**:
1. MetaMask 확장 프로그램 설치 확인
2. 브라우저에서 MetaMask 활성화
3. 사이트 연결 권한 확인 (MetaMask 설정)

---

## 11. CI/CD 설정 (GitHub Actions)

GitHub Actions를 사용하여 main 브랜치 푸시 시 자동 배포를 설정합니다.

### 11.1 Vercel 토큰 발급

1. https://vercel.com/account/tokens 접속
2. "Create" 클릭
3. 토큰 이름 입력 (예: `github-actions`)
4. 토큰 복사 및 안전하게 보관

### 11.2 Vercel 프로젝트 ID 확인

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "General"
3. "Project ID" 복사
4. 페이지 하단 "Vercel CLI" 섹션에서 "Org ID" 확인

또는 CLI로 확인:
```bash
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json
```

### 11.3 GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions

다음 시크릿 추가:

| Secret Name | 값 | 필수 |
|-------------|-----|------|
| `VERCEL_TOKEN` | Vercel 액세스 토큰 | 필수 |
| `VERCEL_ORG_ID` | Vercel 조직 ID | 필수 |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | 필수 |
| `VITE_CONTRACT_ADDRESS` | 배포된 컨트랙트 주소 | 필수 |
| `VITE_INFURA_API_KEY` | Infura API 키 | 선택 |

### 11.4 워크플로우 동작

`.github/workflows/deploy.yml` 파일이 다음을 수행합니다:

1. **빌드 테스트**: 모든 푸시/PR에서 빌드 확인
2. **프로덕션 배포**: main 브랜치 푸시 시 자동 배포
3. **프리뷰 배포**: PR 생성 시 프리뷰 URL 생성 및 코멘트

### 11.5 수동 배포 (필요시)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 11.6 배포 확인

1. GitHub → Actions 탭에서 워크플로우 상태 확인
2. 성공 시 Vercel 대시보드에서 배포 URL 확인
3. PR의 경우 코멘트로 프리뷰 URL 제공
