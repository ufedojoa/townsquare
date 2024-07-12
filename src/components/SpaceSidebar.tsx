"use client";

import { LinkIcon } from "@heroicons/react/24/outline";
import { DetailedSpace } from "@/types";
import { useIsSpaceAdmin } from "../hooks/space";
import { formatNumberCompact } from "../utils/misc";
import JoinButton from "./JoinButton";
import SpaceAvatar from "./SpaceAvatar";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const SidebarLink = (
  props: LinkProps & { children: ReactNode | ReactNode[] }
) => {
  const pathname = usePathname();
  const isActive = props.href === pathname;
  return (
    <Link
      className={
        "block px-4 py-2 hover:bg-skin-base" +
        (isActive ? " border-l-[3px] border-skin-text-muted !pl-[21px]" : "")
      }
      {...props}
    />
  );
};

const SpaceSidebar = ({ space }: { space: DetailedSpace }) => {
  const isAdmin = useIsSpaceAdmin(space.id);
  return (
    <div className="w-full md:w-60 leading-5 sm:leading-6 shrink-0">
      <div className="border-y border-skin-alt bg-skin-base text-base md:rounded-xl md:border py-4">
        <div className="fy gap-y-2 text-center py-4">
          <SpaceAvatar space={space} size={80} />
          <h3 className="mx-3 mb-0.5 xy">
            <div className="mr-1 truncate">{space.name}</div>
          </h3>
          {space.website?.trim() && (
            <Link href={space.website.trim()} className="underline">
              website
              <LinkIcon className="h-4 ml-1 inline text-skin-muted" />
            </Link>
          )}
          <div className="">
            <span className="text-skin-muted text-sm">Token: </span>
            <Link
              href={"https://ubitscan.io/token/" + space.token.id}
              className="hover:underline"
            >
              {space.token.symbol}
            </Link>
          </div>
          <div className="mb-[12px] text-skin-text">
            {formatNumberCompact(space.memberCount)} member
            {space.memberCount !== 1n && "s"}
          </div>
          <JoinButton space={space} />
        </div>
        <div className="py-4">
          <SidebarLink href={"/space/" + space.id}>Proposals</SidebarLink>
          <SidebarLink href={"/space/" + space.id + "/create"}>
            Create proposal
          </SidebarLink>
          <SidebarLink href={"/space/" + space.id + "/about"}>
            About
          </SidebarLink>
          {isAdmin && (
            <SidebarLink href={"/space/" + space.id + "/edit"}>
              Edit space
            </SidebarLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceSidebar;
