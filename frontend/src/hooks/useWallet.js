// ============================================
// useWallet 커스텀 훅
// ============================================
// 이 훅은 MetaMask 지갑 연결을 관리합니다.
//
// 커스텀 훅이란?
// - React의 상태(state)와 기능을 재사용 가능하게 패키징한 함수입니다.
// - use로 시작하는 이름을 가집니다.
// - 여러 컴포넌트에서 같은 로직을 공유할 수 있습니다.

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../utils/constants';

export function useWallet() {
    // ========================================
    // 상태 변수 (State Variables)
    // ========================================
    // useState는 React에서 상태를 관리하는 훅입니다.
    // [현재값, 값을변경하는함수] = useState(초기값)

    const [account, setAccount] = useState(null);           // 연결된 지갑 주소
    const [provider, setProvider] = useState(null);         // ethers.js Provider (블록체인 읽기)
    const [signer, setSigner] = useState(null);             // ethers.js Signer (트랜잭션 서명)
    const [chainId, setChainId] = useState(null);           // 현재 연결된 체인 ID
    const [isConnecting, setIsConnecting] = useState(false); // 연결 중 상태
    const [error, setError] = useState(null);               // 에러 메시지

    // ========================================
    // 지갑 연결 함수
    // ========================================
    // useCallback은 함수를 메모이제이션합니다.
    // 컴포넌트가 리렌더링되어도 같은 함수 참조를 유지합니다.

    const connectWallet = useCallback(async () => {
        // 1. MetaMask 설치 확인
        // window.ethereum은 MetaMask가 주입하는 객체입니다.
        if (!window.ethereum) {
            setError("MetaMask가 설치되어 있지 않습니다. 설치해주세요!");
            return false;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // 2. 사용자에게 지갑 연결 요청
            // eth_requestAccounts: MetaMask 연결 팝업을 띄웁니다
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // 3. 현재 체인 ID 확인
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId'
            });

            // 4. Sepolia 테스트넷인지 확인
            if (currentChainId !== NETWORK_CONFIG.chainId) {
                // Sepolia가 아니면 네트워크 변경 요청
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: NETWORK_CONFIG.chainId }]
                    });
                } catch (switchError) {
                    // 네트워크가 없으면 추가 요청
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: NETWORK_CONFIG.chainId,
                                chainName: NETWORK_CONFIG.chainName,
                                rpcUrls: NETWORK_CONFIG.rpcUrls,
                                blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls
                            }]
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            // 5. ethers.js Provider와 Signer 설정
            // Provider: 블록체인에서 데이터를 읽는 객체
            // Signer: 트랜잭션에 서명하는 객체 (지갑 연결 필요)
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const web3Signer = await web3Provider.getSigner();

            // 6. 상태 업데이트
            setAccount(accounts[0]);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setChainId(NETWORK_CONFIG.chainId);

            console.log("✅ 지갑 연결 성공:", accounts[0]);
            return true;

        } catch (err) {
            console.error("❌ 지갑 연결 실패:", err);
            setError(err.message || "지갑 연결에 실패했습니다.");
            return false;

        } finally {
            setIsConnecting(false);
        }
    }, []);

    // ========================================
    // 지갑 연결 해제 함수
    // ========================================
    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        console.log("👋 지갑 연결 해제됨");
    }, []);

    // ========================================
    // 이벤트 리스너 설정
    // ========================================
    // useEffect는 컴포넌트가 마운트될 때 실행됩니다.
    // MetaMask 이벤트를 감지하여 상태를 업데이트합니다.

    useEffect(() => {
        if (!window.ethereum) return;

        // 계정 변경 감지
        // 사용자가 MetaMask에서 다른 계정으로 전환했을 때
        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                // 모든 계정 연결 해제됨
                disconnectWallet();
            } else if (accounts[0] !== account) {
                // 다른 계정으로 전환됨
                setAccount(accounts[0]);
                console.log("🔄 계정 변경됨:", accounts[0]);
            }
        };

        // 체인 변경 감지
        // 사용자가 MetaMask에서 다른 네트워크로 전환했을 때
        const handleChainChanged = (newChainId) => {
            console.log("🔄 네트워크 변경됨:", newChainId);
            setChainId(newChainId);

            // Sepolia가 아니면 경고
            if (newChainId !== NETWORK_CONFIG.chainId) {
                setError("Sepolia 테스트넷으로 전환해주세요!");
            } else {
                setError(null);
            }
        };

        // 이벤트 리스너 등록
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // 클린업 함수: 컴포넌트 언마운트 시 리스너 제거
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [account, disconnectWallet]);

    // ========================================
    // 자동 연결 시도
    // ========================================
    // 페이지 로드 시 이미 연결된 계정이 있는지 확인
    useEffect(() => {
        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    // eth_accounts는 연결 팝업 없이 이미 연결된 계정만 반환
                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts'
                    });

                    if (accounts.length > 0) {
                        // 이미 연결된 계정이 있으면 자동 설정
                        const web3Provider = new ethers.BrowserProvider(window.ethereum);
                        const web3Signer = await web3Provider.getSigner();
                        const currentChainId = await window.ethereum.request({
                            method: 'eth_chainId'
                        });

                        setAccount(accounts[0]);
                        setProvider(web3Provider);
                        setSigner(web3Signer);
                        setChainId(currentChainId);

                        console.log("🔄 자동 연결됨:", accounts[0]);
                    }
                } catch (err) {
                    console.error("자동 연결 확인 실패:", err);
                }
            }
        };

        checkConnection();
    }, []);

    // ========================================
    // 훅에서 반환하는 값들
    // ========================================
    // 이 값들을 컴포넌트에서 사용할 수 있습니다.
    return {
        account,          // 연결된 지갑 주소
        provider,         // ethers Provider
        signer,           // ethers Signer
        chainId,          // 현재 체인 ID
        isConnecting,     // 연결 중 여부
        error,            // 에러 메시지
        connectWallet,    // 지갑 연결 함수
        disconnectWallet, // 지갑 연결 해제 함수
        isConnected: !!account,  // 연결 여부 (불리언)
        isCorrectNetwork: chainId === NETWORK_CONFIG.chainId  // Sepolia 연결 여부
    };
}
