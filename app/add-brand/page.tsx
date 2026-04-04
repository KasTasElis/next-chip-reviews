export default function AddBrand() {
  return (
    <div className="w-full max-w-3xl min-w-80 mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold mb-6">Add a Brand</h1>

      <form className="flex flex-col gap-5">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Name</legend>
          <input
            type="text"
            name="name"
            placeholder="Brand name"
            className="input w-full"
            required
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea
            name="description"
            placeholder="A short description of the brand"
            className="textarea w-full h-32"
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Logo</legend>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-base-300 rounded-box cursor-pointer hover:border-primary hover:bg-base-200 transition-colors">
            <div className="flex flex-col items-center gap-2 text-base-content/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm">Drop logo here or <span className="text-primary">browse</span></span>
              <span className="text-xs">PNG, JPG, SVG up to 5MB</span>
            </div>
            <input type="file" name="logo" accept="image/*" className="hidden" />
          </label>
        </fieldset>

        <button type="submit" className="btn btn-primary mt-2">
          Add Brand
        </button>
      </form>
    </div>
  );
}
