import Link from "next/link";

export const SpaceProposalDiscussionLink = ({
  link,
}: {
  link?: string;
  className?: string;
}) => {
  return !link ? (
    <></>
  ) : (
    <div>
      <Link href={link}>{link}</Link>
    </div>
  );
};
