// ============================================
// LotteryActions 컴포넌트
// ============================================
// 복권 참가 버튼과 관련 정보를 표시하는 컴포넌트입니다.
//
// 기능:
// - 복권 참가 버튼
// - 참가 상태 표시
// - 참가자 목록 미리보기

import React, { useState } from 'react';

function LotteryActions({
    enterLottery,
    isLoading,
    isLotteryOpen,
    account,
    players
}) {
    // 참가자 목록 펼침 상태
    const [showPlayers, setShowPlayers] = useState(false);

    // 현재 사용자가 이미 참가했는지 확인
    const hasEntered = players.some(
        player => player.toLowerCase() === account?.toLowerCase()
    );

    // 참가 횟수 계산 (같은 주소로 여러 번 참가 가능)
    const entryCount = players.filter(
        player => player.toLowerCase() === account?.toLowerCase()
    ).length;

    // ========================================
    // 참가 버튼 클릭 핸들러
    // ========================================
    const handleEnter = async () => {
        const success = await enterLottery();
        if (success) {
            alert('🎉 복권 참가 완료! 행운을 빕니다!');
        }
    };

    return (
        <div className="card lottery-actions">
            {/* 카드 헤더 */}
            <div className="card-header">
                <h2>🎫 복권 참가</h2>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
                {/* 참가 버튼 */}
                <button
                    className={`btn btn-enter ${isLoading ? 'loading' : ''}`}
                    onClick={handleEnter}
                    disabled={isLoading || !isLotteryOpen}
                >
                    {isLoading ? (
                        <>🔄 처리 중...</>
                    ) : !isLotteryOpen ? (
                        <>🔒 현재 추첨 중</>
                    ) : (
                        <>🎫 복권 참가하기 (0.01 ETH)</>
                    )}
                </button>

                {/* 참가 상태 */}
                {hasEntered && (
                    <div className="entry-status">
                        ✅ 이번 라운드에 {entryCount}번 참가했습니다!
                    </div>
                )}

                {/* 안내 메시지 */}
                <div className="entry-info">
                    <p>💡 한 지갑으로 여러 번 참가할 수 있습니다.</p>
                    <p>💡 참가할수록 당첨 확률이 높아집니다!</p>
                </div>

                {/* 참가자 목록 토글 */}
                {players.length > 0 && (
                    <div className="players-section">
                        <button
                            className="btn btn-toggle"
                            onClick={() => setShowPlayers(!showPlayers)}
                        >
                            {showPlayers ? '▲ 참가자 목록 숨기기' : '▼ 참가자 목록 보기'}
                        </button>

                        {/* 참가자 목록 */}
                        {showPlayers && (
                            <div className="players-list">
                                <h4>👥 참가자 목록 ({players.length}명)</h4>
                                <ul>
                                    {players.map((player, index) => (
                                        <li
                                            key={index}
                                            className={
                                                player.toLowerCase() === account?.toLowerCase()
                                                    ? 'my-entry'
                                                    : ''
                                            }
                                        >
                                            {/* 참가자 주소 */}
                                            <span className="player-index">#{index + 1}</span>
                                            <span className="player-address">
                                                {player.slice(0, 6)}...{player.slice(-4)}
                                            </span>
                                            {/* 내 참가인 경우 표시 */}
                                            {player.toLowerCase() === account?.toLowerCase() && (
                                                <span className="my-badge">내 참가</span>
                                            )}
                                            {/* Etherscan 링크 */}
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${player}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="etherscan-link"
                                            >
                                                🔍
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LotteryActions;
