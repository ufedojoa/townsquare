import { Space } from "@/types";
import normalizeUrl from "normalize-url";

const SpaceAvatar = ({
  space,
  size,
}: {
  space: Space;
  size?: number | string;
}) => (
  <div
    style={{ height: size, width: size }}
    className="h-20 w-20 max-w-full max-h-full rounded-full bg-gray-400 bg-opacity-20 overflow-hidden"
  >
    {space.avatar && space.avatar.charCodeAt(0) !== 0 ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        onError={(e) => (e.currentTarget.style.display = "none")}
        className="object-cover h-full w-full"
        src={space.avatar && normalizeUrl(space.avatar)}
        alt={`${space.name} logo`}
      />
    ) : (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-4xl font-bold text-skin-muted">{space.name[0]}</p>
      </div>
    )}
  </div>
);
export default SpaceAvatar;
