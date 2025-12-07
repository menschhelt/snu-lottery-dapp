// ============================================
// 상수 정의 파일
// ============================================
// 이 파일에는 컨트랙트 주소와 ABI가 정의되어 있습니다.
// ABI (Application Binary Interface)는 스마트 컨트랙트와
// 통신하기 위한 인터페이스 명세입니다.

// ============================================
// 컨트랙트 주소
// ============================================
// 환경변수 또는 직접 입력으로 설정 가능합니다.
// - 로컬 개발: .env.local 파일에 VITE_CONTRACT_ADDRESS 설정
// - Vercel 배포: Vercel 대시보드에서 환경변수 설정
// - 직접 입력: 아래 fallback 값을 실제 주소로 변경
export const CONTRACT_ADDRESS =
    import.meta.env.VITE_CONTRACT_ADDRESS ||
    "여기에_배포된_컨트랙트_주소_입력";

// ============================================
// 컨트랙트 ABI (Application Binary Interface)
// ============================================
// ABI는 스마트 컨트랙트의 함수들을 정의합니다.
// 프론트엔드가 컨트랙트와 통신하려면 ABI가 필요합니다.
// Remix에서 컴파일 후 ABI를 복사할 수 있습니다.
export const CONTRACT_ABI = [
    // ========================================
    // 쓰기 함수 (Write Functions)
    // 이 함수들은 블록체인 상태를 변경하므로 가스비가 필요합니다.
    // ========================================

    // 복권 참가 함수
    {
        "inputs": [],
        "name": "enter",
        "outputs": [],
        "stateMutability": "payable",  // ETH를 받을 수 있음
        "type": "function"
    },

    // 추첨 시작 함수 (관리자 전용)
    {
        "inputs": [],
        "name": "pickWinner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // 복권 일시 중지 (관리자 전용)
    {
        "inputs": [],
        "name": "pauseLottery",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // 복권 재개 (관리자 전용)
    {
        "inputs": [],
        "name": "resumeLottery",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ========================================
    // 읽기 함수 (Read Functions)
    // view 함수는 가스비 없이 무료로 호출할 수 있습니다.
    // ========================================

    // 컨트랙트 소유자 조회
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 현재 라운드 번호 조회
    {
        "inputs": [],
        "name": "lotteryId",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 복권 오픈 여부 조회
    {
        "inputs": [],
        "name": "lotteryOpen",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 참가자 수 조회
    {
        "inputs": [],
        "name": "getPlayersCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 모든 참가자 목록 조회
    {
        "inputs": [],
        "name": "getPlayers",
        "outputs": [{"name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 현재 상금 풀 조회
    {
        "inputs": [],
        "name": "getPrizePool",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 특정 라운드 당첨자 조회
    {
        "inputs": [{"name": "_lotteryId", "type": "uint256"}],
        "name": "getWinner",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 특정 라운드 당첨금 조회
    {
        "inputs": [{"name": "_lotteryId", "type": "uint256"}],
        "name": "getPrizeAmount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 특정 라운드 기부금 조회
    {
        "inputs": [{"name": "_lotteryId", "type": "uint256"}],
        "name": "getDonationAmount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 총 누적 기부금 조회
    {
        "inputs": [],
        "name": "getTotalDonated",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 기부 정보 조회
    {
        "inputs": [],
        "name": "getDonationInfo",
        "outputs": [
            {"name": "charityAddr", "type": "address"},
            {"name": "percentage", "type": "uint256"}
        ],
        "stateMutability": "pure",
        "type": "function"
    },

    // 복권 티켓 가격 조회
    {
        "inputs": [],
        "name": "TICKET_PRICE",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 기부 주소 조회
    {
        "inputs": [],
        "name": "CHARITY_ADDRESS",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },

    // 기부 비율 조회
    {
        "inputs": [],
        "name": "DONATION_PERCENTAGE",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },

    // ========================================
    // 이벤트 (Events)
    // 프론트엔드에서 구독하여 실시간 알림을 받을 수 있습니다.
    // ========================================

    // 복권 참가 이벤트
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "player", "type": "address"},
            {"indexed": true, "name": "lotteryId", "type": "uint256"},
            {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "LotteryEnter",
        "type": "event"
    },

    // 당첨자 선정 이벤트
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "winner", "type": "address"},
            {"indexed": true, "name": "lotteryId", "type": "uint256"},
            {"indexed": false, "name": "prizeAmount", "type": "uint256"}
        ],
        "name": "LotteryWinner",
        "type": "event"
    },

    // 기부 실행 이벤트
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "charityAddress", "type": "address"},
            {"indexed": true, "name": "lotteryId", "type": "uint256"},
            {"indexed": false, "name": "amount", "type": "uint256"}
        ],
        "name": "DonationMade",
        "type": "event"
    },

    // 복권 리셋 이벤트
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "newLotteryId", "type": "uint256"}
        ],
        "name": "LotteryReset",
        "type": "event"
    }
];

// ============================================
// 네트워크 설정
// ============================================
// Sepolia 테스트넷 정보
// Infura API 키는 환경변수로 설정하거나, 공개 RPC를 사용합니다.
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || '';

export const NETWORK_CONFIG = {
    chainId: "0xaa36a7",        // Sepolia 체인 ID (11155111의 16진수)
    chainName: "Sepolia",
    rpcUrls: [
        // Infura API 키가 있으면 Infura 사용, 없으면 공개 RPC 사용
        INFURA_API_KEY
            ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
            : "https://rpc.sepolia.org"
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"]
};

// ============================================
// 기타 상수
// ============================================
export const TICKET_PRICE_ETH = "0.01";  // 티켓 가격 (ETH 문자열)
