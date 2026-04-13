import { useRouteError } from "react-router-dom";

import MainNavigation from "../components/MainNavigation";
import PageContent from "../components/PageContent";

function ErrorPage() {
    const error = useRouteError();

    let title = "An Error Occurred!";
    let message = "Something went wrong!";

    if (error.status === 404) {
        title = "Not Found";
        message = "The requested resource could not be found.";
    }

    if (error.status === 500) {
        message = JSON.parse(error.data).message;
    }

    return (
        <>
            <MainNavigation />
            <div className="pt-12">
            <PageContent title={title}>
                <p className="text-sm text-neutral-500">{message}</p>
            </PageContent>
            </div>
        </>
    );
}

export default ErrorPage;
