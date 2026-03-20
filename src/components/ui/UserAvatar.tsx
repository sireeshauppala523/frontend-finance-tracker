import type { AuthUser } from "../../types/api";

type UserAvatarProps = {
  user: AuthUser | null;
  size?: number;
};

export function UserAvatar({ user, size = 44 }: UserAvatarProps) {
  const initials = (user?.displayName ?? "PF")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (user?.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.displayName} className="user-avatar" style={{ width: size, height: size }} />;
  }

  return (
    <div className="user-avatar fallback" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}