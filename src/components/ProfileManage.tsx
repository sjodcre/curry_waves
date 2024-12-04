import React from 'react';

import { connect, createDataItemSigner, message, result } from '@permaweb/aoconnect';

import { ArweaveWebIrys } from '@irys/sdk/build/esm/web/tokens/arweave';


import Arweave from 'arweave';

import {
	User,
	Image
  } from "lucide-react";

import { cn, GATEWAYS, getGQLData } from '@/lib/utils';

import { AO } from 'helpers/config';
// import { getTxEndpoint } from 'helpers/endpoints';
// import { NotificationType } from 'helpers/types';
// import { WalletBlock } from 'wallet/WalletBlock';


import { ProfileHeaderType, useArweaveProvider } from '@/context/ProfileContext';
import { Button } from './ui/button';
import { FormControl, FormItem, FormLabel } from './ui/form';

const MAX_BIO_LENGTH = 500;
const MAX_IMAGE_SIZE = 100000;
const ALLOWED_BANNER_TYPES = 'image/png, image/jpeg, image/gif';
const ALLOWED_AVATAR_TYPES = 'image/png, image/jpeg, image/gif';


export type NotificationType = {
	message: string;
	status: 'success' | 'warning';
};


export function getTagValue(list: { [key: string]: any }[], name: string): string | undefined {
	for (let i = 0; i < list.length; i++) {
		if (list[i]) {
			if (list[i]!.name === name) {
				return list[i]!.value as string;
			}
		}
	}
	return undefined;
}

export async function messageResult(args: {
	processId: string;
	wallet: any;
	action: string;
	tags: TagType[] | null;
	data: any;
	useRawData?: boolean;
}): Promise<any> {
	try {
		const tags = [{ name: 'Action', value: args.action }];
		if (args.tags) tags.push(...args.tags);

		const data = args.useRawData ? args.data : JSON.stringify(args.data);

		const txId = await message({
			process: args.processId,
			signer: createDataItemSigner(args.wallet),
			tags: tags,
			data: data,
		});

		const { Messages } = await result({ message: txId, process: args.processId });

		if (Messages && Messages.length) {
			const response: { [key: string]: any } = {};

			Messages.forEach((message: any) => {
				const action = getTagValue(message.Tags, 'Action') || args.action;

				let responseData = null;
				const messageData = message.Data;

				if (messageData) {
					try {
						responseData = JSON.parse(messageData);
					} catch {
						responseData = messageData;
					}
				}

				const responseStatus = getTagValue(message.Tags, 'Status');
				const responseMessage = getTagValue(message.Tags, 'Message');

				response[action] = {
					id: txId,
					status: responseStatus,
					message: responseMessage,
					data: responseData,
				};
			});

			return response;
		} else return null;
	} catch (e) {
		console.error(e);
	}
}

export type UploadMethodType = 'default' | 'turbo';

export function getByteSize(input: string | Buffer): number {
	let sizeInBytes: number;
	if (Buffer.isBuffer(input)) {
		sizeInBytes = input.length;
	} else if (typeof input === 'string') {
		sizeInBytes = Buffer.byteLength(input, 'utf-8');
	} else {
		throw new Error('Input must be a string or a Buffer');
	}

	return sizeInBytes;
}

export const CONTENT_TYPES = {
	json: 'application/json',
	mp4: 'video/mp4',
	textPlain: 'text/plain',
};

export const UPLOAD_CONFIG = {
	node1: 'https://up.arweave.net',
	node2: 'https://turbo.ardrive.io',
	batchSize: 1,
	chunkSize: 7500000,
	dispatchUploadSize: 100 * 1024,
};

