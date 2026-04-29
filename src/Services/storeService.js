import axiosConfig from "./axiosConfig";

let storeRequest = null;

const STORE_ID_KEY = "store_id";

function getSavedStoreId() {
  return localStorage.getItem(STORE_ID_KEY);
}

function saveStoreId(storeId) {
  if (!storeId) return "";
  const normalizedStoreId = String(storeId);
  localStorage.setItem(STORE_ID_KEY, normalizedStoreId);
  return normalizedStoreId;
}

function pickStoreId(stores = []) {
  const activeStores = stores.filter((store) => !store.is_suspended);
  const selectedStore = activeStores.find((store) => store.is_default) || activeStores[0];
  return selectedStore?.id ? String(selectedStore.id) : "";
}

export async function getActiveStoreId() {
  const savedStoreId = getSavedStoreId();
  if (savedStoreId) return savedStoreId;

  if (!storeRequest) {
    storeRequest = axiosConfig
      .get("/stores/stores/?page=1&page_size=50&is_suspended=false")
      .then((res) => {
        const storeId = pickStoreId(res?.data?.results || []);
        return saveStoreId(storeId);
      })
      .catch((error) => {
        console.error("getActiveStoreId", error);
        return "";
      })
      .finally(() => {
        storeRequest = null;
      });
  }

  return storeRequest;
}

export function setActiveStoreId(storeId) {
  return saveStoreId(storeId);
}
