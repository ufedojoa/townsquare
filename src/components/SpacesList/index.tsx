import { useCallback, useEffect, useRef, useState } from "react";

import { useSpaces } from "../../hooks/space";
import { formatNumberCompact } from "../../utils/misc";
import JoinButton from "../JoinButton";
import SpaceAvatar from "../SpaceAvatar";
import { Space } from "@/types";
import Link from "next/link";

type Props = {
  className?: string;
  query?: string;
  isMember?: boolean;
};

const SpaceComponent = ({ space }: { space: Space }) => {
  return (
    <Link href={"/space/" + space.id}>
      <div
        className="px-6 py-6 rounded-3xl flex flex-col gap-y-6 items-center border-2 border-gray-400/20"
        key={space.id}
      >
        {space && <SpaceAvatar space={space} size={80} />}
        <h2 className="font-semibold text-lg">{space.name}</h2>
        <div>
          {(space.memberCount && formatNumberCompact(space.memberCount)) ?? "-"}{" "}
          members
        </div>
        <JoinButton space={space} />
      </div>
    </Link>
  );
};

const SpacesList = ({ query }: Props) => {
  const [maxSpacesCount, setMaxSpacesCount] = useState(20);
  const { data: spaces, allResultsFetched } = useSpaces(maxSpacesCount);

  const updateCount = useCallback(() => {
    if ((spaces?.length ?? 0) >= maxSpacesCount)
      setMaxSpacesCount(maxSpacesCount + 10);
  }, [maxSpacesCount, spaces?.length]);

  const loadingRef = useRef<Element>();

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(updateCount, options);
    loadingRef.current && observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [updateCount]);
  if (allResultsFetched && !spaces?.length)
    return (
      <div className="h-96 flex justify-center items-center flex-col gap-4 text-center">
        <p className="text-2xl max-w-lg leading-snug">No spaces found on this chain. Why not create the first one?</p>
        <Link href="/create">
          <button className="duration-300 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4">
            + Create a space
          </button>
        </Link>
      </div>
    );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center mx-auto">
      {spaces
        ?.filter((space) => !query || space.name.toLowerCase().includes(query))
        .map((space) => <SpaceComponent key={space.id} space={space} />)}
      {(spaces?.length ?? 0) >= maxSpacesCount && (
        <div
          ref={(ref) => {
            loadingRef.current = ref || undefined;
          }}
          style={{ height: "100px", margin: "30px" }}
        >
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default SpacesList;
