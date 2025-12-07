// ============================================
// useLottery 커스텀 훅
// ============================================
// 이 훅은 복권 스마트 컨트랙트와의 상호작용을 관리합니다.
//
// 주요 기능:
// - 복권 정보 조회 (참가자 수, 상금 풀, 기부 현황 등)
// - 복권 참가
// - 당첨자 추첨 (관리자 전용)
// - 이벤트 구독 (실시간 업데이트)

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, TICKET_PRICE_ETH } from '../utils/constants';

export function useLottery(signer, provider, account) {
    // ========================================
    // 상태 변수
    // ========================================

    // 복권 기본 정보
    const [lotteryId, setLotteryId] = useState(0);           // 현재 라운드 번호
    const [prizePool, setPrizePool] = useState("0");         // 현재 상금 풀 (ETH)
    const [playersCount, setPlayersCount] = useState(0);     // 참가자 수
    const [players, setPlayers] = useState([]);              // 참가자 목록
    const [isLotteryOpen, setIsLotteryOpen] = useState(true); // 복권 오픈 상태

    // 기부 관련 정보
    const [totalDonated, setTotalDonated] = useState("0");   // 총 누적 기부금
    const [charityAddress, setCharityAddress] = useState(""); // 기부 주소
    const [donationPercentage, setDonationPercentage] = useState(0); // 기부 비율

    // 과거 라운드 기록
    const [pastWinners, setPastWinners] = useState([]);      // 과거 당첨자 목록

    // 상태 관리
    const [isOwner, setIsOwner] = useState(false);           // 관리자 여부
    const [isLoading, setIsLoading] = useState(false);       // 로딩 상태
    const [error, setError] = useState(null);                // 에러 메시지
    const [txHash, setTxHash] = useState(null);              // 최근 트랜잭션 해시

    // 컨트랙트 인스턴스
    const [contract, setContract] = useState(null);

    // ========================================
    // 컨트랙트 초기화
    // ========================================
    useEffect(() => {
        if (signer && CONTRACT_ADDRESS !== "여기에_배포된_컨트랙트_주소_입력") {
            // ethers.Contract: 스마트 컨트랙트와 상호작용하기 위한 객체
            // signer와 연결하면 트랜잭션을 보낼 수 있습니다.
            const lotteryContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );
            setContract(lotteryContract);
            console.log("✅ 컨트랙트 연결됨:", CONTRACT_ADDRESS);
        }
    }, [signer]);

    // ========================================
    // 복권 정보 조회 함수
    // ========================================
    const fetchLotteryInfo = useCallback(async () => {
        if (!contract) return;

        try {
            setIsLoading(true);

            // Promise.all: 여러 비동기 작업을 동시에 실행
            // 각 함수 호출을 병렬로 처리하여 속도를 높입니다.
            const [
                id,                 // 현재 라운드 ID
                pool,               // 상금 풀
                count,              // 참가자 수
                playerList,         // 참가자 목록
                open,               // 복권 오픈 상태
                donated,            // 총 기부금
                feeInfo,            // 수수료 정보 (winnerPct, donationPct, adminPct, charityAddr)
                adminAddress        // 컨트랙트 관리자
            ] = await Promise.all([
                contract.lotteryId(),
                contract.getPrizePool(),
                contract.getPlayersCount(),
                contract.getPlayers(),
                contract.lotteryOpen(),
                contract.getTotalDonated(),
                contract.getFeeInfo(),
                contract.admin()
            ]);

            // 상태 업데이트
            setLotteryId(Number(id));
            // ethers.formatEther: wei를 ETH로 변환 (1 ETH = 10^18 wei)
            setPrizePool(ethers.formatEther(pool));
            setPlayersCount(Number(count));
            setPlayers(playerList);
            setIsLotteryOpen(open);
            setTotalDonated(ethers.formatEther(donated));
            // feeInfo: [winnerPct, donationPct, adminPct, charityAddr]
            setCharityAddress(feeInfo[3]);
            setDonationPercentage(Number(feeInfo[1]));

            // 현재 사용자가 관리자인지 확인
            setIsOwner(account?.toLowerCase() === adminAddress.toLowerCase());

            console.log("📊 복권 정보 조회 완료");

        } catch (err) {
            console.error("❌ 복권 정보 조회 실패:", err);
            setError("복권 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [contract, account]);

    // ========================================
    // 과거 당첨 기록 조회
    // ========================================
    const fetchPastWinners = useCallback(async () => {
        if (!contract || lotteryId <= 1) return;

        try {
            const winners = [];

            // 최근 10개 라운드의 기록만 조회 (가스 절약)
            const startId = Math.max(1, lotteryId - 10);

            for (let i = startId; i < lotteryId; i++) {
                const [winner, guaranteedPrize, jackpotPrize, donation, jackpotWon] = await Promise.all([
                    contract.getWinner(i),
                    contract.getGuaranteedPrize(i),
                    contract.getJackpotPrize(i),
                    contract.getDonationAmount(i),
                    contract.wasJackpotWon(i)
                ]);

                // 당첨자가 있는 경우만 추가 (0x0 주소가 아닌 경우)
                if (winner !== ethers.ZeroAddress) {
                    // 총 당첨금 = 보장 당첨금 + 잭팟 당첨금
                    const totalPrize = BigInt(guaranteedPrize) + BigInt(jackpotPrize);
                    winners.push({
                        round: i,
                        winner: winner,
                        prize: ethers.formatEther(totalPrize),
                        guaranteedPrize: ethers.formatEther(guaranteedPrize),
                        jackpotPrize: ethers.formatEther(jackpotPrize),
                        donation: ethers.formatEther(donation),
                        jackpotWon: jackpotWon
                    });
                }
            }

            setPastWinners(winners.reverse()); // 최신순 정렬
            console.log("📜 과거 기록 조회 완료:", winners.length, "개");

        } catch (err) {
            console.error("❌ 과거 기록 조회 실패:", err);
        }
    }, [contract, lotteryId]);

    // ========================================
    // 복권 참가 함수
    // ========================================
    const enterLottery = useCallback(async () => {
        if (!contract) {
            setError("컨트랙트가 연결되지 않았습니다.");
            return false;
        }

        if (!isLotteryOpen) {
            setError("현재 복권이 마감되었습니다.");
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);
            setTxHash(null);

            console.log("🎫 복권 참가 중...");

            // 트랜잭션 전송
            // value: 함께 보낼 ETH 양
            // ethers.parseEther: ETH를 wei로 변환
            const tx = await contract.enter({
                value: ethers.parseEther(TICKET_PRICE_ETH)
            });

            console.log("📤 트랜잭션 전송됨:", tx.hash);
            setTxHash(tx.hash);

            // 트랜잭션이 블록에 포함될 때까지 대기
            // wait(): 트랜잭션 확인을 기다림
            const receipt = await tx.wait();
            console.log("✅ 트랜잭션 확인됨:", receipt);

            // 정보 새로고침
            await fetchLotteryInfo();

            return true;

        } catch (err) {
            console.error("❌ 복권 참가 실패:", err);

            // 사용자가 취소한 경우
            if (err.code === 'ACTION_REJECTED') {
                setError("트랜잭션이 취소되었습니다.");
            } else {
                setError(err.reason || err.message || "복권 참가에 실패했습니다.");
            }
            return false;

        } finally {
            setIsLoading(false);
        }
    }, [contract, isLotteryOpen, fetchLotteryInfo]);

    // ========================================
    // 🎲 당첨자 추첨 함수 (관리자 전용)
    // ========================================
    const pickWinner = useCallback(async () => {
        if (!contract) {
            setError("컨트랙트가 연결되지 않았습니다.");
            return false;
        }

        if (!isOwner) {
            setError("관리자만 추첨할 수 있습니다.");
            return false;
        }

        if (playersCount === 0) {
            setError("참가자가 없습니다.");
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);
            setTxHash(null);

            console.log("🎲 당첨자 추첨 중...");

            // pickWinner 함수 호출
            // 이 함수는 Chainlink VRF에 난수를 요청합니다.
            const tx = await contract.pickWinner();

            console.log("📤 추첨 트랜잭션 전송됨:", tx.hash);
            setTxHash(tx.hash);

            const receipt = await tx.wait();
            console.log("✅ 추첨 트랜잭션 확인됨:", receipt);

            // 참고: 실제 당첨자 선정은 VRF 콜백에서 이루어지므로
            // 몇 블록 후에 완료됩니다.
            alert("추첨이 시작되었습니다! 잠시 후 결과가 나옵니다.");

            return true;

        } catch (err) {
            console.error("❌ 추첨 실패:", err);

            if (err.code === 'ACTION_REJECTED') {
                setError("트랜잭션이 취소되었습니다.");
            } else {
                setError(err.reason || err.message || "추첨에 실패했습니다.");
            }
            return false;

        } finally {
            setIsLoading(false);
        }
    }, [contract, isOwner, playersCount]);

    // ========================================
    // 👂 이벤트 리스너 설정
    // ========================================
    useEffect(() => {
        if (!contract) return;

        // 복권 참가 이벤트 구독
        const handleEnter = (player, id, timestamp) => {
            console.log("🎫 새로운 참가자:", player);
            fetchLotteryInfo(); // 정보 새로고침
        };

        // 보장 당첨 이벤트 구독
        const handleGuaranteedWinner = (winner, id, prizeAmount) => {
            console.log("🏆 보장 당첨자 발표:", winner);
            console.log("💰 보장 당첨금:", ethers.formatEther(prizeAmount), "ETH");
            fetchLotteryInfo();
            fetchPastWinners();
        };

        // 잭팟 당첨 이벤트 구독
        const handleJackpotWinner = (winner, id, jackpotAmount) => {
            console.log("🎰 잭팟 당첨!:", winner);
            console.log("💎 잭팟 당첨금:", ethers.formatEther(jackpotAmount), "ETH");
            fetchLotteryInfo();
        };

        // 잭팟 미당첨 (이월) 이벤트 구독
        const handleJackpotMiss = (id, carryOver) => {
            console.log("📦 잭팟 이월:", ethers.formatEther(carryOver), "ETH");
            fetchLotteryInfo();
        };

        // 기부 이벤트 구독
        const handleDonation = (charityAddr, id, amount) => {
            console.log("💝 기부 완료:", ethers.formatEther(amount), "ETH");
            fetchLotteryInfo();
        };

        // 복권 리셋 이벤트 구독
        const handleReset = (newId) => {
            console.log("🔄 새 라운드 시작:", Number(newId));
            fetchLotteryInfo();
        };

        // 이벤트 리스너 등록
        contract.on("LotteryEnter", handleEnter);
        contract.on("GuaranteedWinner", handleGuaranteedWinner);
        contract.on("JackpotWinner", handleJackpotWinner);
        contract.on("JackpotMiss", handleJackpotMiss);
        contract.on("DonationMade", handleDonation);
        contract.on("LotteryReset", handleReset);

        // 클린업: 컴포넌트 언마운트 시 리스너 제거
        return () => {
            contract.off("LotteryEnter", handleEnter);
            contract.off("GuaranteedWinner", handleGuaranteedWinner);
            contract.off("JackpotWinner", handleJackpotWinner);
            contract.off("JackpotMiss", handleJackpotMiss);
            contract.off("DonationMade", handleDonation);
            contract.off("LotteryReset", handleReset);
        };
    }, [contract, fetchLotteryInfo, fetchPastWinners]);

    // ========================================
    // 🔄 초기 데이터 로드
    // ========================================
    useEffect(() => {
        if (contract) {
            fetchLotteryInfo();
        }
    }, [contract, fetchLotteryInfo]);

    useEffect(() => {
        if (contract && lotteryId > 1) {
            fetchPastWinners();
        }
    }, [contract, lotteryId, fetchPastWinners]);

    // ========================================
    // 📤 훅에서 반환하는 값들
    // ========================================
    return {
        // 복권 정보
        lotteryId,
        prizePool,
        playersCount,
        players,
        isLotteryOpen,

        // 기부 정보
        totalDonated,
        charityAddress,
        donationPercentage,

        // 과거 기록
        pastWinners,

        // 상태
        isOwner,
        isLoading,
        error,
        txHash,

        // 함수
        enterLottery,
        pickWinner,
        fetchLotteryInfo,
        fetchPastWinners
    };
}
