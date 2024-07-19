"use client";

import SpacesList from "@/components/SpacesList";
import TextInput from "@/components/TextInput";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Spaces() {
  const [search, setSearch] = useState('');
	const { isConnected } = useAccount();

	return (
		<>
			<div className="flex flex-wrap lg:flex-nowrap items-center gap-x-5 gap-y-2 mb-4 md:mb-6 lg:mb-8">
				<TextInput
					label="Search"
					value={search}
					onUserInput={setSearch}
					containerClassName="w-full lg:w-auto grow "
				/>
			</div>
			{
				!isConnected ? (
					<div className="flex flex-col gap-4 justify-center items-center h-96">
							<h2 className="text-2xl font-semibold mb-2">Connect your wallet to see spaces</h2>
							<p className="text-gray-500">Connect your wallet to see spaces you can join</p>
							<ConnectButton />
					</div>
				) : (
					<SpacesList query={search} />
				)
			}
		</>
	);
}
