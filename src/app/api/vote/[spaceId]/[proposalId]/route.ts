import { ubit, ubitTestnet } from "@/config/chains";
import { MAIN_CONTRACT_ADDRESS, UBITSCAN_API_URL } from "@/config/constants";
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
import { localhost } from "viem/chains";

const signer = process.env.PRIVATE_KEY
  ? privateKeyToAccount(process.env.PRIVATE_KEY as Address)
  : mnemonicToAccount(process.env.MNEMONIC ?? "");

const deploymentChain = [ubitTestnet, ubit, localhost].find(
  (c) => c.id === Number.parseInt(process.env.DEPLOYMENT_CHAIN_ID ?? "")
);
const publicClient = createWalletClient({
  account: signer,
  chain: deploymentChain,
  transport: http(),
}).extend(publicActions);

const townSquare = getContract({
  abi: townSquareAbi,
  client: publicClient,
  address: MAIN_CONTRACT_ADDRESS,
});

const ubitAPIUrl = UBITSCAN_API_URL;

async function fetchTokenDetails(address: Address): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> {
  if (deploymentChain?.id === 1337) {
    return {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
    };
  }

  const response = await axios.get(ubitAPIUrl, {
    params: { module: "token", action: "getToken", contractaddress: address },
  });

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

  const token = await fetchTokenDetails(tokenId); //TODO: Change this to what is received from request
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
