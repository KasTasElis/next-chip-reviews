import Link from "next/link";

export const Nav = () => {
  const user = false;

  return (
    <div className="bg-base-200 shadow-sm w-full rounded-md">
      <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
      <label
        htmlFor="navbar-1-toggle"
        className="fixed inset-0 hidden max-lg:peer-checked:block"
      ></label>

      <div className="navbar">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl">
            🥔 Chipper
          </Link>
        </div>
        <div className="navbar-center flex">
          <input
            type="text"
            placeholder="🤤 Looking for something?"
            className="input input-bordered w-64"
          />
        </div>
        <div className="navbar-end">
          <ul className="menu menu-horizontal px-1 gap-3">
            {user ? (
              <>
                <li>
                  <button className="btn btn-sm btn-outline btn-error">
                    Add Listing
                  </button>
                </li>
                <li>
                  <button className="btn btn-sm btn-ghost btn-primary">
                    🙋‍♂️ eliHimself
                  </button>
                </li>

                <li>
                  <button className="btn btn-sm btn-outline btn-error">
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  className="btn btn-sm btn-outline btn-primary"
                  href="/auth/sign-in"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
