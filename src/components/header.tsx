type Link = { name: string; url: string };

export const Header = ({ links }: { links: Link[] }) => (
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
        <input type="submit" value="logout" />
      </form>
    </nav>
  </>
);
