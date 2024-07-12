import { Address, Hex } from "viem";

export class ChoiceAction {
	constructor(readonly executor: string, readonly data: string) {}
}

export enum ProposalState {
	active = 'active',
	closed = 'closed',
	pending = 'pending',
}

export class Proposal {
	id: bigint;
	author: Address;
	spaceId: bigint;
	space?: Space;
	snapshot: bigint;
	title: string;
	description: string;
	choices: string[];
	choicesVotesCounts: bigint[];
	start: bigint;
	end: bigint;
	passActions: ChoiceAction[];

	get state(): ProposalState {
		if (this.end * BigInt(1000) < Date.now()) {
			return ProposalState.closed;
		}
		if (this.start * BigInt(1000) > Date.now()) {
			return ProposalState.pending;
		}
		return ProposalState.active;
	}

	constructor({
		id,
		author,
		spaceId,
		title,
		description,
		choices,
		choicesVotesCounts,
		start,
		end,
		passActions,
		snapshot,
	}: Proposal) {
		this.id = id;
		this.author = author;
		this.spaceId = spaceId;
		this.title = title;
		this.description = description;
		this.choices = choices;
		this.choicesVotesCounts = choicesVotesCounts;
		this.start = start;
		this.end = end;
		this.passActions = passActions;
		this.snapshot = snapshot;
	}
}

export interface Vote {
	id: bigint;
	author: Address;
	space: bigint;
	proposal: bigint;
	choice: bigint;
	amount: bigint;
}

export interface Token {
	id: Address;
	name: string;
	symbol: string;
	decimals: bigint;
}

export interface Space {
	id: bigint;
	name: string;
	isPrivate: boolean;
	memberCount: bigint;
	avatar?: string;
	token: Token;
}

export interface DetailedSpace extends Space {
	members: Address[];
	admins: Address[];
	description?: string;
	website?: string;
	owner?: Address;
}

export interface SpaceSettings {
	createProposalThreshold: bigint;
	onlyAdminsCanCreateProposal: boolean;
}