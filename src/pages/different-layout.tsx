import { HtmlPage, LayoutPage } from "@phinda/lib";

export default HtmlPage(() => {
  return (
    <>
      <p>
        This is an example of how to apply a different layout to an individual
        page.
      </p>
      <p>
        <a href="/">Click to go back</a>
      </p>
    </>
  );
});

export const Layout = LayoutPage((ctx, children) => (
  <>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
    />
    <main>{children}</main>
  </>
));
