import { useState, useEffect } from 'react';
import { Vote } from '@/types';
import { useClient } from './client';

export function useVotes(
	spaceId?: bigint | null,
	proposalId?: bigint | null,
	count: number = 20
): { data?: Vote[]; error?: object } {
	const client = useClient();
	const [votes, setVotes] = useState<Vote[]>();
	const [resultsEnd, setResultsEnd] = useState(false);
	const [error, setError] = useState<object>();

	useEffect(() => {
		if (spaceId === undefined || spaceId === null) return;
		if (proposalId === undefined || proposalId === null) return;
		if (resultsEnd) return;
		if ((votes?.length ?? 0) >= count) return;

		

		client
			?.getVotes(spaceId, proposalId, { skip: votes?.length! })
			.then((results) => {
				

				if (results.length === 0) {
					setResultsEnd(true);
				} else {
					setVotes([...(votes ?? []), ...results]);
				}
			})
			.catch((e) => {
				setError(e);
			});
	}, [votes, setVotes, count, resultsEnd, client, spaceId, proposalId]);
	return {
		data: votes?.slice(0, count),
		error: error,
	};
}
