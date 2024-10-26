import type { User } from "@prisma/client";

type Link = { name: string; url: string };

export const Header = ({
  links,
  user,
}: {
  user: User | null;
  links: Link[];
}) => {
  const hasUser = !!user;

  return (
    <>
      <nav>
        <ul>
          <li>
            <strong>Phinda</strong>
          </li>
        </ul>
        <ul>
          {links.map((l) => (
            <li>
              <a safe href={l.url}>
                {l.name}
              </a>
            </li>
          ))}
        </ul>

        <form action="/__auth/logout" method="post">
          <input disabled={!hasUser} type="submit" value="logout" />
        </form>
      </nav>
    </>
  );
};
