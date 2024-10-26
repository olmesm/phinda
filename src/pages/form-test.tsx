import { Layout } from "../components/layout";
import { HtmlPage } from "@phinda/lib";
import { z } from "zod";

export default HtmlPage(async (ctx) => {
  const body = await ctx.req.parseBodyWithSchema(
    z.object({ testData: z.string() })
  );

  return (
    <Layout>
      <p safe>You submitted: {body.data?.testData ?? "...nothing yet"}</p>{" "}
      <form method="post">
        <label>
          Test Data
          <input
            safe
            type="text"
            name="testData"
            value={body.data?.testData ?? ""}
          />
        </label>
        <input type="submit" />
      </form>
    </Layout>
  );
});
