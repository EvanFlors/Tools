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
            <PageContent title={title}>
                <p className="text-lg text-gray-600">{message}</p>
            </PageContent>
        </>
    );
}

export default ErrorPage;
