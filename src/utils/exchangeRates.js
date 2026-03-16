const STORAGE_KEY = "roi_exchange_rates";
const STORAGE_TIMESTAMP = "roi_exchange_rates_timestamp";

const FALLBACK_RATES = {
  THB: 1,
  EUR: 0.026,
  USD: 0.029,
  ILS: 0.107,
};

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchExchangeRates() {
  try {
    const cachedRates = localStorage.getItem(STORAGE_KEY);
    const cachedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP);

    if (cachedRates && cachedTimestamp) {
      const age = Date.now() - parseInt(cachedTimestamp, 10);

      if (age < CACHE_DURATION) {
        return JSON.parse(cachedRates);
      }
    }

    const res = await fetch(
      "https://api.exchangerate.host/latest?base=THB&symbols=EUR,USD,ILS"
    );

    const data = await res.json();

    const rates = {
      THB: 1,
      EUR: data.rates.EUR,
      USD: data.rates.USD,
      ILS: data.rates.ILS,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    localStorage.setItem(STORAGE_TIMESTAMP, Date.now().toString());

    return rates;
  } catch (err) {
    console.warn("Exchange rate API failed, using fallback.", err);
    return FALLBACK_RATES;
  }
}