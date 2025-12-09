// ============================================
// 🔗 WalletConnect 컴포넌트
// ============================================
// MetaMask 지갑 연결 버튼과 상태를 표시하는 컴포넌트입니다.
//
// Props (부모로부터 받는 데이터):
// - account: 연결된 지갑 주소
// - isConnecting: 연결 중 상태
// - error: 에러 메시지
// - connectWallet: 연결 함수
// - disconnectWallet: 연결 해제 함수
// - isConnected: 연결 여부
// - isCorrectNetwork: Sepolia 연결 여부

import React from 'react';

function WalletConnect({
    account,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isConnected,
    isCorrectNetwork
}) {
    // ========================================
    // 🎨 렌더링
    // ========================================
    return (
        <div className="wallet-section">
            {/* 에러 메시지 표시 */}
            {error && (
                <div className="wallet-error">
                    ⚠️ {error}
                </div>
            )}

            {/* 연결되지 않은 상태 */}
            {!isConnected && (
                <button
                    className="btn btn-connect"
                    onClick={connectWallet}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <>🔄 연결 중...</>
                    ) : (
                        <>🦊 MetaMask 지갑 연결</>
                    )}
                </button>
            )}

            {/* 연결된 상태 */}
            {isConnected && (
                <div className="wallet-info">
                    {/* 네트워크 상태 */}
                    <div className={`network-badge ${isCorrectNetwork ? 'correct' : 'wrong'}`}>
                        {isCorrectNetwork ? '✅ Sepolia' : '⚠️ 잘못된 네트워크'}
                    </div>

                    {/* 지갑 주소 표시 */}
                    <div className="account-info">
                        <span className="account-label">연결된 지갑:</span>
                        <span className="account-address">
                            {/* 주소 앞 6자리...뒤 4자리로 축약 */}
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                        {/* Etherscan 링크 */}
                        <a
                            href={`https://sepolia.etherscan.io/address/${account}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="etherscan-link"
                            title="Etherscan에서 보기"
                        >
                            🔍
                        </a>
                    </div>

                    {/* 연결 해제 버튼 */}
                    <button
                        className="btn btn-disconnect"
                        onClick={disconnectWallet}
                    >
                        연결 해제
                    </button>
                </div>
            )}

            {/* Sepolia가 아닌 경우 안내 */}
            {isConnected && !isCorrectNetwork && (
                <div className="network-warning">
                    ⚠️ Sepolia 테스트넷으로 전환해주세요!
                    <br />
                    MetaMask에서 네트워크를 Sepolia로 변경하세요.
                </div>
            )}

            {/* Sepolia ETH Faucet 안내 */}
            {isConnected && isCorrectNetwork && (
                <div className="faucet-info">
                    💡 테스트용 Sepolia ETH가 필요하신가요?{' '}
                    <a
                        href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Google Faucet에서 무료로 받기
                    </a>
                </div>
            )}
        </div>
    );
}

export default WalletConnect;
