import { HtmlPage } from "@phinda/lib";
import { z } from "zod";

export default HtmlPage(async (ctx) => {
  const body = await ctx.req.parseBodyWithSchema(
    z.object({ testData: z.string() })
  );

  return (
    <div>
      <p safe>You submitted: {body.data?.testData ?? "...nothing yet"}</p>{" "}
    </div>
  );
});
