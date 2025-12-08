// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================
// 🎰 블록체인 복권 DApp - 스마트 컨트랙트 (하이브리드 모델)
// ============================================
//
// 🎯 하이브리드 복권 시스템:
// - 보장 당첨 (50%): 매 라운드 무조건 1명 당첨
// - 잭팟 풀 (50%): 10% 확률로 당첨, 미당첨 시 이월
//
// 💰 수익 분배 (보장 당첨금 + 잭팟 당첨금 각각에 적용):
// - 당첨자: 85%
// - 기부: 10%
// - 운영비: 5%
//
// 사용 네트워크: Sepolia 테스트넷
// ============================================

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract Lottery is VRFConsumerBaseV2Plus {

    // ========================================
    // 📊 상태 변수 (State Variables)
    // ========================================

    // --- 복권 기본 설정 ---
    address public admin;
    address[] public players;
    uint256 public lotteryId;
    uint256 public constant TICKET_PRICE = 0.01 ether;

    // --- 💰 수익 분배 설정 (85/10/5) ---
    uint256 public constant WINNER_PERCENTAGE = 85;      // 당첨자: 85%
    uint256 public constant DONATION_PERCENTAGE = 10;    // 기부: 10%
    uint256 public constant ADMIN_FEE_PERCENTAGE = 5;    // 운영비: 5%

    // --- 🎁 기부 주소 ---
    address public constant CHARITY_ADDRESS = 0x599058D48B16a8e4566DEE4cA342D68D3cbBF77A;

    // --- 🎯 하이브리드 모델 설정 ---
    uint256 public constant GUARANTEED_POOL_PERCENTAGE = 50;  // 보장 당첨 풀: 50%
    uint256 public constant JACKPOT_POOL_PERCENTAGE = 50;     // 잭팟 풀: 50%
    uint256 public constant JACKPOT_WIN_CHANCE = 10;          // 잭팟 당첨 확률: 10%
    uint256 public jackpotPool;                               // 누적 잭팟 풀

    // --- 통계 ---
    uint256 public totalDonated;
    uint256 public totalAdminFees;

    // --- Chainlink VRF 설정 (Sepolia) ---
    uint256 public s_subscriptionId;
    bytes32 public constant KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 public constant CALLBACK_GAS_LIMIT = 500000;  // 가스 제한 증가 (하이브리드 로직)
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 2;  // 2개 난수 필요 (당첨자 선정 + 잭팟 확률)

    // --- 복권 상태 ---
    uint256 public lastRequestId;
    bool public lotteryOpen;

    // --- 기록 저장 ---
    mapping(uint256 => address) public lotteryHistory;
    mapping(uint256 => uint256) public guaranteedPrizeHistory;
    mapping(uint256 => uint256) public jackpotPrizeHistory;
    mapping(uint256 => uint256) public lotteryDonationHistory;
    mapping(uint256 => bool) public jackpotWonHistory;
    mapping(uint256 => uint256) public requestIdToLotteryId;

    // ========================================
    // 📢 이벤트 (Events)
    // ========================================

    event LotteryEnter(address indexed player, uint256 indexed lotteryId, uint256 timestamp);
    event GuaranteedWinner(address indexed winner, uint256 indexed lotteryId, uint256 prizeAmount);
    event JackpotWinner(address indexed winner, uint256 indexed lotteryId, uint256 jackpotAmount);
    event JackpotMiss(uint256 indexed lotteryId, uint256 jackpotPoolCarryOver);
    event DonationMade(address indexed charityAddress, uint256 indexed lotteryId, uint256 amount);
    event AdminFeeCollected(address indexed admin, uint256 indexed lotteryId, uint256 amount);
    event RandomnessRequested(uint256 indexed requestId, uint256 indexed lotteryId);
    event LotteryReset(uint256 indexed newLotteryId);

    // ========================================
    // 🔒 접근 제어자 (Modifiers)
    // ========================================

    modifier onlyAdmin() {
        require(msg.sender == admin, unicode"오류: 관리자만 실행할 수 있습니다");
        _;
    }

    modifier lotteryIsOpen() {
        require(lotteryOpen, unicode"오류: 현재 복권이 마감되었습니다");
        _;
    }

    // ========================================
    // 🏗️ 생성자 (Constructor)
    // ========================================

    constructor(uint256 subscriptionId)
        VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B)
    {
        admin = msg.sender;
        lotteryId = 1;
        lotteryOpen = true;
        s_subscriptionId = subscriptionId;
        jackpotPool = 0;
        totalDonated = 0;
        totalAdminFees = 0;
    }

    // ========================================
    // 🎫 복권 참가 함수
    // ========================================

    function enter() public payable lotteryIsOpen {
        require(msg.value == TICKET_PRICE, unicode"오류: 참가비는 정확히 0.01 ETH입니다");
        players.push(msg.sender);
        emit LotteryEnter(msg.sender, lotteryId, block.timestamp);
    }

    // ========================================
    // 🎲 추첨 시작 함수 (관리자 전용)
    // ========================================

    function pickWinner() public onlyAdmin lotteryIsOpen {
        require(players.length > 0, unicode"오류: 참가자가 없습니다");
        lotteryOpen = false;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );

        lastRequestId = requestId;
        requestIdToLotteryId[requestId] = lotteryId;
        emit RandomnessRequested(requestId, lotteryId);
    }

    // ========================================
    // 🎯 난수 수신 콜백 함수 (하이브리드 모델)
    // ========================================

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 currentLotteryId = requestIdToLotteryId[requestId];

        // 1. 당첨자 선정
        address winner = players[randomWords[0] % players.length];

        // 2. 이번 라운드 참가금 (잭팟 풀 제외)
        uint256 roundPool = address(this).balance - jackpotPool;

        // 3. 풀 분배 및 잭팟 추가
        uint256 guaranteedPool = (roundPool * GUARANTEED_POOL_PERCENTAGE) / 100;
        jackpotPool += (roundPool * JACKPOT_POOL_PERCENTAGE) / 100;

        // 4. 보장 당첨금 분배 계산
        uint256 totalWinnerPrize = (guaranteedPool * WINNER_PERCENTAGE) / 100;
        uint256 totalDonationAmount = (guaranteedPool * DONATION_PERCENTAGE) / 100;
        uint256 totalAdminFeeAmount = guaranteedPool - totalWinnerPrize - totalDonationAmount;

        // 5. 잭팟 당첨 여부 확인 (10% 확률)
        bool jackpotWon = (randomWords[1] % 100) < JACKPOT_WIN_CHANCE;

        if (jackpotWon && jackpotPool > 0) {
            // 잭팟 당첨! 추가 분배
            uint256 jackpotWinnerPrize = (jackpotPool * WINNER_PERCENTAGE) / 100;
            uint256 jackpotDonation = (jackpotPool * DONATION_PERCENTAGE) / 100;

            totalWinnerPrize += jackpotWinnerPrize;
            totalDonationAmount += jackpotDonation;
            totalAdminFeeAmount += jackpotPool - jackpotWinnerPrize - jackpotDonation;

            jackpotPrizeHistory[currentLotteryId] = jackpotWinnerPrize;
            emit JackpotWinner(winner, currentLotteryId, jackpotWinnerPrize);
            jackpotPool = 0;
        } else {
            jackpotPrizeHistory[currentLotteryId] = 0;
            emit JackpotMiss(currentLotteryId, jackpotPool);
        }

        // 6. 전송 실행
        _executeTransfers(winner, totalWinnerPrize, totalDonationAmount, totalAdminFeeAmount, currentLotteryId);

        // 7. 기록 저장
        lotteryHistory[currentLotteryId] = winner;
        guaranteedPrizeHistory[currentLotteryId] = (guaranteedPool * WINNER_PERCENTAGE) / 100;
        lotteryDonationHistory[currentLotteryId] = totalDonationAmount;
        jackpotWonHistory[currentLotteryId] = jackpotWon;

        emit GuaranteedWinner(winner, currentLotteryId, guaranteedPrizeHistory[currentLotteryId]);
        _resetLottery();
    }

    // ========================================
    // 💸 전송 실행 함수 (Stack depth 최적화)
    // ========================================

    function _executeTransfers(
        address winner,
        uint256 winnerPrize,
        uint256 donationAmount,
        uint256 adminFeeAmount,
        uint256 currentLotteryId
    ) private {
        // 기부금 전송
        if (donationAmount > 0) {
            (bool donationSuccess, ) = payable(CHARITY_ADDRESS).call{value: donationAmount}("");
            require(donationSuccess, unicode"오류: 기부금 전송 실패");
            totalDonated += donationAmount;
            emit DonationMade(CHARITY_ADDRESS, currentLotteryId, donationAmount);
        }

        // 운영비 전송
        if (adminFeeAmount > 0) {
            (bool adminSuccess, ) = payable(admin).call{value: adminFeeAmount}("");
            require(adminSuccess, unicode"오류: 운영비 전송 실패");
            totalAdminFees += adminFeeAmount;
            emit AdminFeeCollected(admin, currentLotteryId, adminFeeAmount);
        }

        // 당첨금 전송
        (bool winnerSuccess, ) = payable(winner).call{value: winnerPrize}("");
        require(winnerSuccess, unicode"오류: 당첨금 전송 실패");
    }

    // ========================================
    // 🔄 복권 리셋 함수
    // ========================================

    function _resetLottery() private {
        delete players;
        lotteryId++;
        lotteryOpen = true;
        emit LotteryReset(lotteryId);
    }

    // ========================================
    // 📖 조회 함수들
    // ========================================

    function getPlayersCount() public view returns (uint256) {
        return players.length;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getPrizePool() public view returns (uint256) {
        return address(this).balance;
    }

    function getJackpotPool() public view returns (uint256) {
        return jackpotPool;
    }

    function getGuaranteedPool() public view returns (uint256) {
        uint256 roundPool = address(this).balance - jackpotPool;
        return (roundPool * GUARANTEED_POOL_PERCENTAGE) / 100;
    }

    function getWinner(uint256 _lotteryId) public view returns (address) {
        return lotteryHistory[_lotteryId];
    }

    function getGuaranteedPrize(uint256 _lotteryId) public view returns (uint256) {
        return guaranteedPrizeHistory[_lotteryId];
    }

    function getJackpotPrize(uint256 _lotteryId) public view returns (uint256) {
        return jackpotPrizeHistory[_lotteryId];
    }

    function getDonationAmount(uint256 _lotteryId) public view returns (uint256) {
        return lotteryDonationHistory[_lotteryId];
    }

    function wasJackpotWon(uint256 _lotteryId) public view returns (bool) {
        return jackpotWonHistory[_lotteryId];
    }

    function getTotalDonated() public view returns (uint256) {
        return totalDonated;
    }

    function getTotalAdminFees() public view returns (uint256) {
        return totalAdminFees;
    }

    function getLotteryInfo() public view returns (
        uint256 currentLotteryId,
        uint256 playerCount,
        uint256 totalPool,
        uint256 currentJackpot,
        uint256 guaranteedPool,
        bool isOpen
    ) {
        uint256 roundPool = address(this).balance - jackpotPool;
        return (
            lotteryId,
            players.length,
            address(this).balance,
            jackpotPool,
            (roundPool * GUARANTEED_POOL_PERCENTAGE) / 100,
            lotteryOpen
        );
    }

    function getFeeInfo() public pure returns (
        uint256 winnerPct,
        uint256 donationPct,
        uint256 adminPct,
        address charityAddr
    ) {
        return (WINNER_PERCENTAGE, DONATION_PERCENTAGE, ADMIN_FEE_PERCENTAGE, CHARITY_ADDRESS);
    }

    // ========================================
    // ⚙️ 관리자 함수들
    // ========================================

    function pauseLottery() public onlyAdmin {
        lotteryOpen = false;
    }

    function resumeLottery() public onlyAdmin {
        lotteryOpen = true;
    }
}