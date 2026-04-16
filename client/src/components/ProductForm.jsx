import { useState } from "react";
import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 bg-neutral-50";

function ProductForm({ product }) {
    const data = useActionData();
    const navigation = useNavigation();

    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    const method = product ? "put" : "post";

    function handleImageChange(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) { setImagePreviews([]); return; }

        setImageLoading(true);
        const previewPromises = files.map(file =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({ url: reader.result, name: file.name });
                reader.readAsDataURL(file);
            })
        );
        Promise.all(previewPromises).then(previews => {
            setImagePreviews(previews);
            setImageLoading(false);
        });
    }

    return (
        <Form method={method} encType="multipart/form-data" className="bg-neutral-50 border border-neutral-200/80 p-5 sm:p-6 rounded-xl max-w-2xl mx-auto">
            {data && data.errors && (
                <ul className="mb-4 text-sm text-brand-600 bg-brand-50 border border-brand-100 p-3 rounded-lg">
                    {Object.entries(data.errors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                    ))}
                </ul>
            )}

            <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Product Name
                </label>
                <input
                    type="text" id="name" name="name"
                    defaultValue={product ? product.name : ''}
                    required className={inputClass}
                />
            </div>

            <div className="mb-5">
                <label htmlFor="images" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Product Images {!product && '*'}
                </label>

                <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imageLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-square bg-neutral-100 rounded-lg animate-pulse" />
                        ))
                    ) : imagePreviews.length > 0 ? (
                        imagePreviews.map((p, i) => (
                            <div key={i} className="relative aspect-square">
                                <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg border border-neutral-200" />
                            </div>
                        ))
                    ) : product?.imageIds && product.imageIds.length > 0 ? (
                        product.imageIds.map((image, i) => (
                            <div key={i} className="relative aspect-square">
                                <img src={`${API_BASE}/images/${image._id}`} alt={product.name}
                                    className="w-full h-full object-cover rounded-lg border border-neutral-200"
                                    crossOrigin="anonymous" />
                            </div>
                        ))
                    ) : (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-square bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center">
                                <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        ))
                    )}
                </div>

                <input type="file" id="images" name="images" multiple accept="image/*"
                    onChange={handleImageChange} className={inputClass} />
                <p className="text-xs text-neutral-400 mt-1">
                    Select up to 3 images (JPG, PNG, WebP — Max 5 MB each)
                </p>
            </div>

            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description
                </label>
                <textarea id="description" name="description"
                    defaultValue={product ? product.description : ''} rows="4"
                    className={inputClass} />
            </div>

            <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Price
                </label>
                <input type="number" id="price" name="price" step="0.01" min="0"
                    defaultValue={product ? product.price : ''} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Category
                    </label>
                    <input type="text" id="category" name="category"
                        defaultValue={product ? product.category : 'General'} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Stock
                    </label>
                    <input type="number" id="stock" name="stock" min="0" step="1"
                        defaultValue={product ? product.stock : 0} className={inputClass} />
                </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
                <button type="submit" disabled={navigation.state === "submitting"}
                    className="w-full py-2.5 bg-neutral-900 text-neutral-50 rounded-lg hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50">
                    {navigation.state === "submitting"
                        ? "Submitting..."
                        : product ? 'Update product' : 'Create product'}
                </button>
                <button type="button" onClick={() => window.history.back()} className="w-full py-2.5 text-sm border border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors font-medium">
                    Cancel
                </button>
            </div>
        </Form>
    );
}

export default ProductForm;


export async function action({ request, params }) {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    // Create FormData for multipart upload
    const uploadData = new FormData();
    uploadData.append("name", formData.get("name"));
    uploadData.append("description", formData.get("description"));
    uploadData.append("price", formData.get("price"));
    uploadData.append("category", formData.get("category") || "General");
    uploadData.append("stock", formData.get("stock") || "0");

    // Handle multiple image files
    const imageFiles = formData.getAll("images");

    if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
            if (file && file.size > 0) {
                uploadData.append("images", file);
            }
        });
    }

    // Build URL based on method and params
    let url;
    let productId;

    if (method === "POST") {
        url = `${API_BASE}/admin/products`;
    } else if (method === "PUT") {
        productId = params.productId;
        url = `${API_BASE}/admin/products/${productId}`;
    } else if (method === "DELETE") {
        productId = params.productId;
        url = `${API_BASE}/admin/products/${productId}`;
    }

    const response = await fetch(url, {
        method: method,
        credentials: "include",
        body: method !== "DELETE" ? uploadData : undefined,
    });

    if (response.status === 422) {
        const resData = await response.json();
        return resData; // Return the validation errors to be consumed by useActionData
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Response(
            JSON.stringify({ message: errorData.message || 'Could not process request.' }),
            { status: response.status }
        );
    }

    const resData = await response.json();

    // Redirect appropriately
    if (method === "DELETE") {
        return redirect("/products");
    } else if (method === "PUT") {
        return redirect(`/products/${productId}`);
    } else {
        // POST - redirect to newly created product
        return redirect(`/products/${resData.data._id}`);
    }
}
