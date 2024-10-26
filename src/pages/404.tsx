import { HtmlPage } from "@phinda/lib";
import { Layout } from "../components/layout";

export default HtmlPage((ctx) => {
  ctx.res.status = 404;

  return (
    <Layout>
      <h1>Awu!</h1>
      <p>Not found</p>
    </Layout>
  );
});
