import { ubitTestnet } from "@/config/chains";
import { LOCAL_DEV_MODE, contractAddresses } from "@/config/constants";
import { townSquareAbi } from "@/generated";
import axios from "axios";
import {
  Address,
  createWalletClient,
  erc20Abi,
  getContract,
  http,
  publicActions,
  verifyMessage,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import { localhost, sepolia } from "viem/chains";

const signer = process.env.PRIVATE_KEY
  ? privateKeyToAccount(process.env.PRIVATE_KEY as Address)
  : mnemonicToAccount(process.env.MNEMONIC ?? "");

const acceptedChains = [ubitTestnet, sepolia];

async function fetchTokenDetails(
  chainId: number,
  address: Address
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> {
  if (!acceptedChains.map((chain) => chain.id).includes(chainId)) {
    return {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
    };
  }

  const response = await axios.get(
    acceptedChains.find((chain) => chain.id === chainId)?.blockExplorers
      ?.default.apiUrl ?? "",
    {
      params: { module: "token", action: "getToken", contractaddress: address },
    }
  );

  if (response.status !== 200 || !response.data.result) {
    throw "Error getting token details";
  }

  const tokenInfo = response.data.result;
  return tokenInfo;
}

export async function POST(
  req: Request,
  { params }: { params: { spaceId: string; proposalId: string } }
) {
  const body = await req.json();
  const spaceId = BigInt(params.spaceId);
  const proposalId = BigInt(params.proposalId);
  const chainId = Number(body.chainId);
  const choiceIndex = body.choiceIndex;
  const signature = body.signature;
  const user = body.address;

  const message = `Sign this message to confirm your vote

Space ID: ${spaceId}
Proposal ID: ${proposalId}
Choice index: ${choiceIndex}`;

  console.log(message);

  if (!verifyMessage({ message, signature, address: user })) {
    return Response.json({ error: "Invalid signature" }, { status: 403 });
  }

  if (!contractAddresses[chainId]) {
    return Response.json({ error: "Invalid chain ID" }, { status: 403 });
  }

  const publicClient = createWalletClient({
    account: signer,
    chain: (LOCAL_DEV_MODE
      ? [localhost, ...acceptedChains]
      : acceptedChains
    ).find((chain) => chain.id === chainId),
    transport: http(),
  }).extend(publicActions);

  const townSquare = getContract({
    abi: townSquareAbi,
    client: publicClient,
    address: contractAddresses[chainId] ?? "",
  });

  const [, , tokenId] =
    (await townSquare.read.getSpaceExternal([spaceId])) ?? [];

  const [, , , , , snapshot, choices] =
    (await townSquare.read.getSpaceProposal([spaceId, proposalId])) ?? [];

  if (choiceIndex >= choices.length) {
    return Response.json({ error: "Invalid choice index" }, { status: 403 });
  }

  const hasVoted =
    (await townSquare.read.hasVoted([spaceId, proposalId, user])) ?? [];

  if (hasVoted) {
    return Response.json(
      { error: "User has already voted on this proposal" },
      { status: 409 }
    );
  }

  const token = await fetchTokenDetails(chainId, tokenId);
  const tokenContract = getContract({
    abi: erc20Abi,
    client: publicClient,
    address: tokenId,
  });
  const balance = await tokenContract.read.balanceOf([user], {
    blockNumber: snapshot,
  });

  const votingPower = balance / 10n ** BigInt(token.decimals);

  if (votingPower <= 0) {
    return Response.json(
      { error: "No voting power available for user" },
      { status: 403 }
    );
  }

  await townSquare.write.voteOnProposal([
    spaceId,
    proposalId,
    user,
    choiceIndex,
    votingPower,
  ]);

  return Response.json(
    { message: "Vote created successfully" },
    { status: 201 }
  );
}
