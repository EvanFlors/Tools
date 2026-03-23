import { useState } from "react";
import { Form, useNavigation, useActionData, redirect } from "react-router-dom";
import { API_BASE } from "../config/api";

function ProductForm({ product }) {
    const data = useActionData();

    const navigation = useNavigation();

    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    const method = product ? "put" : "post";

    function handleImageChange(e) {
        const files = Array.from(e.target.files);

        if (files.length === 0) {
            setImagePreviews([]);
            return;
        }

        setImageLoading(true);

        const previewPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        url: reader.result,
                        name: file.name
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previewPromises).then(previews => {
            setImagePreviews(previews);
            setImageLoading(false);
        });
    }

    return (
        <>
            <Form method={method} encType="multipart/form-data" className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                {data && data.errors && <ul className="mb-4 text-red-600">
                    {Object.entries(data.errors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                    ))}
                </ul>}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                        Product Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={product ? product.name : ''}
                        required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="images" className="block text-gray-700 font-semibold mb-2">
                        Product Images {!product && '*'}
                    </label>

                    {/* Image Preview Section */}
                    <div className="mb-4 grid grid-cols-3 gap-4">
                        {imageLoading ? (
                            // Skeleton Loading
                            [...Array(3)].map((_, index) => (
                                <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                            ))
                        ) : imagePreviews.length > 0 ? (
                            // Image Previews
                            imagePreviews.map((preview, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img
                                        src={preview.url}
                                        alt={preview.name}
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                    />
                                </div>
                            ))
                        ) : product?.imageIds && product.imageIds.length > 0 ? (
                            // Existing Product Images
                            product.imageIds.map((image, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img
                                        src={`${API_BASE}/images/${image._id}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ))
                        ) : (
                            // Empty Skeleton State
                            [...Array(3)].map((_, index) => (
                                <div key={index} className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            ))
                        )}
                    </div>

                    <input
                        type="file"
                        id="images"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Select up to 3 images (JPG, PNG, WebP - Max 5MB each)
                    </p>
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={product ? product.description : ''}
                        //required
                        rows="4"
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
                        Price *
                    </label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        min="0"
                        defaultValue={product ? product.price : ''}
                        //required
                        className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold disabled:bg-blue-300"
                >
                    {navigation.state === "submitting"
                        ? "Submitting..."
                        : product ? 'Update Product' : 'Create Product'
                    }
                </button>
            </Form>
        </>
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
