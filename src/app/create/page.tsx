"use client";

import { Block } from '@/components/Block';
import { ProfileDetailsSettingsBlock } from '@/components/ProfileDetailsSettingsBlock';
import { useClient } from '@/hooks/client';
import { UserSpacesContext } from '@/providers/UserSpacesContext';
import { useRouter } from 'next/navigation';
import { useCallback, useContext } from 'react';
import { Address } from 'viem';

export default function CreateSpace ()  {
	const client = useClient();
  const router = useRouter();
	const { userSpaces, setUserSpaces } = useContext(UserSpacesContext);
	const createSpace = useCallback(
		async ({
			name,
			about,
			avatar,
			website,
			token,
		}: {
			name: string;
			about: string;
			avatar: string;
			website: string;
			token: Address;
		}) => {
			const space = await client?.createSpace(name, about, token, avatar, website);
			setUserSpaces([...userSpaces, space]);
			router.replace('/space/' + space.id);
		},
		[client, router, setUserSpaces, userSpaces]
	);
	return (
		<div className="flex flex-wrap lg:flex-nowrap gap-4">
			<div className="order-2 w-full lg:order-none lg:w-8/12 space-y-3 md:space-y-6">
				<h1>Create a space</h1>
				<ProfileDetailsSettingsBlock onSubmit={createSpace} />
			</div>
			<div className="w-full order-1 lg:order-none lg:w-4/12 mb-4 lg:mb-0">
				<Block className="text-skin-muted">
					<div className="leading-relaxed">
						Don&apos;t know how to create a space? Learn more in the{' '}
						<a target="_blank" rel="noreferrer" className="text-skin-primary" href="http://">
							documentation
						</a>{' '}
						or join our{' '}
						<a target="_blank" rel="noreferrer" className="text-skin-primary" href="http://">
							Discord
						</a>
					</div>
				</Block>
			</div>
		</div>
	);
};
