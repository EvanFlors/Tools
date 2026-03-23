import { useSearchParams } from "react-router-dom";
import PaymentForm from "../../components/PaymentForm";

function NewPaymentPage() {
  const [searchParams] = useSearchParams();
  const saleId = searchParams.get("saleId");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Record New Payment
      </h1>
      <PaymentForm saleId={saleId} />
    </div>
  );
}

export default NewPaymentPage;
