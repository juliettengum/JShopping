import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";

import ProductItem from "../ProductItem";
import { QUERY_PRODUCTS } from "../../utils/queries";
import { useStoreContext } from "../../utils/GlobalState";
import { UPDATE_PRODUCTS } from "../../utils/actions";

import MoonLoader from "react-spinners/MoonLoader";
import { idbPromise } from "../../utils/helpers";

function ProductList({ numberOfProductsToLoad = 100, from = 0, to = 100 }) {
  const [state, dispatch] = useStoreContext();

  const { currentCategory } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    if (data) {
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });

      data.products.forEach((product) => {
        idbPromise("products", "put", product);
      });
      // add else if to check if `loading` is undefined in `useQuery()` Hook
    } else if (!loading) {
      // since we're offline, get all of the data from the `products` store
      idbPromise("products", "get").then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products,
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(
      (product) => product.category._id === currentCategory
    );
  }

  return (
    <div className="my-2">
      <hr />
      <p id="product-list"></p>
      <br />
      {state.products.length && numberOfProductsToLoad && to ? (
        <div className="flex-row">
          {filterProducts()
            .slice(from, to)
            .map((product) => (
              <ProductItem
                key={product._id}
                _id={product._id}
                image={product.image}
                name={product.name}
                price={product.price}
                quantity={product.quantity}
              />
            ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? (
        <div
          style={{
            display: "block",
            position: "absolute",
            top: "50%",
            left: "50%",
          }}
        >
          <MoonLoader
            color={"#000080"}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : null}
    </div>
  );
}

ProductList.defaultPropos = {
  numberOfProductsToLoad: 100,
  from: 0,
  to: 100,
};

export default ProductList;
