import { HtmlPage, LayoutPage } from "@phinda/lib";

export default HtmlPage((ctx) => {
  return <h1>Welcome {ctx.req.user ? ctx.req.user.email : "Guest"}!</h1>;
});
