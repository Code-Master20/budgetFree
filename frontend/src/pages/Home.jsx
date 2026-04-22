import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">budgetFree 🛒</h1>

      <p className="text-center text-gray-600 mb-8">
        Discover products, read reviews, earn rewards 💰
      </p>

      {loading && <p className="text-center">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => navigate(`/product/${product._id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:scale-105 transition"
          >
            <img
              src={product.images?.[0]}
              alt={product.title}
              className="w-full h-40 object-cover rounded mb-3"
            />

            <h2 className="text-lg font-bold">{product.title}</h2>

            <p className="text-gray-600 text-sm">{product.description}</p>

            <p className="text-green-600 font-bold mt-2">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
