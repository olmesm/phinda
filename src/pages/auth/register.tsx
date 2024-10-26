import { HtmlPage } from "@phinda/lib";

export default HtmlPage(() => {
  return (
    <>
      <h1>Register</h1>
      <form method="post" action="/__auth/register">
        <label>
          email
          <input type="email" name="email" />
        </label>
        <label>
          First Name
          <input name="firstName" />
        </label>
        <label>
          Last Name
          <input name="lastName" />
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
