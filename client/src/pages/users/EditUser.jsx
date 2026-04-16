import { Link, useRouteLoaderData } from "react-router-dom";
import UserForm from "../../components/UserForm";

function EditUserPage() {
    const user = useRouteLoaderData("user-detail");

    if (!user || !user.data) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-4">User Not Found</h1>
                <Link to="/users" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    Back to Users
                </Link>
            </div>
        );
    }

    const userData = user.data;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Edit admin</h1>
            <Link to="/users" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4 inline-block">
                ← Back to Users
            </Link>
            <UserForm user={userData} />
        </div>
    );
}

export default EditUserPage;
