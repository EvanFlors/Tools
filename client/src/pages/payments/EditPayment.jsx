import { Link, useRouteLoaderData } from "react-router-dom";
import PaymentForm from "../../components/PaymentForm";

function EditPaymentPage() {
  const data = useRouteLoaderData("payment-detail");
  const payment = data?.data || data;

  if (!payment || !payment._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Payment Not Found
        </h1>
        <Link to="/payments" className="text-blue-600 hover:underline">
          Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Payment</h1>
      <PaymentForm payment={payment} />
    </div>
  );
}

export default EditPaymentPage;
