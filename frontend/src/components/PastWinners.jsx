// ============================================
// 🏆 PastWinners 컴포넌트
// ============================================
// 과거 복권 라운드의 당첨 기록을 표시하는 컴포넌트입니다.
// 블록체인에 영구 저장된 기록을 조회하여 보여줍니다.
//
// 표시 정보:
// - 라운드 번호
// - 당첨자 주소
// - 당첨금
// - 기부금

import React from 'react';

function PastWinners({ pastWinners }) {
    // 기록이 없는 경우
    if (!pastWinners || pastWinners.length === 0) {
        return (
            <div className="card past-winners">
                <div className="card-header">
                    <h2>🏆 과거 당첨 기록</h2>
                </div>
                <div className="card-body">
                    <p className="no-records">아직 당첨 기록이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card past-winners">
            {/* 카드 헤더 */}
            <div className="card-header">
                <h2>🏆 과거 당첨 기록</h2>
                <span className="record-count">
                    총 {pastWinners.length}건
                </span>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
                {/* 기록 테이블 */}
                <div className="winners-table">
                    {/* 테이블 헤더 */}
                    <div className="table-header">
                        <span className="col-round">라운드</span>
                        <span className="col-winner">당첨자</span>
                        <span className="col-prize">당첨금</span>
                        <span className="col-donation">기부금</span>
                    </div>

                    {/* 테이블 바디 */}
                    <div className="table-body">
                        {pastWinners.map((record, index) => (
                            <div key={index} className="table-row">
                                {/* 라운드 번호 */}
                                <span className="col-round">
                                    #{record.round}
                                </span>

                                {/* 당첨자 주소 */}
                                <span className="col-winner">
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${record.winner}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {record.winner.slice(0, 6)}...{record.winner.slice(-4)}
                                    </a>
                                </span>

                                {/* 당첨금 */}
                                <span className="col-prize">
                                    {parseFloat(record.prize).toFixed(4)} ETH
                                </span>

                                {/* 기부금 */}
                                <span className="col-donation">
                                    💝 {parseFloat(record.donation).toFixed(4)} ETH
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 투명성 안내 */}
                <div className="transparency-footer">
                    <p>
                        📜 모든 기록은 블록체인에 영구 저장되어 있습니다.
                        <a
                            href="https://sepolia.etherscan.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Etherscan에서 직접 확인하기
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PastWinners;
