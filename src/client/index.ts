import {
  ChoiceAction,
  DetailedSpace,
  Proposal,
  ProposalState,
  Space,
  SpaceSettings,
  Token,
  Vote,
} from "@/types";
import axios from "axios";
import {
  Account,
  Address,
  Chain,
  Hex,
  PublicClient,
  WalletClient,
  erc20Abi,
  getContract,
  hexToString,
  parseEventLogs,
  stringToHex,
  zeroAddress,
  zeroHash,
} from "viem";
import { townSquareAbi } from "@/generated";
import { MAIN_CONTRACT_ADDRESS } from "@/config/constants";

type PaginationOptions = {
  first?: number;
  skip?: number;
  limit?: number;
};

type AuthorOptions = {
  author?: string;
};

export class TownsquareClient {
  private contract = getContract({
    abi: townSquareAbi,
    client: { public: this.publicClient, wallet: this.walletClient },
    address: MAIN_CONTRACT_ADDRESS,
  });

  constructor(
    private readonly ubitAPIUrl: string,
    private readonly publicClient: PublicClient,
    private readonly walletClient: WalletClient,
    private account?: Account,
    private chain?: Chain
  ) {
    if (!account) {
      this.account = publicClient.account;
    }
    if (!chain) {
      this.chain = publicClient.chain;
    }
  }

  private _cachedSpaces: { [id: string]: DetailedSpace } = {};
  private _cachedSpacesSettings: { [id: string]: SpaceSettings } = {};
  private _cachedProposals: {
    [spaceId: string]: { [proposalId: string]: Proposal };
  } = {};
  private _cachedTokens: { [id: string]: Token } = {};
  private _cachedVotes: {
    [spaceId: string]: { [proposalId: string]: { [author: string]: Vote } };
  } = {};

  private async _cacheSpaces(spaces: DetailedSpace[]): Promise<void> {
    for (const space of spaces) {
      this._cachedSpaces[space.id.toString()] = space;
    }
  }

  private async _cacheSpaceSettings(
    spaceId: bigint,
    spaceSettings: SpaceSettings
  ): Promise<void> {
    this._cachedSpacesSettings[spaceId.toString()] = spaceSettings;
  }

  private async _cacheProposals(
    spaceId: bigint,
    proposals: Proposal[]
  ): Promise<void> {
    !this._cachedProposals[spaceId.toString()] &&
      (this._cachedProposals[spaceId.toString()] = {});
    for (const proposal of proposals) {
      this._cachedProposals[spaceId.toString()][proposal.id.toString()] =
        proposal;
    }
  }

  private async _cacheVotes(
    spaceId: bigint,
    proposalId: bigint,
    votes: Vote[]
  ): Promise<void> {
    !this._cachedVotes[spaceId.toString()] &&
      (this._cachedVotes[spaceId.toString()] = {});
    !this._cachedVotes[spaceId.toString()][proposalId.toString()] &&
      (this._cachedVotes[spaceId.toString()][proposalId.toString()] = {});
    for (const vote of votes) {
      this._cachedVotes[spaceId.toString()][proposalId.toString()][
        vote.author
      ] = vote;
    }
  }

