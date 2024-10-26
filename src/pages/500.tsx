import { HtmlPage } from "@phinda/lib";
import { Layout } from "../components/layout";

export default HtmlPage((ctx) => {
  ctx.res.status = 500;

  return (
    <Layout>
      <h1>Aikona!</h1>
      <p>Server error</p>
    </Layout>
  );
});