export async function createTransaction(args: {
	content: any;
	contentType: string;
	tags: TagType[];
	uploadMethod?: UploadMethodType;
	useWindowDispatch?: boolean;
}) {
	let finalContent: any;
	switch (args.contentType) {
		case CONTENT_TYPES.json as any:
			finalContent = JSON.stringify(args.content);
			break;
		default:
			finalContent = args.content;
			break;
	}

	const contentSize: number = getByteSize(finalContent);

	if (contentSize < Number(UPLOAD_CONFIG.dispatchUploadSize)) {
		const txRes = await Arweave.init({}).createTransaction({ data: finalContent }, 'use_wallet');
		args.tags.forEach((tag: TagType) => txRes.addTag(tag.name, tag.value));
		// const response = args.useWindowDispatch ? await global.window.arweaveWallet.dispatch(txRes) : await dispatch(txRes);
		//TODO FOR OTHENT	
		const response = await global.window.arweaveWallet.dispatch(txRes);

		return response.id;
	} else {
		try {
			const uploadUrl = args.uploadMethod && args.uploadMethod === 'turbo' ? UPLOAD_CONFIG.node2 : UPLOAD_CONFIG.node1;
			const irys = new ArweaveWebIrys({
				url: uploadUrl,
				wallet: { provider: global.window.arweaveWallet },
			});
			await irys.ready();

			if (args.contentType.includes('image') || args.contentType.includes('video')) {
				const uploader = irys.uploader.chunkedUploader;
				uploader.setBatchSize(UPLOAD_CONFIG.batchSize);
				uploader.setChunkSize(UPLOAD_CONFIG.chunkSize);

				uploader.on('chunkUpload', (chunkInfo: any) => {
					console.log(`Upload status: ${Math.floor((chunkInfo.totalUploaded / contentSize) * 100)}%`);
				});

				uploader.on('chunkError', (e: any) => {
					console.error(`Upload error: ${e}`);
				});

				const response = await uploader.uploadData(finalContent as any, { tags: args.tags } as any);
				return response.data.id;
			} else {
				const response = await irys.upload(finalContent as any, { tags: args.tags } as any);
				return response.id;
			}
		} catch (e: any) {
			throw new Error(e);
		}
	}
}

export function getDataURLContentType(dataURL: string) {
	const result = dataURL.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
	return result ? result[1] : null;
}

export function getTxEndpoint(txId: string) {
	return `${'https://arweave.net'}/${txId}`;
}

export function getBase64Data(dataURL: string) {
	return dataURL.split(',')[1];
}

export interface IProps {
	profile: ProfileHeaderType | null;
	handleClose: (handleUpdate: boolean) => void;
	handleUpdate: () => void;
}

export function checkValidAddress(address: string | null) {
	if (!address) return false;
	return /^[a-z0-9_-]{43}$/i.test(address);
}