  async getProposals(
    spaceId: bigint,
    { skip = 0, limit = 10 }: PaginationOptions & AuthorOptions
  ): Promise<Proposal[]> {
    let proposals = new Array<Proposal>();
    if (
      skip + limit >
      Object.keys(this._cachedProposals[spaceId.toString()] ?? {}).length
    ) {
      try {
        const proposalCount = await this.contract.read.getSpaceProposalsCount([
          spaceId,
        ]);

        for (let i = skip; i < skip + limit && i < proposalCount; i++) {
          const proposal = await this.getProposal(spaceId, BigInt(i));
          proposal && proposals.push(proposal);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (!proposals.length) {
      proposals = Object.values(
        this._cachedProposals[spaceId.toString()]
      ).slice(skip, skip + limit);
    }
    return proposals;
  }

  async getProposal(spaceId: bigint, id: bigint): Promise<Proposal | null> {
    if (
      this._cachedProposals[spaceId.toString()] &&
      this._cachedProposals[spaceId.toString()][id.toString()] &&
      this._cachedProposals[spaceId.toString()][id.toString()].choices
    )
      return this._cachedProposals[spaceId.toString()][id.toString()];
    const [
      title,
      description,
      author,
      start,
      end,
      snapshot,
      choices,
      choicesExecutors,
      choicesData,
      votes,
    ] = await this.contract.read.getSpaceProposal([spaceId, id]);

    await this.getSpace(spaceId);

    const proposal = new Proposal({
      id,
      title,
      description,
      choices: choices.map((choice) => hexToString(choice)),
      author,
      end,
      start,
      spaceId,
      passActions: choicesExecutors.map((executor, index) => ({
        executor,
        data: choicesData[index],
        choice: choices[index],
      })),
      choicesVotesCounts: [...votes],
      state: end > Date.now() ? ProposalState.closed : ProposalState.active,
      space: this._cachedSpaces[spaceId.toString()],
      snapshot,
    });

    await this._cacheProposals(spaceId, [proposal]);
    return proposal;
  }

  async loadSpaceDescription(spaceId: bigint): Promise<void> {}

  async loadSpaceMembers(spaceId: bigint): Promise<void> {}

  async loadSpaceAdmins(spaceId: bigint): Promise<void> {
    try {
      const addresses = await this.contract.read.getSpaceAdmins([spaceId]);
      this._cachedSpaces[spaceId.toString()].admins = [...addresses];
    } catch (e) {
      console.error(e);
    }
  }

  async loadTokenDetails(address: Address): Promise<void> {
    const tokenInfo = await this.fetchTokenDetails(address);

    this._cachedTokens[address] = {
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      id: address,
    };
  }

  private async fetchTokenDetails(address: string) {
    if (this.chain?.id === 1337) {
      return {
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
      };
    }
    const response = await axios.get(this.ubitAPIUrl, {
      params: { module: "token", action: "getToken", contractaddress: address.toLowerCase() },
    });

    if (response.status !== 200 || !response.data.result) {
      throw "Error getting token details";
    }

    const tokenInfo = response.data.result;
    return tokenInfo;
  }

  private getToken(tokenId: string, decimals?: bigint): Token {
    const token = {
      ...(this._cachedTokens[tokenId] ?? {
        id: tokenId,
        name: "",
        symbol: "",
      }),
    };
    if (decimals !== undefined) {
      token.decimals = decimals;
    }
    return token;
  }

  async getSpaces({
    skip = 0,
    limit = 10,
  }: PaginationOptions & AuthorOptions): Promise<Space[]> {
    let spaces = [];

    if (skip + limit > Object.keys(this._cachedSpaces).length)
      try {
        const result = await this.contract.read.getSpaces([
          BigInt(skip),
          BigInt(limit),
        ]);

        for (let i = 0; i < result[0].length; i++) {
          const name = result[0][i];
          const tokenId = result[1][i];
          const avatar = result[2][i];
          const website = result[3][i];
          const memberCount = BigInt(result[4][i]);

          const space: DetailedSpace = {
            id: BigInt(skip + i),
            name: hexToString(name, { size: 32 }),
            avatar: hexToString(avatar, { size: 32 }),
            description: "",
            website: hexToString(website, { size: 32 }),
            members: [],
            admins: [],
            isPrivate: false,
            memberCount: memberCount,
            token: this.getToken(tokenId),
          };
          spaces.push(space);
        }
        this._cacheSpaces(spaces);
      } catch (e) {
        console.error(e);
      }
    if (!spaces.length)
      spaces = Object.keys(this._cachedSpaces)
        .slice(skip, skip + limit)
        .map((id) => this._cachedSpaces[id]);
    return spaces;
  }

  // TODO: Remove this from the contract and use a subgraph or other indexing service instead
  async getUserSpaces(): Promise<Space[]> {
    let spaces = [];

    if (this.account?.address)
      try {
        const result = await this.contract.read.getUserSpaces([
          this.account.address,
        ]);

        for (let i = 0; i < result[0].length; i++) {
          const id = BigInt(result[0][i]);
          const name = result[1][i];
          const avatar = result[2][i];

          const space: Space = {
            id: id,
            name: hexToString(name, { size: 32 }),
            avatar: hexToString(avatar, { size: 32 }),
            isPrivate: false,
            memberCount: 0n,
            token: {
              decimals: 0n,
              id: "0x",
              name: "",
              symbol: "",
            },
          };
          spaces.push(space);
        }
      } catch (e) {
        console.error(e);
      }

    return spaces;
  }

  async getSpace(
    id: bigint,
    recache: boolean = false
  ): Promise<DetailedSpace | null> {
    if (
      !recache &&
      this._cachedSpaces[id.toString()] &&
      this._cachedSpaces[id.toString()].description
    )
      return this._cachedSpaces[id.toString()];

    const [name, description, token, avatar, website, memberCount, decimals] =
      await this.contract.read.getSpaceExternal([id]);

    await this.loadTokenDetails(token);
    const owner = await this.contract.read.getSpaceOwner([id]);

    const space: DetailedSpace = {
      id,
      name: hexToString(name, { size: 32 }),
      description,
      avatar: hexToString(avatar, { size: 32 }),
      website: hexToString(website, { size: 32 }),
      members: [],
      admins: [],
      isPrivate: false,
      memberCount: memberCount,
      token: this.getToken(token, decimals),
      owner,
    };
    await this._cacheSpaces([space]);

    return space;
  }

  // TODO: Use a bitmap to hold settings in contract
  async getSpaceSettings(
    id: bigint,
    recache: boolean = false
  ): Promise<SpaceSettings> {
    if (!recache && this._cachedSpacesSettings[id.toString()])
      return this._cachedSpacesSettings[id.toString()];

    const [createProposalThreshold, onlyAdminsCanCreateProposal] =
      await this.contract.read.getSpaceSettings([id]);

    const spaceSettings: SpaceSettings = {
      createProposalThreshold,
      onlyAdminsCanCreateProposal,
    };
    await this._cacheSpaceSettings(id, spaceSettings);

    return spaceSettings;
  }

  async getVotes(
    spaceId: bigint,
    proposalId: bigint,
    { skip = 0, limit = 10 }: PaginationOptions & AuthorOptions
  ): Promise<Vote[]> {
    let votes = new Array<Vote>();
    if (
      skip + limit >
      Object.keys(
        (this._cachedVotes[spaceId.toString()] &&
          this._cachedVotes[spaceId.toString()][proposalId.toString()]) ??
          {}
      ).length
    ) {
      try {
        const result = await this.contract.read.getSpaceProposalVotes([
          spaceId,
          proposalId,
          BigInt(skip),
          BigInt(limit),
        ]);

        const [voters, votess, choices] = result;
        for (let i = 0; i < result[0].length; i++) {
          const votes_ = votess[i];
          const vote: Vote = {
            proposal: proposalId,
            amount: votes_,
            choice: choices[i],
            space: spaceId,
            author: voters[i],
            id: BigInt(skip + i),
          };
          votes.push(vote);
        }
        this._cacheVotes(spaceId, proposalId, votes);
      } catch (e) {
        console.error(e);
      }
    }
    if (!votes.length) {
      votes = Object.values(
        this._cachedVotes[spaceId.toString()] &&
          this._cachedVotes[spaceId.toString()][proposalId.toString()]
      ).slice(skip, skip + limit);
    }
    return votes;
  }

  async getVotingPower(spaceId: bigint, blockNumber: bigint): Promise<bigint> {
    const { token } = (await this.getSpace(spaceId)) ?? {};
    if (!token || !this.account) return 0n;

    const tokenContract = getContract({
      abi: erc20Abi,
      client: this.publicClient,
      address: token.id,
    });
    const balance = await tokenContract.read.balanceOf([this.account.address], {
      blockNumber,
    });

    return balance / 10n ** token.decimals;
  }

  async hasUserVoted(
    spaceId: bigint,
    proposalId: bigint,
    user: Address
  ): Promise<boolean> {
    return await this.contract.read.hasVoted([spaceId, proposalId, user]);
  }

  private _requireAccount(): void {
    if (!this.account) throw Error("Account not connected");
  }

  async createSpace(
    name: string,
    description: string,
    spaceToken: Address,
    avatar: string,
    website: string
  ): Promise<any> {
    this._requireAccount();
    await this.loadTokenDetails(spaceToken);

    const spaceCreationFee = await this.contract.read.SPACE_CREATION_FEE();

    console.log("Space creation fee",spaceCreationFee);

    const hash = await this.contract.write.createSpace(
      [
        stringToHex(name, { size: 32 }),
        description,
        spaceToken,
        stringToHex(avatar, { size: 32 }),
        stringToHex(website, { size: 32 }),
        this.getToken(spaceToken).decimals,
      ],
      {
        account: this.account!,
        chain: this.walletClient.chain,
        value: spaceCreationFee,
      }
    );

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: townSquareAbi,
      logs: receipt.logs,
      eventName: "SpaceCreated",
    });

    const spaceId = logs[0].args.id;
    const space = await this.getSpace(spaceId);
    return space;
  }

  async updateSpace(
    spaceId: bigint,
    name: string,
    description: string,
    spaceToken: Address,
    avatar: string,
    website: string
  ): Promise<any> {
    this._requireAccount();
    await this.loadTokenDetails(spaceToken);
    await this.contract.write.updateSpace(
      [
        spaceId,
        stringToHex(name, { size: 32 }),
        description,
        spaceToken,
        this.getToken(spaceToken).decimals,
        stringToHex(avatar, { size: 32 }),
        stringToHex(website, { size: 32 }),
      ],
      { account: this.account!, chain: this.chain }
    );

    const space = await this.getSpace(spaceId, true);
    return space;
  }

  async updateSpaceProposalThreshold(
    spaceId: bigint,
    proposalThreshold: bigint,
    onlyAdminsCanCreateProposal: boolean
  ): Promise<any> {
    this._requireAccount();
    await this.contract.write.updateSpaceCreateProposalThreshold(
      [spaceId, proposalThreshold, onlyAdminsCanCreateProposal],
      { account: this.account!, chain: this.chain }
    );
  }

  async updateSpaceAdmins(spaceId: bigint, admins: Address[]): Promise<void> {
    this._requireAccount();
    await this.contract.write.setSpaceAdmins([spaceId, admins], {
      account: this.account!,
      chain: this.chain,
    });
  }

  async isSpaceAdmin(spaceId: bigint): Promise<boolean> {
    if (!this.account) return false;

    return this.contract.read.isSpaceAdmin([spaceId, this.account.address]);
  }

  async canRedeemSpaceCreationFee(spaceId: bigint): Promise<boolean> {
    const timestamp = await this.contract.read.getCreationTimestamp([spaceId]);

    // 3 months (90 days)
    return timestamp + 7776000n < Date.now() / 1000;
  }

  async redeemSpaceCreationFee(spaceId: bigint): Promise<any> {
    this._requireAccount();
    await this.contract.write.redeemSpaceCreationFee([spaceId], {
      account: this.account!,
      chain: this.chain,
    });
  }

  async createProposal({
    actions,
    choices,
    description,
    end,
    spaceId,
    start,
    title,
    link,
  }: {
    spaceId: bigint;
    title: string;
    description: string;
    choices: string[];
    actions: ChoiceAction[];
    end: bigint;
    start: bigint;
    link?: string;
  }): Promise<Proposal> {
    this._requireAccount();
    const snapshot = await this.publicClient.getBlockNumber();
    const hash = await this.contract.write.createProposal(
      [
        spaceId,
        title,
        description,
        start,
        end,
        snapshot,
        choices.map((choice) => stringToHex(choice, { size: 32 })),
        actions.map((action) => action.executor ? action.executor as Address : zeroAddress),
        actions.map((action) => action.data ? action.data as Hex : zeroHash ),
      ],
      { account: this.account!, chain: this.chain }
    );

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: townSquareAbi,
      logs: receipt.logs,
      eventName: "ProposalCreated",
    });

