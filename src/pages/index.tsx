import { HtmlPage } from "@phinda/lib";
import { Layout } from "../components/layout";

export default HtmlPage((ctx) => {
  return (
    <Layout>
      <h1>Welcome {ctx.req.user ? ctx.req.user.email : "Guest"}!</h1>
    </Layout>
  );
});