export default function ProfileManage(props: IProps) {
	const arProvider = useArweaveProvider();

	const bannerInputRef = React.useRef<any>(null);
	const avatarInputRef = React.useRef<any>(null);

	const [name, setName] = React.useState<string>('');
	const [username, setUsername] = React.useState<string>('');
	const [bio, setBio] = React.useState<string | null>('');
	const [banner, setBanner] = React.useState<string | null>(null);
	const [avatar, setAvatar] = React.useState<string | null>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [profileResponse, setProfileResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (props.profile) {
			setUsername(props.profile.username || '');
			setName(props.profile.displayName || '');
			setBio(props.profile.bio || '');
			setBanner(props.profile.banner && checkValidAddress(props.profile.banner) ? props.profile.banner : null);
			setAvatar(props.profile.avatar && checkValidAddress(props.profile.avatar) ? props.profile.avatar : null);
		}
	}, [props.profile]);

	// TODO: handleUpdate is not used
	function handleUpdate() {
		arProvider.setToggleProfileUpdate(!arProvider.toggleProfileUpdate);
		if (props.handleUpdate) props.handleUpdate();
	}

	interface IProfileData {
		DisplayName?: string;
		UserName?: string;
		Description?: string;
		CoverImage?: string;
		ProfileImage?: string;
	}
	async function handleSubmit() {
		if (arProvider.wallet) {
			setLoading(true);

			const data: IProfileData = {};

			let bannerTx: any = null;
			if (banner) {
				if (checkValidAddress(banner)) {
					bannerTx = banner;
				} else {
					try {
						const bannerContentType = getDataURLContentType(banner);
						if (!bannerContentType) {
							throw new Error('Invalid banner content type');
						}
						const base64Data = getBase64Data(banner);
						const bufferData = Buffer.from(base64Data, 'base64');

						bannerTx = await createTransaction({
							content: bufferData,
							contentType: bannerContentType,
							tags: [{ name: 'Content-Type', value: bannerContentType }],
							useWindowDispatch: true,
							//TODO FOR OTHENT
							// useWindowDispatch: arProvider.walletType !== 'othent',
						});
						console.log('bannerTx', bannerTx);
					} catch (e: any) {
						console.error(e);
					}
				}
			}

			let avatarTx: any = null;
			if (avatar) {
				if (checkValidAddress(avatar)) {
					avatarTx = avatar;
				} else {
					try {
						const avatarContentType = getDataURLContentType(avatar);
						if (!avatarContentType) {
							throw new Error('Invalid avatar content type');
						}
						const base64Data = getBase64Data(avatar);
						const bufferData = Buffer.from(base64Data, 'base64');

						avatarTx = await createTransaction({
							content: bufferData,
							contentType: avatarContentType,
							tags: [{ name: 'Content-Type', value: avatarContentType }],
							//TODO FOR OTHENT
							// useWindowDispatch: arProvider.walletType !== 'othent',
							useWindowDispatch: true,
						});
						console.log('avatarTx', avatarTx);
					} catch (e: any) {
						console.error(e);
					}
				}
			}
			// send undefined
			const getFieldDataChanged = (profileValue: string | null, newValue: string | null) => {
				// if new is '' and profilevalue is not empty, then clear
				if ((newValue === '' || newValue == null) && Boolean(profileValue)) {
					return '';
				}
				if (profileValue !== newValue && typeof newValue === 'string' && newValue.length > 0) {
					return newValue;
				} else {
					return undefined;
				}
			};
			// either send undefined if no change, or '' if clear, or a value.
			data.UserName = getFieldDataChanged(props.profile?.username ?? null, username);
			data.DisplayName = getFieldDataChanged(props.profile?.displayName ?? null, name);
			data.CoverImage = getFieldDataChanged(props.profile?.banner ?? null, bannerTx);
			data.ProfileImage = getFieldDataChanged(props.profile?.avatar ?? null, avatarTx);
			data.Description = getFieldDataChanged(props.profile?.bio ?? null, bio);

			try {
				if (props.profile && props.profile.id) {
					let updateResponse = await messageResult({
						processId: props.profile.id,
						action: 'Update-Profile',
						tags: [{ name: 'ProfileProcess', value: props.profile.id }],
						data: data,
						wallet: arProvider.wallet,
					});
					if (updateResponse && updateResponse['Profile-Success']) {
						setProfileResponse({
							message: `${'Profile updated'}!`,
							status: 'success',
						});
						handleUpdate();
					} else {
						console.log(updateResponse);
						setProfileResponse({
							message: 'Error updating profile',
							status: 'warning',
						});
					}
				} else {
					const aos = connect();

					let processSrc = null;
					try {
						const processSrcFetch = await fetch(getTxEndpoint(AO.profileSrc));
						if (processSrcFetch.ok) {
							processSrc = await processSrcFetch.text();

							const dateTime = new Date().getTime().toString();

							const profileTags: { name: string; value: string }[] = [
								{ name: 'Date-Created', value: dateTime },
								{ name: 'Action', value: 'Create-Profile' },
							];

							console.log('Spawning profile process...');
							const processId = await aos.spawn({
								module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
								scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
								signer: createDataItemSigner(arProvider.wallet),
								tags: profileTags,
								data: JSON.stringify(data),
							});

							console.log(`Process Id -`, processId);

							console.log('Fetching profile process...');
							let fetchedAssetId: string | undefined = undefined;
							let retryCount: number = 0;
							while (fetchedAssetId === undefined) {
								await new Promise((r) => setTimeout(r, 2000));
								const gqlResponse = await getGQLData({
									gateway: GATEWAYS.goldsky,
									ids: [processId],
									tagFilters: null,
									owners: null,
									cursor: null,
								});

								if (gqlResponse && gqlResponse.data.length) {
									console.log(`Fetched transaction -`, gqlResponse.data[0].node.id);
									fetchedAssetId = gqlResponse.data[0].node.id;
								} else {
									console.log(`Transaction not found -`, processId);
									retryCount++;
									if (retryCount >= 200) {
										throw new Error(`Profile not found, please try again`);
									}
								}
							}
							if (fetchedAssetId) {
								console.log('Sending source eval...');
								const evalMessage = await aos.message({
									process: processId,
									signer: createDataItemSigner(arProvider.wallet),
									tags: [{ name: 'Action', value: 'Eval' }],
									data: processSrc,
								});

								console.log(evalMessage);

								const evalResult = await aos.result({
									message: evalMessage,
									process: processId,
								});

								console.log(evalResult);

								await new Promise((r) => setTimeout(r, 1000));

								console.log('Updating profile data...');
								let updateResponse = await messageResult({
									processId: processId,
									action: 'Update-Profile',
									tags: null,
									data: data,
									wallet: arProvider.wallet,
								});

								if (updateResponse && updateResponse['Profile-Success']) {
									setProfileResponse({
										message: `${'Profile Created'}!`,
										status: 'success',
									});
									handleUpdate();
								} else {
									console.log(updateResponse);
									// setProfileResponse(language.errorUpdatingProfile);
									setProfileResponse({
										message: 'Error updating profile',
										status: 'warning',
									});
								}
							} else {
								setProfileResponse({
									message: 'Error updating profile',
									status: 'warning',
								});
							}
						}
					} catch (e: any) {
						console.error(e);
						setProfileResponse({
							message: e.message ?? 'Error updating profile',
							status: 'warning',
						});
					}
				}
			} catch (e: any) {
				setProfileResponse(e.message ?? e);
			}
			setLoading(false);
		}
	}

	function getImageSizeMessage() {
		if (!avatar && !banner) return null;
		if (checkValidAddress(avatar) && checkValidAddress(banner)) return null;

		const avatarSize = avatar ? (avatar.length * 3) / 4 : 0;
		const bannerSize = banner ? (banner.length * 3) / 4 : 0;

		if (avatarSize > MAX_IMAGE_SIZE || bannerSize > MAX_IMAGE_SIZE)
			return <span>One or more images exceeds max size of 100KB</span>;
		return null;
	}

	function getInvalidBio() {
		if (bio && bio.length > MAX_BIO_LENGTH) {
			return {
				status: true,
				message: `${'Max Chars Reached'} (${bio.length} / ${MAX_BIO_LENGTH})`,
			};
		}
		return { status: false, message: null };
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'banner':
								setBanner(event.target.result as any);
								break;
							case 'avatar':
								setAvatar(event.target.result as any);
								break;
							default:
								break;
						}
					}
				};

				reader.readAsDataURL(file);
			}
			e.target.value = '';
		}
	}

	function getBannerWrapper() {
		if (banner) return <img src={checkValidAddress(banner) ? getTxEndpoint(banner) : banner} />;
		return (
			<>
				{/* <ReactSVG src={ASSETS.media} /> */}
				<Image size={20} />
				<span>{'Upload Banner'}</span>
			</>
		);
	}

	function getAvatarWrapper() {
		if (avatar) return <img src={checkValidAddress(avatar) ? getTxEndpoint(avatar) : avatar} />;
		return (
			<>
				{/* <ReactSVG src={ASSETS.user} /> */}
				<User size={20} />
				<span>{'Upload Avatar'}</span>
			</>
		);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return ;
		else {
			return (
				<>
					<div>
						<div className="flex justify-center flex-wrap gap-2.5 p-5">
							<div className="h-fit min-w-[500px] w-[calc(50%-20px)] flex-1 md:min-w-0 md:w-full md:flex-none">
								<div className="w-full relative">
									<button
										onClick={() => bannerInputRef.current.click()}
										disabled={loading}
										className={`
											h-[200px] w-full rounded-lg overflow-hidden
											${banner !== null 
												? 'relative hover:cursor-pointer after:content-[""] after:absolute after:h-[200px] after:w-full after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-black/20 after:rounded-lg after:opacity-0 hover:after:opacity-100 focus:after:opacity-100'
												: 'border border-dashed border-gray-300 hover:bg-gray-50'
											}
											disabled:bg-gray-100 disabled:border disabled:border-dashed disabled:border-gray-200
											[&>span]:text-gray-500 [&>span]:text-xs [&>span]:font-bold
											hover:[&>span]:text-gray-700 disabled:[&>span]:text-gray-400
											[&>svg]:h-[35px] [&>svg]:w-[35px] [&>svg]:mb-[10px] [&>svg]:stroke-gray-500
											hover:[&>svg]:stroke-gray-700 disabled:[&>svg]:stroke-gray-400
											[&>img]:h-[200px] [&>img]:w-full [&>img]:object-cover
										`}
									>
										{getBannerWrapper()}
									</button>
									<input
										ref={bannerInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'banner')}
										disabled={loading}
										accept={ALLOWED_BANNER_TYPES}
									/>
									<button
										onClick={() => avatarInputRef.current.click()}
										disabled={loading}
										className={`
											h-[115px] w-[115px] absolute -bottom-[55px] left-[20px] z-[1] overflow-hidden rounded-full
											${avatar !== null
												? 'relative hover:cursor-pointer after:content-[""] after:absolute after:h-full after:w-full after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-black/20 after:rounded-lg after:opacity-0 hover:after:opacity-100 focus:after:opacity-100'
												: 'bg-white border border-dashed border-gray-300 hover:bg-gray-50'
											}
											disabled:bg-gray-100 disabled:border disabled:border-dashed disabled:border-gray-200
											[&>span]:text-gray-500 [&>span]:text-xs [&>span]:font-bold
											hover:[&>span]:text-gray-700 disabled:[&>span]:text-gray-400
											[&>svg]:h-[25px] [&>svg]:w-[25px] [&>svg]:mb-[5px] [&>svg]:stroke-gray-500
											hover:[&>svg]:stroke-gray-700 disabled:[&>svg]:stroke-gray-400
											[&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:rounded-full
										`}
									>
										{getAvatarWrapper()}
									</button>
									<input
										ref={avatarInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'avatar')}
										disabled={loading}
										accept={ALLOWED_AVATAR_TYPES}
									/>
								</div>
								<div className="mt-5 flex flex-wrap justify-end gap-[15px] sm:mt-20">
									<Button
										variant="destructive"
										onClick={() => setAvatar(null)}
										disabled={loading || !avatar}
									>
										Remove Avatar
									</Button>
									<Button
										variant="destructive" 
										onClick={() => setBanner(null)}
										disabled={loading || !banner}
									>
										Remove Banner
									</Button>
								</div>
								<div className="mt-[15px] flex justify-end">
									<span className="text-muted-foreground text-xs font-medium leading-normal">Images have a max size of 100KB</span>
								</div>
							</div>
							<div className="h-fit w-full [&>textarea]:!h-[280px] max-[1025px]:min-w-0 max-[1025px]:w-full max-[1025px]:flex-none">
								<div className="my-[20px] [&>*:last-child]:mt-[20px]">
									<FormItem>
										<FormLabel className="font-medium">
											{'Name'} <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<input
												type="text"
												value={name}
												onChange={(e) => setName(e.target.value)}
												disabled={loading}
												className={cn(
													"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												)}
											/>
										</FormControl>
									</FormItem>

									<FormItem>
										<FormLabel className="font-medium">
											{'Username'} <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<input
												type="text" 
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												disabled={loading}
												className={cn(
													"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												)}
											/>
										</FormControl>
									</FormItem>
								</div>
								<FormItem>
									<FormLabel className="font-medium">
										Bio
									</FormLabel>
									<FormControl>
										<textarea
											value={bio || ''}
											onChange={(e) => setBio(e.target.value)}
											disabled={loading}
											className={cn(
												"flex min-h-[280px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
												getInvalidBio()?.status && "border-destructive focus-visible:ring-destructive"
											)}
										/>
									</FormControl>
									{getInvalidBio()?.message && (
										<p className="text-sm font-medium text-destructive">
											{getInvalidBio()?.message}
										</p>
									)}
								</FormItem>
							</div>
							<div className="w-full flex justify-end items-center flex-wrap gap-[15px] relative">
								{(!props.profile || !props.profile.id) && loading && (
									<div className="absolute left-0">
										<span className="text-primary font-alt1 text-sm font-bold leading-normal">{`${'Creating profile'}...`}</span>
									</div>
								)}
								{props.handleClose && (
									<Button
										variant="default"
										onClick={() => props.handleClose(true)}
										disabled={loading}
									>
										Close
									</Button>
								)}
								<Button
									variant="secondary" 
									onClick={handleSubmit}
									disabled={!username || !name || loading || getImageSizeMessage() !== null}
								>
									{loading ? "Saving..." : "Save"}
								</Button>
							</div>
							<div className="w-fit ml-auto mt-5">
								{getImageSizeMessage() && (
									<span className="block bg-warning-primary text-light1 text-xxs font-bold rounded-[4px] text-center py-[2.5px] px-[12.5px] mb-[7.5px]">
										{getImageSizeMessage()}
									</span>
								)}
							</div>
						</div>
					</div>
					{profileResponse && (
						<div className={`fixed bottom-4 right-4 flex items-center gap-4 rounded-lg border p-4 shadow-lg ${profileResponse.status === 'warning' ? 'bg-warning-primary text-light1' : 'bg-background'}`}>
							<p className="text-sm">{profileResponse.message}</p>
							<Button 
								variant="ghost"
								size="sm"
								onClick={() => setProfileResponse(null)}
							>
								Dismiss
							</Button>
						</div>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