    if (logs.length === 0) {
      throw "Something went wrong creating proposal";
    }

    const proposalId = logs[0].args.id;
    const proposal = await this.getProposal(spaceId, BigInt(proposalId));

    return proposal!;
  }

  async vote(
    spaceId: bigint,
    proposalId: bigint,
    choiceIndex: bigint
  ): Promise<void> {
    this._requireAccount();
    const message = `Sign this message to confirm your vote

Space ID: ${spaceId}
Proposal ID: ${proposalId}
Choice index: ${choiceIndex}`;

    const signature = await this.walletClient.signMessage({
      message,
      account: this.account!,
    });

    await axios.post(`/api/vote/${spaceId}/${proposalId}`, {
      signature,
      address: this.account!.address,
      choiceIndex: choiceIndex.toString(),
    });
  }

  async joinSpace(spaceId: bigint): Promise<void> {
    this._requireAccount();
    await this.contract.write.joinSpace([spaceId], {
      account: this.account!,
      chain: this.chain,
    });
  }

  async executeProposal(spaceId: bigint, proposalId: bigint): Promise<void> {
    this._requireAccount();
    await this.contract.write.executeProposal([spaceId, proposalId], {
      account: this.account!,
      chain: this.chain,
    });
  }

  async isProposalExecuted(
    spaceId: bigint,
    proposalId: bigint
  ): Promise<boolean> {
    return await this.contract.read.isProposalExecuted([spaceId, proposalId]);
  }
}
