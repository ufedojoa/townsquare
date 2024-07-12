import { Proposal, Space, DetailedSpace, SpaceSettings, Vote, ChoiceAction } from ".";

type PaginationOptions = {
	first?: number;
	skip?: number;
	limit?: number;
};

type AuthorOptions = {
	author?: string;
};

interface ITownsquareClient {
	getProposals(
		spaceId: number,
		options: PaginationOptions & AuthorOptions
	): Promise<Proposal[]>;

	getProposal(spaceId: number, id: number): Promise<Proposal | null>;

	loadSpaceDescription(spaceId: number): Promise<void>;

	loadSpaceMembers(spaceId: number): Promise<void>;

	loadSpaceAdmins(spaceId: number): Promise<void>;

	loadTokenDetails(tokenId: string): Promise<void>;

	getSpaces(options: PaginationOptions & AuthorOptions): Promise<Space[]>;

	getUserSpaces(): Promise<Space[]>;

	getSpace(id: number, recache?: boolean): Promise<DetailedSpace | null>;

	getSpaceSettings(id: number, recache?: boolean): Promise<SpaceSettings>;

	getVotes(
		spaceId: number,
		proposal: number,
		options: PaginationOptions & AuthorOptions
	): Promise<Vote[]>;

	getVotingPower(spaceId: number, height: number): Promise<number>;

	hasUserVoted(spaceId: number, proposalId: number, user: string): Promise<boolean>;

	createSpace(
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<any>;

	updateSpace(
		spaceId: number,
		name: string,
		description: string,
		spaceToken: string,
		avatar: string,
		website: string
	): Promise<any>;

	updateSpaceProposalThreshold(
		spaceId: number,
		proposalThreshold: number,
		onlyAdminsCanCreateProposal: boolean
	): Promise<any>;

	updateSpaceAdmins(spaceId: number, admins: string[]): Promise<void>;

	isSpaceAdmin(spaceId: number): Promise<boolean>;

	canRedeemSpaceCreationFee(spaceId: number): Promise<boolean>;

	redeemSpaceCreationFee(spaceId: number): Promise<any>;

	createProposal(params: {
		spaceId: number;
		title: string;
		description: string;
		choices: string[];
		actions: ChoiceAction[];
		end: number;
		start: number;
		link?: string;
	}): Promise<Proposal>;

	vote(spaceId: number, proposal: number, choiceIndex: number): Promise<void>;

	joinSpace(spaceId: number): Promise<void>;

	executeProposal(spaceId: number, proposalId: number): Promise<void>;

	isProposalExecuted(spaceId: number, proposalId: number): Promise<boolean>;
}
