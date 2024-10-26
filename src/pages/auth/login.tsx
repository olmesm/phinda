import { HtmlPage } from "@phinda/lib";

export default HtmlPage(() => {
  return (
    <>
      <h1>Login</h1>
      <form method="post" action="/__auth/login">
        <label>
          email
          <input type="email" name="email" />
        </label>
        <label>
          password
          <input type="password" name="password" />
        </label>

        <input type="submit" />
      </form>
    </>
  );
});
