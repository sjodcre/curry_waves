"use client";

import React from 'react';
import arconnect from '../assets/arconnect.png';
import othentImage from '../assets/othent.svg';
import { getProfileByWalletAddress } from '@/lib/ProfileUtils';
import othent from '@/wallets/Othent';
import Modal from '@/components/Modal';
// import { useConnection } from 'arweave-wallet-kit';
// import { ArConnect } from 'arweavekit/auth'

// import * as S from './styles';
export enum WalletEnum {
	arConnect = 'arconnect',
	othent = 'othent'
}

export const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];


export const AR_WALLETS = [
	{ type: WalletEnum.arConnect, logo: arconnect },
	{ type: WalletEnum.othent, logo: othentImage },
];

export type VouchType = { score: number; isVouched: boolean };

interface ArweaveContextState {
	wallets: { type: WalletEnum; logo: string }[];
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	arBalance: number | null;
	// tokenBalances: { [address: string]: { profileBalance: number; walletBalance: number } } | null;
	toggleTokenBalanceUpdate: boolean;
	setToggleTokenBalanceUpdate: (toggleUpdate: boolean) => void;
	handleConnect: any;
	handleDisconnect: () => void;
	walletModalVisible: boolean;
	setWalletModalVisible: (open: boolean) => void;
	profile: ProfileHeaderType | null;
	toggleProfileUpdate: boolean;
	setToggleProfileUpdate: (toggleUpdate: boolean) => void;
	vouch: VouchType | null;
}

interface ArweaveProviderProps {
	children: React.ReactNode;
}

export type AOProfileType = {
	id: string;
	walletAddress: string;
	displayName: string | null;
	username: string | null;
	bio: string | null;
	avatar: string | null;
	banner: string | null;
	version: string | null;
};

export type ProfileHeaderType = AOProfileType;

const DEFAULT_CONTEXT: ArweaveContextState = {
	wallets: [],
	wallet: null,
	walletAddress: null,
	walletType: null,
	arBalance: null,
	// tokenBalances: null,
	toggleTokenBalanceUpdate: false,
	setToggleTokenBalanceUpdate(_toggleUpdate: boolean) {},
	handleConnect() {},
	handleDisconnect() {},
	walletModalVisible: false,
	setWalletModalVisible(_open: boolean) {},
	profile: null,
	toggleProfileUpdate: false,
	setToggleProfileUpdate(_toggleUpdate: boolean) {},
	vouch: null,
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
	return React.useContext(ARContext);
}

