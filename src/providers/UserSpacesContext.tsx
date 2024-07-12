import { createContext, ReactNode, useEffect, useState } from "react";
import { DetailedSpace, Space } from "@/types";
import { useClient } from "../hooks/client";
import { useParams } from "next/navigation";
import { useSpace } from "@/hooks/space";

export const UserSpacesContext = createContext<{
  currentSpace?: DetailedSpace;
  userSpaces: Space[];
  setUserSpaces: (x: Space[]) => void;
}>({
  userSpaces: [],
  setUserSpaces: () => {},
});

export const SpacesContextProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const client = useClient();
  const { spaceId } = useParams();
  console.log(spaceId);

  const space = useSpace(BigInt(typeof spaceId === "string" ? spaceId : ""));

  const [userSpaces, setUserSpaces] = useState<Space[]>([]);

  useEffect(() => {
    if (client) {
      client.getUserSpaces().then((spaces) => {
        setUserSpaces(spaces);
      });
    } else {
      setUserSpaces([]);
    }
  }, [client]);
  return (
    <UserSpacesContext.Provider
      value={{
        currentSpace: (space && space !== "404" && space) || undefined,
        userSpaces,
        setUserSpaces,
      }}
    >
      {children}
    </UserSpacesContext.Provider>
  );
};
