// ============================================
// 💝 DonationInfo 컴포넌트
// ============================================
// 자동 기부 기능에 대한 정보를 표시하는 컴포넌트입니다.
// 이 컴포넌트는 프로젝트의 차별화 포인트인 "투명한 기부"를 강조합니다.
//
// 표시 정보:
// - 기부 비율 (%)
// - 기부 받는 주소
// - 누적 기부 금액
// - 투명성 설명

import React from 'react';

function DonationInfo({
    totalDonated,
    charityAddress,
    donationPercentage
}) {
    return (
        <div className="card donation-info">
            {/* 카드 헤더 */}
            <div className="card-header">
                <h2>💝 자동 기부 현황</h2>
                <span className="transparency-badge">
                    🔒 스마트 컨트랙트로 보장
                </span>
            </div>

            {/* 카드 바디 */}
            <div className="card-body">
                {/* 기부 비율 */}
                <div className="info-item">
                    <span className="info-label">기부 비율</span>
                    <span className="info-value">{donationPercentage}%</span>
                </div>

                {/* 누적 기부금 */}
                <div className="info-item highlight">
                    <span className="info-label">💰 총 기부금</span>
                    <span className="info-value donation">
                        {parseFloat(totalDonated).toFixed(4)} ETH
                    </span>
                </div>

                {/* 기부 주소 */}
                <div className="info-item">
                    <span className="info-label">📍 기부 주소</span>
                    <span className="info-value address">
                        {charityAddress ? (
                            <>
                                {charityAddress.slice(0, 6)}...{charityAddress.slice(-4)}
                                <a
                                    href={`https://sepolia.etherscan.io/address/${charityAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="etherscan-link"
                                    title="Etherscan에서 기부 내역 확인"
                                >
                                    🔍
                                </a>
                            </>
                        ) : (
                            '로딩 중...'
                        )}
                    </span>
                </div>
            </div>

            {/* 투명성 설명 */}
            <div className="transparency-note">
                <h3>🔐 투명성 보장</h3>
                <ul>
                    <li>
                        <strong>불변의 비율:</strong> 기부 비율 {donationPercentage}%는
                        스마트 컨트랙트에 하드코딩되어 있어 누구도 변경할 수 없습니다.
                    </li>
                    <li>
                        <strong>자동 전송:</strong> 당첨금 지급 시 기부금이 자동으로
                        기부 주소로 전송됩니다. 관리자도 이를 막을 수 없습니다.
                    </li>
                    <li>
                        <strong>검증 가능:</strong> 모든 기부 내역은 블록체인에
                        영구적으로 기록되어 누구나 Etherscan에서 확인할 수 있습니다.
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default DonationInfo;