function WalletList(props: { handleConnect: any }) {
	return (
		<div className="h-full w-full flex items-center justify-center gap-5 flex-wrap py-5 pt-5">
			{AR_WALLETS.map((wallet: any, index: number) => (
				<button
					key={index}
					onClick={() => props.handleConnect(wallet.type)}
					className="w-[200px] flex flex-col items-center justify-center text-center p-[15px] border border-solid border-gray-300 hover:bg-gray-100"
				>
					<img src={`${wallet.logo}`} alt={''} className="w-[30px] rounded-full mb-[10px]" />
					<span className="text-gray-900 text-base font-bold font-sans">
						{wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
					</span>
				</button>
			))}
			<div className="my-[5px] mb-5 px-5 text-center">
				<span className="text-sm font-medium text-gray-600">
					Don't have an Arweave Wallet? You can create one{' '}
					<a href="https://arconnect.io" target="_blank" className="text-sm font-medium">
						here.
					</a>
				</span>
			</div>
		</div>
	);
}

export function ArweaveProvider(props: ArweaveProviderProps) {
	// const isAuthenticated = othent.isAuthenticated;

	const wallets = AR_WALLETS;

	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);
	const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
	// @ts-ignore: TS6133
	const [vouch, setVouch] = React.useState<VouchType | null>(null);
	// @ts-ignore: TS6133
	const [arBalance, setArBalance] = React.useState<number | null>(null);
	// const [tokenBalances, setTokenBalances] = React.useState<{
	// 	[address: string]: { profileBalance: number; walletBalance: number };
	// } | null>({
	// 	[AO.defaultToken]: null,
	// 	[AO.pixl]: null,
	// });
	const [toggleTokenBalanceUpdate, setToggleTokenBalanceUpdate] = React.useState<boolean>(false);

	const [profile, setProfile] = React.useState<ProfileHeaderType | null>(null);
	const [toggleProfileUpdate, setToggleProfileUpdate] = React.useState<boolean>(false);


	React.useEffect(() => {
		handleWallet();
		window.addEventListener('arweaveWalletLoaded', handleWallet);
		window.addEventListener('walletSwitch', handleWallet);

		return () => {
			window.removeEventListener('arweaveWalletLoaded', handleWallet);
			window.removeEventListener('walletSwitch', handleWallet);
		};
	// }, [connected]);
	// }, [isAuthenticated]);
	}, []);

    React.useEffect(() => {
        (async function () {
            if (wallet && walletAddress) {
                // console.log("walletAddress before fetchin profile: ", walletAddress);
                const profile = await getProfileByWalletAddress({ address: walletAddress });
                console.log("profile: ", profile);
                setProfile(profile); // Set the profile state
            }
        })();
    // }, [connected, wallet, walletAddress, walletType]);
	}, [, wallet, walletAddress, walletType]);

	// React.useEffect(() => {
	// 	(async function () {
	// 		if (walletAddress) {
	// 			try {
	// 				setArBalance(Number(await getARBalance(walletAddress)));
	// 			} catch (e: any) {
	// 				console.error(e);
	// 			}
	// 		}
	// 	})();
	// }, [walletAddress]);

	React.useEffect(() => {
		(async function () {
			if (wallet && walletAddress) {
				const fetchProfileUntilChange = async () => {
					let changeDetected = false;
					let tries = 0;
					const maxTries = 10;

					while (!changeDetected && tries < maxTries) {
						try {
							const existingProfile = profile;
							const newProfile = await getProfileByWalletAddress({ address: walletAddress });

							if (JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
								setProfile(newProfile);
								changeDetected = true;
							} else {
								await new Promise((resolve) => setTimeout(resolve, 1000));
								tries++;
							}
						} catch (error) {
							console.error(error);
							break;
						}
					}

					if (!changeDetected) {
						console.warn(`No changes detected after ${maxTries} attempts`);
					}
				};

				await fetchProfileUntilChange();
			}
		})();
	}, [toggleProfileUpdate]);

	// React.useEffect(() => {
	// 	if (walletAddress && profile && profile.id) {
	// 		const fetchDefaultTokenBalance = async () => {
	// 			try {
	// 				const defaultTokenBalance = await readHandler({
	// 					processId: AO.defaultToken,
	// 					action: 'Balance',
	// 					tags: [{ name: 'Recipient', value: profile.id }],
	// 				});
	// 				const defaultTokenWalletBalance = await readHandler({
	// 					processId: AO.defaultToken,
	// 					action: 'Balance',
	// 					tags: [{ name: 'Recipient', value: walletAddress }],
	// 				});
	// 				setTokenBalances((prevBalances) => ({
	// 					...prevBalances,
	// 					[AO.defaultToken]: {
	// 						profileBalance: defaultTokenBalance || 0,
	// 						walletBalance: defaultTokenWalletBalance || 0,
	// 					},
	// 				}));
	// 			} catch (e) {
	// 				console.error(e);
	// 			}
	// 		};

	// 		fetchDefaultTokenBalance();
	// 	} else {
	// 		setTokenBalances({
	// 			[AO.defaultToken]: { profileBalance: 0, walletBalance: 0 },
	// 			[AO.pixl]: { profileBalance: 0, walletBalance: 0 },
	// 		});
	// 	}
	// }, [walletAddress, profile, toggleTokenBalanceUpdate]);

	// React.useEffect(() => {
	// 	if (profile && profile.id) {
	// 		const fetchPixlTokenBalance = async () => {
	// 			try {
	// 				const pixlTokenBalance = await readHandler({
	// 					processId: AO.pixl,
	// 					action: 'Balance',
	// 					tags: [{ name: 'Recipient', value: profile.id }],
	// 				});
	// 				setTokenBalances((prevBalances) => ({
	// 					...prevBalances,
	// 					[AO.pixl]: { profileBalance: pixlTokenBalance || 0, walletBalance: 0 },
	// 				}));
	// 			} catch (e) {
	// 				console.error(e);
	// 			}
	// 		};

	// 		fetchPixlTokenBalance();
	// 	}
	// }, [profile, toggleTokenBalanceUpdate]);

	// React.useEffect(() => {
	// 	if (walletAddress && profile && profile.id) {
	// 		const fetchVouch = async () => {
	// 			try {
	// 				const vouch = await getVouch({ wallet, address: walletAddress });
	// 				setVouch(vouch);
	// 			} catch (e) {
	// 				console.error(e);
	// 			}
	// 		};

	// 		fetchVouch();
	// 	}
	// }, [walletAddress, profile]);

	async function handleWallet() {
		if (localStorage.getItem('walletType')) {
			try {
				setProfile(null);
				await handleConnect(localStorage.getItem('walletType') as any);
			} catch (e: any) {
				console.error(e);
			}
		}
	}

	// async function handleWallet() {
    //     // console.log("handleWallet localStorage.getItem('walletType'): ", localStorage.getItem('walletType'));
	// 	if (localStorage.getItem('wallet_kit_strategy_id')) {
    //     // console.log("handleWallet connected: ", connected);
    //     // if(connected) {

	// 		try {
	// 			// await handleConnect(localStorage.getItem('walletType') as any);
	// 			await handleConnect(localStorage.getItem('wallet_kit_strategy_id') as any);
    //             // await handleConnect();

	// 		} catch (e: any) {
	// 			console.error(e);
	// 		}
	// 	}
	// }

	async function handleConnect(walletType: WalletEnum.arConnect | WalletEnum.othent) {
   	// async function handleConnect() {
		let walletObj: any = null;
		switch (walletType) {
			case WalletEnum.arConnect:
				handleArConnect();
				break;
			case WalletEnum.othent:
				handleOthent();
				break;
			default:
				if (window.arweaveWallet || walletType === WalletEnum.arConnect) {
					handleArConnect();
					break;
				}
		}
		setWalletModalVisible(false);
		return walletObj;
        // let walletObj: any = null;
        // handleArConnect();
    
		// setWalletModalVisible(false);
		// return walletObj;
	}

	async function handleArConnect() {
		console.log("handleArConnect walletAddress: ", walletAddress);
		if (!walletAddress) {
			console.log("window arweaveWallet: ", window.arweaveWallet);
			// if (window.arweaveWallet && connected) {
			if (window.arweaveWallet) {
				try {
					await global.window?.arweaveWallet?.connect(WALLET_PERMISSIONS as any);
					setWalletAddress(await global.window.arweaveWallet.getActiveAddress());
					setWallet(window.arweaveWallet);
					setWalletType(WalletEnum.arConnect);
					setWalletModalVisible(false);
					localStorage.setItem('walletType', WalletEnum.arConnect);
				} catch (e: any) {
					console.error(e);
				}
			}
		}
	}

	// async function handleOthent() {
	// 	try {
	// 		const othentConnection = await connect();
	// 		const address = othentConnection.walletAddress;
	// 		setWallet(Othent);
	// 		setWalletAddress(address);
	// 		setWalletType(WalletEnum.othent);
	// 		localStorage.setItem('walletType', WalletEnum.othent);
	// 	} catch (e: any) {
	// 		console.error(e);
	// 	}
	// }

	async function handleOthent() {
		try {
			// Check if the user is already authenticated
			// await global.window?.arweaveWallet?.connect(WALLET_PERMISSIONS as any);
			// console.log("othent.isAuthenticated", othent.isAuthenticated)
			if (!othent.isAuthenticated) {
				// Prompt user to authenticate
				await othent.connect();
			}
			// console.log("othent.isAuthenticated after", othent.isAuthenticated)
			console.log("othent", othent)
			// await othent.requireAuth();
			// await othent.requireAuth();

			// Obtain the user's wallet address:
			const address = await othent.getActiveAddress();
			
			console.log(`Your wallet address is ${ address }.`);
			// Retrieve the user's wallet address
			// const address = await othent.getActiveAddress();
			// Set wallet and address in your application's state
			setWallet(othent);
			setWalletAddress(address);
			setWalletType(WalletEnum.othent);
			localStorage.setItem('walletType', WalletEnum.othent);
	
			console.log('User connected:', address);
		} catch (error) {
			console.error('Error connecting to Othent:', error);
		}
	}

	async function handleDisconnect() {
		if (localStorage.getItem('walletType')) localStorage.removeItem('walletType');
		if (walletType === WalletEnum.othent) {
			await othent.disconnect();
		} else {
			await global.window?.arweaveWallet?.disconnect();
		}
		setWallet(null);
		setWalletAddress(null);
		setProfile(null);
	}

	// async function getARBalance(walletAddress: string) {
	// 	const rawBalance = await fetch(getARBalanceEndpoint(walletAddress));
	// 	const jsonBalance = await rawBalance.json();
	// 	const balance = jsonBalance / 1e12;
	// 	return balance.toFixed(12);
	// }

	return (
		<>
			{walletModalVisible && (
				<Modal header='Connect Wallet' handleClose={() => setWalletModalVisible(false)}>
					<WalletList handleConnect={handleConnect} />
				</Modal>
			)}
			<ARContext.Provider
				value={{
					wallet,
					walletAddress,
					walletType,
					arBalance,
					toggleTokenBalanceUpdate,
					setToggleTokenBalanceUpdate,
					handleConnect,
					handleDisconnect,
					wallets,
					walletModalVisible,
					setWalletModalVisible,
					profile,
					toggleProfileUpdate,
					setToggleProfileUpdate,
					vouch,
				}}
			>
				{props.children}
			</ARContext.Provider>
		</>
	);
}
