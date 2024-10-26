import type { Children } from "../../server/lib";
import { Header } from "./header";

const LINKS = [
  {
    name: "home",
    url: "/",
  },
  {
    name: "form test",
    url: "/form-test",
  },
  { name: "register", url: "/auth/register" },
  { name: "login", url: "/auth/login" },
];

export const Layout = ({ children }: { children: Children }) => (
  <>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    ></link>
    <main class="container">
      <Header links={LINKS} />
      <div>{children}</div>
    </main>
  </>
);
