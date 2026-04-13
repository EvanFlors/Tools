function PageContent({ title, children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">{title}</h1>
      {children}
    </div>
  );
}

export default PageContent;
