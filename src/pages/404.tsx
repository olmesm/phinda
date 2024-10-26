import { HtmlPage } from "@phinda/lib";

export default HtmlPage((ctx) => {
  ctx.res.status = 404;

  return (
    <>
      <h1>Awu!</h1>
      <p>Not found</p>
    </>
  );
});
