function PageContent({ title, children }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{title}</h1>
            {children}
        </div>
    );
}

export default PageContent;
