import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <img
          src={product.images?.[0]}
          alt={product.title}
          className="w-full h-64 object-cover rounded mb-4"
        />

        <h1 className="text-2xl font-bold mb-2">{product.title}</h1>

        <p className="text-gray-600 mb-4">{product.description}</p>

        <p className="text-green-600 font-bold text-xl">₹{product.price}</p>

        <a
          href={product.affiliateLink}
          target="_blank"
          rel="noreferrer"
          className="block mt-4 bg-blue-500 text-white p-2 text-center rounded"
        >
          Buy on Amazon
        </a>
      </div>
    </div>
  );
}
