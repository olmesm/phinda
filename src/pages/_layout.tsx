import { LayoutPage } from "@phinda/lib";
import { Header } from "../components/header";

const LINKS = [
  {
    name: "home",
    url: "/",
  },
  {
    name: "Different Layout",
    url: "/different-layout",
  },
  {
    name: "form test",
    url: "/form-test",
  },
  { name: "register", url: "/auth/register" },
  { name: "login", url: "/auth/login" },
];

export default LayoutPage((ctx, children) => (
  <>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    ></link>
    <main class="container">
      <Header links={LINKS} user={ctx.req.user} />
      <div>{children}</div>
    </main>
  </>
));
