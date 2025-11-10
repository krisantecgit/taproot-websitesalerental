import React, { useEffect, useRef, useState } from "react";
import axiosConfig from "../../Services/axiosConfig";
import { IoChevronBack, IoChevronForward, IoArrowDown, IoArrowForward } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import FilterOptions from "../Pages/FilterOptions";
import { sort_map } from "../../utils/sort_map";
import "../Products/product.css"


function FilterSection({ friendlyData, onProductsChange, onLoading, categoryurl, products }) {
    console.log(categoryurl, "catcategoryurl")
    const { friendlyurl } = useParams();
    const [params] = useSearchParams()
    const query = params.get("q");
    console.log(friendlyurl, "frrrrrs")
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const carouselRef = useRef(null);

    const [category, setCategory] = useState([]);
    const [subcategoryProducts, setSubCategoryProducts] = useState([]);
    const [selectedSubcats, setSelectedSubcats] = useState([]);
    const [activeSort, setActiveSort] = useState("Featured");

    const [filterData, setFilterData] = useState([]);
    const [nextUrl, setNextUrl] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [variantOptions, setVariantOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const isSearchPage = window.location.pathname.includes('/search/results');

    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

    const [showFilter, setShowFilter] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});

    const priceRanges = [
        { id: 1, label: "₹0 - ₹5000", min: 0, max: 5000 },
        { id: 2, label: "₹5000 - ₹10,000", min: 5000, max: 10000 },
        { id: 3, label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
    ];


    async function fetchCategories() {
        try {
            const res = await axiosConfig.get(`/catlog/with-${categoryurl}-or-both/`);
            setCategory(res.data);
        } catch (err) {
            console.error("fetchCategories", err);
        }
    }

    async function fetchInitialProducts() {
        try {
            onLoading(true);
            const selectedCategory = friendlyData?.product_data?.name || "";
            const res = await axiosConfig.get(
                `/catlog/category-variants/?listing_type=${categoryurl}&category=${selectedCategory}`
            );
            onProductsChange(res.data.results || []);
            setNextUrl(res.data.next || null);
            setSearchParams((prev) => {
                const p = Object.fromEntries([...prev]);
                // p.collection = selectedCategory.toUpperCase() || "";
                return p;
            });
        } catch (err) {
            console.error("fetchInitialProducts", err);
        } finally {
            onLoading(false);
        }
    }
    const loadMoreProducts = async () => {
        if (!nextUrl || loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await axiosConfig.get(nextUrl);
            onProductsChange(prev => [...prev, ...res.data.results]);
            setNextUrl(res.data.next || null);
        } catch (err) {
            console.error("loadMoreProducts", err);
        } finally {
            setLoadingMore(false);
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                !loadingMore &&
                nextUrl
            ) {
                loadMoreProducts();
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [nextUrl, loadingMore]);

    async function fetchSubcategories(categoryId) {
        if (!categoryId) return;
        try {
            const res = await axiosConfig.get(`/catlog/sub-categories/?category=${categoryId}`);
            setSubCategoryProducts(res.data.results || []);
        } catch (err) {
            console.error("fetchSubcategories", err);
        }
    }

    async function fetchFilterData() {
        try {
            const res = await axiosConfig.get(`/catlog/variants/?page=1&page_size=30`);
            setFilterData(res.data.results || []);
        } catch (err) {
            console.error("fetchFilterData", err);
        }
    }

    async function fetchVariantOptions(variantId) {
        try {
            setSelectedVariantId(variantId);
            const res = await axiosConfig.get(`/catlog/variantoptions/?variant_type=${variantId}`);
            setVariantOptions(res.data.results || []);
        } catch (err) {
            console.error("fetchVariantOptions", err);
            setVariantOptions([]);
        }
    }

    const buildOptionString = (optsObj) =>
        Object.values(optsObj).flat().map((o) => o.name).join(",");

    async function applyFilters() {
        try {
            onLoading(true);
            const selectedCategory = friendlyData?.product_data?.name || "";
            const optionNames = buildOptionString(selectedOptions);
            let priceMin = "";
            let priceMax = "";

            if (selectedPriceRanges.length > 0) {
                const allMins = selectedPriceRanges.map(r => Number(r.min));
                const allMaxs = selectedPriceRanges.map(r => Number(r.max));

                priceMin = Math.min(...allMins);
                priceMax = Math.max(...allMaxs);
            }
            setAppliedFilters({
                options: selectedOptions,
                price: selectedPriceRanges,
            });
            setSearchParams({
                options: optionNames || "",
                price_min: priceMin || "",
                price_max: priceMax || "",
            });

            const res = await axiosConfig.get(
                `/catlog/category-variants/?listing_type=${categoryurl}&search=&category=${selectedCategory}&price_min=${priceMin}&price_max=${priceMax}&options=${encodeURIComponent(optionNames)}`
            );

            onProductsChange(res.data.results || []);
            setShowFilter(false);
        } catch (err) {
            console.error("applyFilters", err);
        } finally {
            onLoading(false);
        }
    }

    async function applySubCategoryFilter() {
        try {
            onLoading(true);
            const selectedCategory = friendlyData?.product_data?.name || "";
            const optionNames = buildOptionString(selectedOptions);
            const subcatParam = selectedSubcats.join(",");
            let priceMin = "";
            let priceMax = "";


            if (selectedPriceRanges.length > 0) {
                const allMins = selectedPriceRanges.map(range => range.min).filter(min => min !== "");
                const allMaxs = selectedPriceRanges.map(range => range.max).filter(max => max !== "");

                priceMin = allMins.length > 0 ? Math.min(...allMins) : "";
                priceMax = allMaxs.length > 0 ? Math.max(...allMaxs) : "";
            }
            setSearchParams({
                subcategory: subcatParam || "",
                options: optionNames || "",
                price_min: priceMin || "",
                price_max: priceMax || "",
            });

            const res = await axiosConfig.get(
                `/catlog/category-variants/?listing_type=${categoryurl}&search=&category=${selectedCategory}&subcategory=${encodeURIComponent(subcatParam)}&price_min=${priceMin}&price_max=${priceMax}&options=${encodeURIComponent(optionNames)}`
            );

            onProductsChange(res.data.results || []);
        } catch (err) {
            console.error("applySubCategoryFilter", err);
        } finally {
            onLoading(false);
        }
    }

    async function handleSortChange(label) {
        try {
            setActiveSort(label);
            onLoading(true);
            const selectedCategory = friendlyData?.product_data?.name || "";
            setSearchParams((p) => {
                const next = Object.fromEntries([...p]);
                next.collection = selectedCategory || "";
                next.sortBy = label;
                return next;
            });

            const res = await axiosConfig.get(
                `/catlog/category-variants/?listing_type=${categoryurl}&search=&category=${selectedCategory}&sortBy=${encodeURIComponent(label)}`
            );

            onProductsChange(res.data.results || []);
        } catch (err) {
            console.error("handleSortChange", err);
        } finally {
            onLoading(false);
        }
    }

    function handleOptionSelect(variantId, optionId, optionName, isChecked) {
        setSelectedOptions((prev) => {
            const next = { ...prev };
            if (isChecked) {
                next[variantId] = [...(next[variantId] || []), { id: optionId, name: optionName }];
            } else {
                next[variantId] = (next[variantId] || []).filter((o) => o.id !== optionId);
                if ((next[variantId] || []).length === 0) delete next[variantId];
            }
            return next;
        });
    }

    const handlePriceRangeSelect = (rangeId, min, max, isChecked) => {
        setSelectedPriceRanges(prev => {
            if (isChecked) {
                return [...prev, { id: rangeId, min, max }];
            } else {
                return prev.filter(range => range.id !== rangeId);
            }
        });
    };
    function handleCategoryClick(slug, id) {
        if (slug !== friendlyurl) {
            navigate(`/${categoryurl}/${slug}`);
        }
        fetchSubcategories(id);
    }
    async function fetchProductsFromURL() {
        try {
            onLoading(true);

            const selectedCategory = friendlyData?.product_data?.slug || friendlyData?.product_data?.name || "";
            const priceMin = params.get("price_min") || "";
            const priceMax = params.get("price_max") || "";
            const options = params.get("options") || "";
            const subcategory = params.get("subcategory") || "";

            const res = await axiosConfig.get(
                `/catlog/category-variants/?listing_type=${categoryurl}&search=&category=${selectedCategory}&subcategory=${encodeURIComponent(subcategory)}&price_min=${priceMin}&price_max=${priceMax}&options=${encodeURIComponent(options)}`
            );

            onProductsChange(res.data.results || []);
        } catch (err) {
            console.error("fetchProductsFromURL", err);
        } finally {
            onLoading(false);
        }
    }

    // useEffect(() => {
    //     fetchCategories();
    //     fetchFilterData();

    //     const hasFilters =
    //         params.get("price_min") ||
    //         params.get("price_max") ||
    //         params.get("options") ||
    //         params.get("subcategory");

    //     if (hasFilters) {
    //         fetchProductsFromURL();
    //     } else {
    //         fetchInitialProducts();
    //     }

    //     if (friendlyData?.product_data?.id) {
    //         fetchSubcategories(friendlyData.product_data.id);
    //     }

    //     if (category.length > 0 && friendlyurl) {
    //         const activeCategory = category.find(cat => cat.slug === friendlyurl);
    //         if (activeCategory) {
    //             fetchSubcategories(activeCategory.id);
    //         }
    //     }
    // }, [friendlyData, categoryurl]);
    useEffect(() => {
        fetchCategories();
        fetchFilterData();

        // ✅ Read filters from URL
        const price_min = params.get("price_min");
        const price_max = params.get("price_max");
        const optionsParam = params.get("options");
        const subcategoryParam = params.get("subcategory");

        const filtersFromURL = {};

        // ✅ Handle price range
        if (price_min && price_max) {
            filtersFromURL.price = [{ min: Number(price_min), max: Number(price_max) }];
            setSelectedPriceRanges([{ id: 1, min: Number(price_min), max: Number(price_max) }]);
        }

        // ✅ Handle options (comma separated list like "Red,Large")
        if (optionsParam) {
            const optionNames = decodeURIComponent(optionsParam).split(",").filter(Boolean);
            // Convert to state format: { randomId: [{ name: "Red" }, { name: "Large" }] }
            const optionsObj = {};
            if (optionNames.length > 0) {
                optionsObj["fromURL"] = optionNames.map((name, i) => ({ id: i + 1, name }));
            }
            filtersFromURL.options = optionsObj;
            setSelectedOptions(optionsObj);
        }

        // ✅ Save to state
        setAppliedFilters(filtersFromURL);

        // ✅ Load filtered products if any URL filters exist
        const hasFilters = price_min || price_max || optionsParam || subcategoryParam;
        if (hasFilters) {
            fetchProductsFromURL();
        } else {
            fetchInitialProducts();
        }

        // ✅ Fetch subcategories for active category
        if (friendlyData?.product_data?.id) {
            fetchSubcategories(friendlyData.product_data.id);
        }

        if (category.length > 0 && friendlyurl) {
            const activeCategory = category.find(cat => cat.slug === friendlyurl);
            if (activeCategory) {
                fetchSubcategories(activeCategory.id);
            }
        }
    }, [friendlyData, categoryurl]);

useEffect(() => {
  const price_min = searchParams.get("price_min");
  const price_max = searchParams.get("price_max");
  const subcategoryParam = searchParams.get("subcategory");
  const optionsParam = searchParams.get("options");

  // Price from URL
  if (price_min && price_max) {
    const min = Number(price_min);
    const max = Number(price_max);
    const matched = priceRanges.find(r => r.min === min && r.max === max);
    setSelectedPriceRanges(matched ? [matched] : [{ id: 999, min, max, label: `₹${min} - ₹${max}` }]);
  }

  // Subcategories from URL
  if (subcategoryParam) {
    const selectedSubcatsFromURL = decodeURIComponent(subcategoryParam).split(",").filter(Boolean);
    setSelectedSubcats(selectedSubcatsFromURL);
  }

  // Options from URL
  if (optionsParam) {
    try {
      const decodedOptions = JSON.parse(decodeURIComponent(optionsParam));
      setSelectedOptions(decodedOptions);
    } catch {
      console.warn("Invalid options format in URL");
    }
  }

  fetchProductsFromURL();
}, []);

    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).replace("$", "$ ");
const handleRemoveFilter = (type, value) => {
  const params = new URLSearchParams(searchParams);

  if (type === "price") {
    setSelectedPriceRanges([]);
    setAppliedFilters(prev => ({ ...prev, price: [] }));
    params.delete("price_min");
    params.delete("price_max");
  }

  if (type === "subcategory") {
    const current = decodeURIComponent(params.get("subcategory") || "").split(",").filter(Boolean);
    const updated = current.filter(item => item !== value);
    setSelectedSubcats(updated);
    if (updated.length) params.set("subcategory", encodeURIComponent(updated.join(",")));
    else params.delete("subcategory");
  }

  if (type === "option") {
    const updatedOptions = { ...selectedOptions };
    Object.keys(updatedOptions).forEach(key => {
      updatedOptions[key] = updatedOptions[key].filter(opt => opt.name !== value);
      if (updatedOptions[key].length === 0) delete updatedOptions[key];
    });
    setSelectedOptions(updatedOptions);
    setAppliedFilters(prev => ({ ...prev, options: updatedOptions }));

    if (Object.keys(updatedOptions).length)
      params.set("options", encodeURIComponent(JSON.stringify(updatedOptions)));
    else params.delete("options");
  }

  setSearchParams(params);
  applyFilters();
};


    return (
        <>
            <div className="carousel-container">
                {/* <button
                    className="scroll-btn left"
                    onClick={() => carouselRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                >
                    <IoChevronBack className="arrow-icons" />
                </button> */}

                {
                    !isSearchPage ? (
                        <div className="carousel" ref={carouselRef}>
                            {category.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`category-item ${friendlyurl === cat.slug ? "active" : ""}`}
                                    onClick={() => handleCategoryClick(cat.slug, cat.id)}
                                >
                                    {cat.name}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="searched-data"><span className="search-query">{query}</span> <span className="ms-2 search-count">{products.length} Items</span></div>
                    )
                }

                {/* <button
                    className="scroll-btn right"
                    onClick={() => carouselRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                >
                    <IoChevronForward className="arrow-icons" />
                </button> */}
            </div>

            <div className="filter-sections">
  <div className="applied-filters">
    <p className="applied-filter">Applied Filters:</p>

    {selectedSubcats.map((sub) => (
      <span key={sub} className="filter-tags">
        {sub}
        <span className="remove-icon" onClick={() => handleRemoveFilter("subcategory", sub)}>×</span>
      </span>
    ))}

    {selectedPriceRanges.map((p) => (
      <span key={`${p.min}-${p.max}`} className="filter-tags">
        ₹{p.min} - ₹{p.max}
        <span className="remove-icon" onClick={() => handleRemoveFilter("price", `${p.min}-${p.max}`)}>×</span>
      </span>
    ))}

    {Object.values(selectedOptions).flat().map((opt) => (
      <span key={opt.name} className="filter-tags">
        {opt.name}
        <span className="remove-icon" onClick={() => handleRemoveFilter("option", opt.name)}>×</span>
      </span>
    ))}
  </div>
</div>


            <div className="filter-section">
                <div className="filters-left">
                    <div className="filter">FILTER</div>

                    <div className="filter-box">
                        Sub-Category
                        <div className="dropdown">
                            {subcategoryProducts.length > 0 ? (
                                subcategoryProducts.map((item) => (
                                    <label key={item.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSubcats.includes(item.name)}
                                            onChange={(e) =>
                                                setSelectedSubcats((prev) =>
                                                    e.target.checked ? [...prev, item.name] : prev.filter((n) => n !== item.name)
                                                )
                                            }
                                        />
                                        {item.name}
                                    </label>
                                ))
                            ) : (
                                <div className="d-flex justify-content-center">No subcategories</div>
                            )}
                            {
                                subcategoryProducts.length > 0 && (
                                    <div className="confirm-btn">
                                        <button onClick={applySubCategoryFilter}>CONFIRM</button>
                                    </div>)
                            }
                        </div>
                        <IoArrowDown />
                    </div>

                    <div className="filter-box">
                        Price Range
                        <div className="dropdown">
                            {/* Pre-defined price ranges with checkboxes */}
                            {priceRanges.map((range) => (
                                <label key={range.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPriceRanges.some(r => r.id === range.id)}
                                        onChange={(e) => handlePriceRangeSelect(range.id, range.min, range.max, e.target.checked)}
                                    />
                                    {range.label}
                                </label>
                            ))}

                            <div className="confirm-btn">
                                <button onClick={applyFilters}>APPLY PRICE FILTER</button>
                            </div>
                        </div>
                        <IoArrowDown />
                    </div>
                    <div className="filter-box" onClick={() => setShowFilter(true)}>
                        More Options
                        <div>
                            <IoArrowForward />
                        </div>
                    </div>
                </div>

                <div className="sort-right">
                    <div className="sortby">SORT BY</div>
                    <div className="filter-box sort-box">
                        {activeSort}
                        <div className="dropdown">
                            {Object.keys(sort_map).map((label) => (
                                <div
                                    key={label}
                                    className={`sort-option ${activeSort === label ? "active" : ""}`}
                                    onClick={() => handleSortChange(label)}
                                >
                                    {label}
                                    {activeSort === label && <FaCheck />}
                                </div>
                            ))}
                        </div>
                        <FaCheck />
                    </div>
                </div>
            </div>

            <FilterOptions
                show={showFilter}
                onClose={() => setShowFilter(false)}
                filterData={filterData}
                variantOptions={variantOptions}
                selectedVariantId={selectedVariantId}
                selectedOptions={selectedOptions}
                onVariantClick={fetchVariantOptions}
                onOptionSelect={handleOptionSelect}
                onClearAll={() => {
                    setSelectedOptions({});
                    setVariantOptions([]);
                    setSelectedVariantId(null);
                }}
                onApplyFilters={applyFilters}
            />
        </>
    );
}

export default FilterSection;
