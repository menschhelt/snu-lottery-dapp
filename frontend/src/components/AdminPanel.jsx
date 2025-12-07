// ============================================
// AdminPanel 컴포넌트
// ============================================
// 관리자 전용 패널입니다.
// 컨트랙트 소유자만 이 패널을 볼 수 있습니다.
//
// 기능:
// - 당첨자 추첨 시작
// - 복권 일시 중지/재개 (확장 가능)

import React from 'react';

function AdminPanel({
    pickWinner,
    isLoading,
    playersCount,
    isLotteryOpen
}) {
    // ========================================
    // 추첨 버튼 클릭 핸들러
    // ========================================
    const handlePickWinner = async () => {
        // 확인 대화상자
        const confirmed = window.confirm(
            `정말 추첨을 시작하시겠습니까?\n\n` +
            `현재 참가자: ${playersCount}명\n` +
            `추첨이 시작되면 새로운 참가를 받지 않습니다.`
        );

        if (confirmed) {
            const success = await pickWinner();
            if (success) {
                // VRF 요청이 전송됨
                // 실제 결과는 몇 블록 후에 나옴
            }
        }
    };

    return (
        <div className="card admin-panel">
            {/* 카드 헤더 */}
            <div className="card-header">
                <h2>⚙️ 관리자 패널</h2>
                <span className="admin-badge">👑 관리자</span>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
                {/* 경고 메시지 */}
                <div className="admin-warning">
                    ⚠️ 이 기능은 컨트랙트 소유자만 사용할 수 있습니다.
                </div>

                {/* 추첨 버튼 */}
                <button
                    className={`btn btn-admin ${isLoading ? 'loading' : ''}`}
                    onClick={handlePickWinner}
                    disabled={isLoading || playersCount === 0 || !isLotteryOpen}
                >
                    {isLoading ? (
                        <>🔄 추첨 처리 중...</>
                    ) : playersCount === 0 ? (
                        <>⛔ 참가자가 없습니다</>
                    ) : !isLotteryOpen ? (
                        <>🔒 이미 추첨 중입니다</>
                    ) : (
                        <>🎲 당첨자 추첨 시작</>
                    )}
                </button>

                {/* 추첨 정보 */}
                <div className="admin-info">
                    <h4>📋 추첨 프로세스</h4>
                    <ol>
                        <li>추첨 버튼 클릭 → 복권 마감</li>
                        <li>Chainlink VRF에 난수 요청</li>
                        <li>약 2-3분 후 난수 수신</li>
                        <li>당첨자 자동 선정 및 상금 지급</li>
                        <li>기부금 자동 전송</li>
                        <li>새 라운드 자동 시작</li>
                    </ol>
                </div>

                {/* VRF 설명 */}
                <div className="vrf-info">
                    <h4>🎲 Chainlink VRF란?</h4>
                    <p>
                        VRF(Verifiable Random Function)는 암호학적으로 안전한
                        난수를 생성하는 기술입니다. 누구도 결과를 예측하거나
                        조작할 수 없어 공정한 추첨이 보장됩니다.
                    </p>
                    <a
                        href="https://docs.chain.link/vrf"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        📚 Chainlink VRF 더 알아보기
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
