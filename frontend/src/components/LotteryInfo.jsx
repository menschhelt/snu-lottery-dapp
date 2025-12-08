// ============================================
// 📊 LotteryInfo 컴포넌트
// ============================================
// 현재 복권 라운드의 정보를 표시하는 컴포넌트입니다.
//
// 표시 정보:
// - 현재 라운드 번호
// - 상금 풀 (ETH)
// - 참가자 수
// - 복권 상태 (오픈/마감)

import React from 'react';

function LotteryInfo({
    lotteryId,
    prizePool,
    jackpotPool,
    guaranteedPool,
    playersCount,
    isLotteryOpen
}) {
    return (
        <div className="card lottery-info">
            {/* 카드 헤더 */}
            <div className="card-header">
                <h2>🎰 현재 복권 정보</h2>
                {/* 상태 뱃지 */}
                <span className={`status-badge ${isLotteryOpen ? 'open' : 'closed'}`}>
                    {isLotteryOpen ? '🟢 참가 가능' : '🔴 추첨 중'}
                </span>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
                {/* 라운드 번호 */}
                <div className="info-item">
                    <span className="info-label">라운드</span>
                    <span className="info-value">#{lotteryId}</span>
                </div>

                {/* 상금 풀 */}
                <div className="info-item highlight">
                    <span className="info-label">💰 총 상금 풀</span>
                    <span className="info-value prize">
                        {parseFloat(prizePool).toFixed(4)} ETH
                    </span>
                </div>

                {/* 보장 당첨 풀 */}
                <div className="info-item">
                    <span className="info-label">🎯 보장 당첨 풀 (50%)</span>
                    <span className="info-value">
                        {parseFloat(guaranteedPool).toFixed(4)} ETH
                    </span>
                </div>

                {/* 잭팟 풀 */}
                <div className="info-item highlight">
                    <span className="info-label">🎰 잭팟 풀 (10% 확률)</span>
                    <span className="info-value prize">
                        {parseFloat(jackpotPool).toFixed(4)} ETH
                    </span>
                </div>

                {/* 참가자 수 */}
                <div className="info-item">
                    <span className="info-label">👥 참가자 수</span>
                    <span className="info-value">{playersCount}명</span>
                </div>

                {/* 티켓 가격 */}
                <div className="info-item">
                    <span className="info-label">🎫 티켓 가격</span>
                    <span className="info-value">0.01 ETH</span>
                </div>

                {/* 당첨 확률 (참가자가 있을 때만) */}
                {playersCount > 0 && (
                    <div className="info-item">
                        <span className="info-label">🎯 당첨 확률</span>
                        <span className="info-value">
                            {((1 / playersCount) * 100).toFixed(2)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LotteryInfo;
