import { HtmlPage } from "@phinda/lib";

export default HtmlPage((ctx) => {
  ctx.res.status = 500;

  return (
    <>
      <h1>Aikona!</h1>
      <p>Server error</p>
    </>
  );
});
