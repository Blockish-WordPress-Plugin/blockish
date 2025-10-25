import { useEffect, useRef, useState } from "react";
import apiFetch from "@wordpress/api-fetch";

export function useProgressiveJSON(url, batchSize = 1, delay = 0) {
  const [data, setData] = useState([]);
  const cache = useRef(new Map());
  const controller = useRef(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    controller.current = new AbortController();

    async function fetchAndProcess() {
      // Skip if already cached
      if (cache.current.has(url)) {
        setData(cache.current.get(url));
        return;
      }

      try {
        const isWP = url.startsWith("/wp-json/") || !url.startsWith("http");
        const jsonData = isWP
          ? await apiFetch({ path: url, signal: controller.current.signal })
          : await fetch(url, { signal: controller.current.signal }).then((r) =>
              r.json()
            );

        // Ensure it's an array (batchable)
        const arrayData = Array.isArray(jsonData)
          ? jsonData
          : jsonData?.items || Object.values(jsonData);

        let currentBatch = [];

        for (let i = 0; i < arrayData.length; i++) {
          currentBatch.push(arrayData[i]);

          if (
            currentBatch.length >= batchSize ||
            i === arrayData.length - 1
          ) {
            // Add new batch to cache and trigger update
            cache.current.set(url, [
              ...(cache.current.get(url) || []),
              ...currentBatch,
            ]);
            setData(cache.current.get(url));

            currentBatch = [];

            if (delay > 0) {
              await new Promise((r) => setTimeout(r, delay));
            }

            if (cancelled) break;
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch JSON:", url, err);
        }
      }
    }

    fetchAndProcess();

    return () => {
      cancelled = true;
      controller.current?.abort();
    };
  }, [url, batchSize, delay]);

  return data;
}
