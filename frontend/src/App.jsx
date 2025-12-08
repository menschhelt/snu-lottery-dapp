// ============================================
// 블록체인 복권 DApp - 메인 앱 컴포넌트
// ============================================
// 이 파일은 React 앱의 최상위 컴포넌트입니다.
// 모든 하위 컴포넌트들을 조합하여 전체 UI를 구성합니다.

import React from 'react';
import { useWallet } from './hooks/useWallet';
import { useLottery } from './hooks/useLottery';
import WalletConnect from './components/WalletConnect';
import LotteryInfo from './components/LotteryInfo';
import DonationInfo from './components/DonationInfo';
import LotteryActions from './components/LotteryActions';
import PastWinners from './components/PastWinners';
import AdminPanel from './components/AdminPanel';
import './App.css';

// ============================================
// App 컴포넌트
// ============================================
function App() {
    // ========================================
    // 커스텀 훅 사용
    // ========================================
    // 커스텀 훅을 사용하여 지갑과 복권 상태를 관리합니다.

    // useWallet: 지갑 연결 상태 관리
    const {
        account,         // 연결된 지갑 주소
        signer,          // 트랜잭션 서명자
        provider,        // 블록체인 프로바이더
        isConnecting,    // 연결 중 상태
        error: walletError,  // 지갑 에러
        connectWallet,   // 지갑 연결 함수
        disconnectWallet, // 연결 해제 함수
        isConnected,     // 연결 여부
        isCorrectNetwork // Sepolia 연결 여부
    } = useWallet();

    // useLottery: 복권 컨트랙트 상태 관리
    const {
        lotteryId,       // 현재 라운드
        prizePool,       // 상금 풀
        jackpotPool,     // 잭팟 풀
        guaranteedPool,  // 보장 당첨 풀
        playersCount,    // 참가자 수
        players,         // 참가자 목록
        isLotteryOpen,   // 복권 오픈 상태
        totalDonated,    // 총 기부금
        charityAddress,  // 기부 주소
        donationPercentage, // 기부 비율
        pastWinners,     // 과거 당첨자
        isOwner,         // 관리자 여부
        isLoading,       // 로딩 상태
        error: lotteryError, // 복권 에러
        txHash,          // 트랜잭션 해시
        enterLottery,    // 복권 참가 함수
        pickWinner       // 추첨 함수
    } = useLottery(signer, provider, account);

    // ========================================
    // 렌더링
    // ========================================
    return (
        <div className="app">
            {/* 헤더 영역 */}
            <header className="header">
                <h1>🎰 블록체인 복권 DApp</h1>
                <p className="subtitle">투명하고 공정한 블록체인 기반 복권 시스템</p>
            </header>

            {/* 지갑 연결 영역 */}
            <WalletConnect
                account={account}
                isConnecting={isConnecting}
                error={walletError}
                connectWallet={connectWallet}
                disconnectWallet={disconnectWallet}
                isConnected={isConnected}
                isCorrectNetwork={isCorrectNetwork}
            />

            {/* 메인 콘텐츠 - 지갑 연결 시에만 표시 */}
            {isConnected && isCorrectNetwork && (
                <main className="main-content">
                    {/* 에러 메시지 */}
                    {lotteryError && (
                        <div className="error-banner">
                            ❌ {lotteryError}
                        </div>
                    )}

                    {/* 트랜잭션 해시 */}
                    {txHash && (
                        <div className="tx-banner">
                            📤 트랜잭션 전송됨:{' '}
                            <a
                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </a>
                        </div>
                    )}

                    {/* 복권 정보 + 기부 정보 */}
                    <div className="info-grid">
                        <LotteryInfo
                            lotteryId={lotteryId}
                            prizePool={prizePool}
                            jackpotPool={jackpotPool}
                            guaranteedPool={guaranteedPool}
                            playersCount={playersCount}
                            isLotteryOpen={isLotteryOpen}
                        />
                        <DonationInfo
                            totalDonated={totalDonated}
                            charityAddress={charityAddress}
                            donationPercentage={donationPercentage}
                        />
                    </div>

                    {/* 복권 참가 액션 */}
                    <LotteryActions
                        enterLottery={enterLottery}
                        isLoading={isLoading}
                        isLotteryOpen={isLotteryOpen}
                        account={account}
                        players={players}
                    />

                    {/* 관리자 패널 - 관리자만 표시 */}
                    {isOwner && (
                        <AdminPanel
                            pickWinner={pickWinner}
                            isLoading={isLoading}
                            playersCount={playersCount}
                            isLotteryOpen={isLotteryOpen}
                        />
                    )}

                    {/* 과거 당첨 기록 */}
                    <PastWinners pastWinners={pastWinners} />
                </main>
            )}

            {/* 푸터 */}
            <footer className="footer">
                <p>
                    🔗 Sepolia 테스트넷 |{' '}
                    <a
                        href="https://sepolia.etherscan.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Etherscan에서 확인
                    </a>
                </p>
                <p className="footer-note">
                    💝 당첨금의 {donationPercentage || 10}%가 자동으로 기부됩니다
                </p>
            </footer>
        </div>
    );
}

export default App;
